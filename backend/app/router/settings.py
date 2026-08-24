from fastapi import APIRouter, HTTPException
from ..schemas import SettingsResponse
router = APIRouter(prefix="/settings", tags=["Settings"])
@router.get("/")
def get_settings():
    raise HTTPException(501, "Settings are unavailable: query.sql does not define a settings table.")
@router.put("")
@router.put("/")
def update_settings(payload: SettingsResponse):
    raise HTTPException(501, "Settings are unavailable: query.sql does not define a settings table.")
