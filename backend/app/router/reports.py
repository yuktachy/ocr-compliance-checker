from fastapi import APIRouter, Depends, HTTPException
from ..database import SupabaseRepository, get_db
from ..schemas import ReportCreate
router = APIRouter(prefix="/reports", tags=["Reports"])
@router.get("")
@router.get("/")
def get_reports(db: SupabaseRepository = Depends(get_db)):
    inspections = {row["id"]: row for row in db.select("inspections")}
    return [{"id": row["id"], "inspection_id": row["inspection_id"], "product_name": "", "status": inspections.get(row["inspection_id"], {}).get("status", "pending"), "generated_at": row.get("generated_at", ""), "pdf_url": row.get("file_path"), "summary": f"{row.get('format') or 'json'} report"} for row in db.select("reports", order="generated_at")]
@router.post("")
@router.post("/", status_code=201)
def generate_report(payload: ReportCreate, db: SupabaseRepository = Depends(get_db)):
    if not db.get("inspections", payload.inspection_id): raise HTTPException(404, f"Inspection {payload.inspection_id} not found")
    return db.insert("reports", {"inspection_id": payload.inspection_id, "format": "json", "file_path": None})

@router.delete("/{id}")
def delete_report(id: str, db: SupabaseRepository = Depends(get_db)):
    if not db.get("reports", id):
        raise HTTPException(404, f"Report {id} not found")
    db.delete("reports", id)
    return {"success": True}
