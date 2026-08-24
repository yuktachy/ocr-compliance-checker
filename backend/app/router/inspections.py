from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from pathlib import Path
import shutil
from uuid import uuid4
from base64 import b64decode
from binascii import Error as Base64DecodeError
from urllib.parse import unquote_to_bytes
from ..database import SupabaseRepository, get_db
from ..schemas import InspectionCreate, InspectionUpdate
from .common import database_status, inspection_response
from ..extraction.exceptions import OCRFailedError
from ..services.ml_analysis import analyse_image

router = APIRouter(prefix="/inspections", tags=["Inspections"])
INSPECTION_COLUMNS = "*,products(*),violations(*,rules(*))"
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "upload"

@router.get("/")
def get_inspections(search: Optional[str] = None, status: Optional[str] = None, location: Optional[str] = None, category: Optional[str] = None, dateFrom: Optional[str] = None, dateTo: Optional[str] = None, db: SupabaseRepository = Depends(get_db)):
    items = [inspection_response(row) for row in db.select("inspections", columns=INSPECTION_COLUMNS, order="created_at")]
    def matches(item):
        text = " ".join(str(item.get(k, "")) for k in ("id", "product_name", "brand", "manufacturer", "retailer")).lower()
        return (not search or search.lower() in text) and (not status or item["status"] == status) and (not location or location.lower() in item["location"].lower()) and (not category or category.lower() in item["category"].lower()) and (not dateFrom or item["created_at"] >= dateFrom) and (not dateTo or item["created_at"] <= dateTo)
    return [item for item in items if matches(item)]

@router.get("/{id}")
def get_inspection_by_id(id: str, db: SupabaseRepository = Depends(get_db)):
    item = db.get("inspections", id)
    if not item: raise HTTPException(404, f"Inspection {id} not found")
    # Fetch the embedded relations only for Supabase; fallback is already complete.
    if "product_name" not in item:
        try: item = db.client.table("inspections").select(INSPECTION_COLUMNS).eq("id", id).single().execute().data
        except Exception: pass
    return inspection_response(item)

def _save_uploaded_image(upload) -> Path:
    extension = Path(upload.filename or "package.jpg").suffix.lower() or ".jpg"
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(422, "Upload a JPEG, PNG, or WebP package image.")
    target = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    with target.open("wb") as handle:
        shutil.copyfileobj(upload.file, handle)
    return target


def _local_upload_path(image_url: str | None) -> Path | None:
    if not image_url or not image_url.startswith("/upload/"):
        return None
    path = (UPLOAD_DIR / image_url.removeprefix("/upload/")).resolve()
    return path if path.parent == UPLOAD_DIR.resolve() and path.is_file() else None


def _save_data_url(image_url: str | None) -> Path | None:
    """Persist legacy browser data URLs so JSON clients also reach the ML model."""
    if not image_url or not image_url.startswith("data:image/") or "," not in image_url:
        return None
    header, encoded = image_url.split(",", 1)
    mime = header[5:].split(";", 1)[0].lower()
    extension = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp"}.get(mime)
    if not extension:
        raise HTTPException(422, "Use a JPEG, PNG, or WebP package image.")
    try:
        content = b64decode(encoded, validate=True) if ";base64" in header else unquote_to_bytes(encoded)
    except (ValueError, Base64DecodeError) as exc:
        raise HTTPException(422, "The package image data is invalid.") from exc
    if not content:
        raise HTTPException(422, "The package image is empty.")
    target = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    target.write_bytes(content)
    return target


def _create_inspection(values: dict, db: SupabaseRepository):
    # query.sql owns IDs/timestamps; only insert columns defined by that schema.
    product = db.insert("products", {"name": values["product_name"], "category": values.get("category"), "brand": values.get("brand"), "image_path": values.get("image_url")})
    extracted = {"declarations": values.get("declarations") or {}, "readability": values.get("readability") or {}, "manufacturer": values.get("manufacturer"), "retailer": values.get("retailer"), "location": values.get("location")}
    created = db.insert("inspections", {"product_id": product["id"], "image_path": values.get("image_url") or "", "extracted_json": extracted, "overall_confidence": values.get("overall_confidence"), "status": database_status(values.get("status"))})
    for violation in values.get("violations") or []:
        db.insert("violations", {"inspection_id": created["id"], "field_name": violation.get("field"), "expected": violation.get("expected"), "found": violation.get("actual"), "severity": violation.get("severity"), "explanation": violation.get("description")})
    return inspection_response({**created, "products": product, "violations": []})


@router.post("/", status_code=201)
async def create_inspection(request: Request, db: SupabaseRepository = Depends(get_db)):
    """Create an inspection only after running the submitted image through ML.

    Accepts JSON for API clients with an already-uploaded ``/upload/...`` image
    and multipart form data for the browser's normal image-upload workflow.
    """
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        raw_values = form.get("inspection")
        if not raw_values:
            raise HTTPException(422, "Missing inspection metadata.")
        try:
            values = InspectionCreate.model_validate_json(str(raw_values)).model_dump()
        except ValueError as exc:
            raise HTTPException(422, "Inspection metadata is invalid.") from exc
        image = form.get("image")
        if not getattr(image, "filename", None):
            raise HTTPException(422, "A package image is required for ML analysis.")
        image_path = _save_uploaded_image(image)
    else:
        try:
            values = InspectionCreate.model_validate(await request.json()).model_dump()
        except ValueError as exc:
            raise HTTPException(422, "Inspection payload is invalid.") from exc
        image_path = _local_upload_path(values.get("image_url")) or _save_data_url(values.get("image_url"))
        if image_path is None:
            raise HTTPException(422, "Use multipart upload, an image data URL, or an existing /upload image URL for ML analysis.")

    try:
        ml_result, annotated_url = analyse_image(image_path, UPLOAD_DIR)
    except OCRFailedError as exc:
        raise HTTPException(422, f"ML analysis failed: {exc}") from exc
    except Exception as exc:
        raise HTTPException(503, "ML analysis is temporarily unavailable.") from exc

    # Model output is authoritative; supplied text remains a fallback where
    # OCR cannot reliably infer contextual inspection details.
    values.update({key: value for key, value in ml_result.items() if value is not None})
    values["image_url"] = annotated_url
    return _create_inspection(values, db)

@router.put("/{id}")
def update_inspection(id: str, payload: InspectionUpdate, db: SupabaseRepository = Depends(get_db)):
    current = db.get("inspections", id)
    if not current: raise HTTPException(404, f"Inspection {id} not found")
    values = payload.model_dump(exclude_none=True)
    changes = {key: values[key] for key in ("status", "overall_confidence") if key in values}
    if "status" in changes: changes["status"] = database_status(changes["status"])
    if any(key in values for key in ("declarations", "violations", "readability", "manufacturer", "retailer", "location")):
        extracted = dict(current.get("extracted_json") or {})
        extracted.update({key: values[key] for key in ("declarations", "readability", "manufacturer", "retailer", "location") if key in values})
        changes["extracted_json"] = extracted
    if not changes: return inspection_response(current)
    return inspection_response(db.update("inspections", id, changes))

@router.delete("/{id}")
def delete_inspection(id: str, db: SupabaseRepository = Depends(get_db)):
    if not db.get("inspections", id): raise HTTPException(404, f"Inspection {id} not found")
    db.delete("inspections", id)
    return {"success": True, "message": f"Inspection {id} deleted successfully."}
