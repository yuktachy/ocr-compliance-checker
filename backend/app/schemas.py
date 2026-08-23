from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class BBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class DeclarationItem(BaseModel):
    value: str
    confidence: float
    status: str  # compliant | violation | needs-verification
    bbox: Optional[BBox] = None
    legal_ref: Optional[str] = None

class ReadabilityMetrics(BaseModel):
    font_size_pt: float = 8.5
    contrast_ratio: float = 4.5
    height_mm: float = 3.0
    compliant: bool = True

class ViolationItem(BaseModel):
    id: str
    rule: str           # e.g. "Rule 6(1)(f)"
    category: str       # e.g. "MRP", "Missing Declarations", "Font / Readability", "Net Quantity", "Manufacturer Details", "Consumer Care"
    severity: str       # critical | major | minor
    field: str
    expected: str
    actual: str
    description: str

class MandatoryDeclarations(BaseModel):
    mrp: DeclarationItem
    net_quantity: DeclarationItem
    manufacturer: DeclarationItem
    mfg_date: DeclarationItem
    consumer_care: DeclarationItem
    country_of_origin: DeclarationItem

class InspectionBase(BaseModel):
    product_name: str
    brand: Optional[str] = "Generic Brand"
    category: str = "Food & Beverages"
    manufacturer: Optional[str] = None
    retailer: Optional[str] = "Supermart Store"
    location: str = "Chennai"
    image_url: Optional[str] = "/upload/sample_package.jpg"
    declarations: Optional[Dict[str, Any]] = None
    violations: Optional[List[Dict[str, Any]]] = []
    readability: Optional[Dict[str, Any]] = None
    status: str = "needs-verification"  # compliant | violation | needs-verification
    overall_confidence: float = 0.88

class InspectionCreate(InspectionBase):
    id: Optional[str] = None

class InspectionUpdate(BaseModel):
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    retailer: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    declarations: Optional[Dict[str, Any]] = None
    violations: Optional[List[Dict[str, Any]]] = None
    readability: Optional[Dict[str, Any]] = None
    overall_confidence: Optional[float] = None

class InspectionResponse(InspectionBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class StatCountPercentage(BaseModel):
    count: int
    percentage: float

class DashboardStatsResponse(BaseModel):
    totalInspections: int
    compliant: StatCountPercentage
    potentialViolations: StatCountPercentage
    needsVerification: StatCountPercentage
    violationTypeCounts: Dict[str, int]
    locationCounts: Dict[str, int]
    recentInspections: List[InspectionResponse]

class ProductResponse(BaseModel):
    id: str
    name: str
    category: str
    brand: str
    manufacturer: str
    total_inspections: int
    compliant_count: int
    violation_count: int
    latest_status: str
    image_url: str
    last_inspected: str

class ReportCreate(BaseModel):
    inspection_id: str
    notes: Optional[str] = ""

class ReportResponse(BaseModel):
    id: str
    inspection_id: str
    product_name: str
    status: str
    generated_at: str
    pdf_url: Optional[str] = None
    summary: str

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    read: bool
    type: str  # info | warning | success | danger

class SettingsResponse(BaseModel):
    ocr_confidence_threshold: float = 0.75
    font_size_min_mm: float = 1.0
    auto_flag_violations: bool = True
    location_default: str = "Chennai"
    inspector_name: str = "Legal Metrology Inspector #104"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    avatar_url: Optional[str] = None
