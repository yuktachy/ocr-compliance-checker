from fastapi import APIRouter, HTTPException
router = APIRouter(prefix="/notifications", tags=["Notifications"])
@router.get("")
@router.get("/")
def get_notifications():
    raise HTTPException(501, "Notifications are unavailable: query.sql does not define a notifications table.")
@router.post("/mark-read")
def mark_all_read():
    raise HTTPException(501, "Notifications are unavailable: query.sql does not define a notifications table.")
