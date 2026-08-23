from fastapi import APIRouter, Depends
from typing import Optional
from ..database import SupabaseRepository, get_db
from .common import product_response
router = APIRouter(prefix="/products", tags=["Products"])
@router.get("")
@router.get("/")
def get_products(search: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None, db: SupabaseRepository = Depends(get_db)):
    inspections = db.select("inspections", order="created_at")
    products = [product_response(row, inspections) for row in db.select("products")]
    def matches(product):
        return (not search or search.lower() in f"{product['name']} {product['brand']}".lower()) and (not category or category.lower() in product["category"].lower()) and (not status or product["latest_status"] == status)
    return [product for product in products if matches(product)]
