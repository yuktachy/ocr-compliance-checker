"""Orchestrator: image path -> ExtractedLabelInfo.

This is the ONE function the backend imports. See docs/interface.md for the
full contract (sync, input/output types, error handling).
"""

import time

from app.ocr.preprocess import load_and_preprocess
from app.ocr.engine import run_ocr
from app.ocr.postprocess import clean_detections, get_full_text
from app.extraction.patterns import (
    extract_mrp,
    extract_net_quantity,
    extract_mfg_date,
    extract_expiry_date,
    extract_batch_number,
    extract_fssai_license,
)
from app.extraction.ner import extract_manufacturer
from app.extraction.field_dictionary import detect_language
from app.extraction.exceptions import OCRFailedError

from app.ml_schemas.extraction import (
    ExtractedLabelInfo,
    MRP,
    NetQuantity,
    Manufacturer,
    ExtractionMetadata,
)


def process_image(image_path: str) -> ExtractedLabelInfo:
    """Full pipeline: preprocess -> OCR -> extraction -> ExtractedLabelInfo.

    Raises:
        OCRFailedError: image unreadable or both OCR engines fail entirely.

    Never raises for low-confidence or missing fields — those are reflected
    in the returned object's confidence scores and
    extraction_metadata.fields_missing.
    """
    start_time = time.time()

    try:
        image = load_and_preprocess(image_path)
    except FileNotFoundError as e:
        raise OCRFailedError(str(e), image_path=image_path)

    raw_detections, engine_used = run_ocr(image)  # may raise OCRFailedError
    clean_detections_list = clean_detections(raw_detections)
    full_text = get_full_text(clean_detections_list)

    languages = detect_language(full_text)

    mrp_data = extract_mrp(full_text)
    qty_data = extract_net_quantity(full_text)
    manufacturer_data = extract_manufacturer(full_text)
    mfg_date = extract_mfg_date(full_text)
    expiry_date = extract_expiry_date(full_text)
    batch_number = extract_batch_number(full_text)
    fssai_license = extract_fssai_license(full_text)

    fields_missing = []

    # MRP and net_quantity are required by the schema — if not found, fill
    # with a zero-confidence placeholder rather than crashing, and flag it
    # in fields_missing so the rules engine treats it as a violation
    # ("declaration missing") rather than a pipeline error.
    if mrp_data:
        mrp = MRP(**mrp_data)
    else:
        fields_missing.append("mrp")
        mrp = MRP(value=0.0, raw_text="", confidence=0.0)

    if qty_data:
        net_quantity = NetQuantity(**qty_data)
    else:
        fields_missing.append("net_quantity")
        net_quantity = NetQuantity(value=0.0, unit="g", raw_text="", confidence=0.0)

    if manufacturer_data:
        manufacturer = Manufacturer(**manufacturer_data)
    else:
        fields_missing.append("manufacturer")
        manufacturer = Manufacturer(name="", confidence=0.0)

    if not mfg_date:
        fields_missing.append("mfg_date")
    if not expiry_date:
        fields_missing.append("expiry_date")
    if not batch_number:
        fields_missing.append("batch_number")

    # overall confidence: simple average of the fields we actually found,
    # weighted toward the required fields. Refine this formula once you have
    # real accuracy numbers from evaluate.py.
    found_confidences = [
        c for c in [mrp.confidence, net_quantity.confidence, manufacturer.confidence]
        if c > 0
    ]
    overall_confidence = sum(found_confidences) / len(found_confidences) if found_confidences else 0.0

    processing_time_ms = int((time.time() - start_time) * 1000)

    metadata = ExtractionMetadata(
        ocr_engine=engine_used,
        language_detected=languages,
        processing_time_ms=processing_time_ms,
        overall_confidence=round(overall_confidence, 2),
        fields_missing=fields_missing,
    )

    return ExtractedLabelInfo(
        mrp=mrp,
        net_quantity=net_quantity,
        manufacturer=manufacturer,
        mfg_date=mfg_date,
        expiry_date=expiry_date,
        batch_number=batch_number,
        fssai_license=fssai_license,
        extraction_metadata=metadata,
    )
