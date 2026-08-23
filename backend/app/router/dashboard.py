from fastapi import APIRouter, Depends
from ..database import SupabaseRepository, get_db
from .common import inspection_response
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
@router.get("/stats")
def get_dashboard_stats(db: SupabaseRepository = Depends(get_db)):
    items = [inspection_response(row) for row in db.select("inspections", columns="*,products(*),violations(*,rules(*))", order="created_at")]
    total = len(items); statuses = {name: sum(i["status"] == name for i in items) for name in ("compliant", "violation", "needs-verification")}
    categories = {"MRP": 0, "Missing Declarations": 0, "Font / Readability": 0, "Net Quantity": 0, "Manufacturer Details": 0, "Consumer Care": 0}; locations = {}
    for item in items:
        locations[item["location"] or "Unknown"] = locations.get(item["location"] or "Unknown", 0) + 1
        for violation in item["violations"]: categories[violation["category"]] = categories.get(violation["category"], 0) + 1
    pct = lambda count: round(count * 100 / total, 1) if total else 0.0
    return {"totalInspections": total, "compliant": {"count": statuses["compliant"], "percentage": pct(statuses["compliant"])}, "potentialViolations": {"count": statuses["violation"], "percentage": pct(statuses["violation"])}, "needsVerification": {"count": statuses["needs-verification"], "percentage": pct(statuses["needs-verification"])}, "violationTypeCounts": categories, "locationCounts": locations, "recentInspections": items[:6]}
