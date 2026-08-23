from fastapi import APIRouter
from ..schemas import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me", response_model=UserResponse)
def get_current_user():
    return UserResponse(
        id="USR-1042",
        name="Officer Rajesh Kumar",
        email="rajesh.kumar@legalmetrology.gov.in",
        role="Senior Legal Metrology Inspector",
        department="Department of Consumer Affairs, Govt of India",
        avatar_url="/upload/officer_avatar.jpg"
    )
