from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from ..database import SupabaseRepository, get_db
from ..schemas import InspectionCreate, InspectionUpdate
from .common import database_status, inspection_response

router = APIRouter(prefix="/inspections", tags=["Inspections"])
INSPECTION_COLUMNS = "*,products(*),violations(*,rules(*))"

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

@router.post("/", status_code=201)
def create_inspection(payload: InspectionCreate, db: SupabaseRepository = Depends(get_db)):
    # query.sql owns IDs/timestamps; only insert columns defined by that schema.
    values = payload.model_dump()
    product = db.insert("products", {"name": values["product_name"], "category": values.get("category"), "brand": values.get("brand"), "image_path": values.get("image_url")})
    extracted = {"declarations": values.get("declarations") or {}, "readability": values.get("readability") or {}, "manufacturer": values.get("manufacturer"), "retailer": values.get("retailer"), "location": values.get("location")}
    created = db.insert("inspections", {"product_id": product["id"], "image_path": values.get("image_url") or "", "extracted_json": extracted, "overall_confidence": values.get("overall_confidence"), "status": database_status(values.get("status"))})
    for violation in values.get("violations") or []:
        db.insert("violations", {"inspection_id": created["id"], "field_name": violation.get("field"), "expected": violation.get("expected"), "found": violation.get("actual"), "severity": violation.get("severity"), "explanation": violation.get("description")})
    return inspection_response({**created, "products": product, "violations": []})

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
