"""
Shared contract between the ML pipeline (extraction/extractor.py) and the
FastAPI backend (routes/upload.py).

Owned jointly — either teammate can propose changes, but both must agree
before editing, since both sides import and depend on this file directly.

Location in repo: backend/app/schemas/extraction.py
"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class FieldWithConfidence(BaseModel):
    """Base pattern: every extracted field carries its own confidence score
    and the raw OCR text it was parsed from, so the rules engine and the
    human-review UI can distinguish 'field not found' from 'field found but
    low confidence' from 'field found and violates a rule'."""
    confidence: float = Field(..., ge=0.0, le=1.0)


class MRP(FieldWithConfidence):
    value: float
    currency: str = "INR"
    inclusive_of_taxes: Optional[bool] = None
    raw_text: str


class NetQuantity(FieldWithConfidence):
    value: float
    unit: str  # e.g. "g", "kg", "ml", "l", "N", "units"
    raw_text: str


class Manufacturer(FieldWithConfidence):
    name: str
    address: Optional[str] = None


class ConsumerCare(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class ExtractionMetadata(BaseModel):
    ocr_engine: str  # "paddleocr" | "tesseract" | "stub"
    language_detected: list[str] = []
    processing_time_ms: Optional[int] = None
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    fields_missing: list[str] = []


class ExtractedLabelInfo(BaseModel):
    """The single return type of process_image(). This is the contract —
    if this shape changes, both ML and backend code need updating together."""

    product_name: Optional[str] = None

    # required — the rules engine cannot run a compliance check without these
    mrp: MRP
    net_quantity: NetQuantity
    manufacturer: Manufacturer

    packer: Optional[Manufacturer] = None
    importer: Optional[Manufacturer] = None
    country_of_origin: Optional[str] = None
    consumer_care: Optional[ConsumerCare] = None

    mfg_date: Optional[date] = None
    expiry_date: Optional[date] = None
    batch_number: Optional[str] = None
    unit_sale_price: Optional[float] = None
    fssai_license: Optional[str] = None

    extraction_metadata: ExtractionMetadata


# ---------------------------------------------------------------------------
# Example instances — hand these to the backend teammate on Day 1 morning so
# she can build routes, DB writes, and the rules engine against real-shaped
# data before your real process_image() is ready.
# ---------------------------------------------------------------------------

EXAMPLE_CLEAN = ExtractedLabelInfo(
    product_name="ABC Biscuits",
    mrp=MRP(value=50.0, raw_text="MRP Rs.50.00", confidence=0.96),
    net_quantity=NetQuantity(value=100.0, unit="g", raw_text="100 g", confidence=0.93),
    manufacturer=Manufacturer(
        name="ABC Foods Pvt. Ltd.",
        address="Industrial Area, Chennai, TN",
        confidence=0.88,
    ),
    mfg_date="2026-08-01",
    batch_number="A12834",
    extraction_metadata=ExtractionMetadata(
        ocr_engine="paddleocr", overall_confidence=0.92, fields_missing=[]
    ),
)

EXAMPLE_NEEDS_REVIEW = ExtractedLabelInfo(
    product_name="XYZ Detergent",
    mrp=MRP(value=120.0, raw_text="MRP: 120", confidence=0.71),
    net_quantity=NetQuantity(value=1.0, unit="kg", raw_text="1kg", confidence=0.65),
    manufacturer=Manufacturer(name="XYZ Ltd.", confidence=0.40),  # low confidence, no address found
    extraction_metadata=ExtractionMetadata(
        ocr_engine="paddleocr",
        overall_confidence=0.58,
        fields_missing=["consumer_care", "mfg_date"],
    ),
)
