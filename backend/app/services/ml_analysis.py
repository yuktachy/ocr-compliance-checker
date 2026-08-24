"""Bridge the OCR/extraction model to the inspection API.

The service keeps the model result and its visual evidence together: every
successful analysis writes an annotated copy of the submitted package image.
"""

from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np

from ..extraction.exceptions import OCRFailedError
from ..extraction.extractor import process_image
from ..ocr.engine import run_ocr


def analyse_image(image_path: Path, output_dir: Path) -> tuple[dict, str]:
    """Run the OCR model and return its extracted values plus an evidence URL."""
    extracted = process_image(str(image_path))

    # Run OCR on the source image once more for detection polygons.  The
    # extractor's public contract intentionally returns only semantic fields,
    # while the report needs visual evidence of what the model read.
    source = cv2.imread(str(image_path))
    if source is None:
        raise OCRFailedError("The uploaded image could not be decoded.", str(image_path))
    detections, _ = run_ocr(source)

    annotated = source.copy()
    for detection in detections:
        points = detection.bbox
        if len(points) < 4:
            continue
        polygon = cv2.convexHull(np.array(points, dtype=np.int32))
        cv2.polylines(annotated, [polygon], True, (0, 180, 0), 2)
        x, y = polygon[0][0]
        cv2.putText(annotated, f"OCR {detection.confidence:.0%}", (int(x), max(18, int(y) - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 120, 0), 1, cv2.LINE_AA)

    output_name = f"{uuid4().hex}_ml_annotated.jpg"
    if not cv2.imwrite(str(output_dir / output_name), annotated):
        raise OCRFailedError("Could not write the ML evidence image.", str(image_path))

    fields = extracted.extraction_metadata.fields_missing
    confidence = extracted.extraction_metadata.overall_confidence
    declarations = {
        "mrp": {"value": f"₹{extracted.mrp.value:g}", "confidence": extracted.mrp.confidence},
        "net_quantity": {"value": f"{extracted.net_quantity.value:g} {extracted.net_quantity.unit}", "confidence": extracted.net_quantity.confidence},
        "manufacturer": {"value": extracted.manufacturer.name, "confidence": extracted.manufacturer.confidence},
        "mfg_date": {"value": str(extracted.mfg_date or "Not detected"), "confidence": 0.0 if "mfg_date" in fields else confidence},
    }
    violations = [{
        "id": f"missing-{field}", "rule": "Rule 6(1)", "category": "Missing Declarations",
        "severity": "major", "field": field, "expected": "Declaration must be present",
        "actual": "Not detected", "description": f"{field.replace('_', ' ').title()} was not detected by the OCR model.",
    } for field in fields]
    status = "violation" if fields else ("needs-verification" if confidence < 0.75 else "compliant")

    return {
        "product_name": extracted.product_name,
        "manufacturer": extracted.manufacturer.name or None,
        "declarations": declarations,
        "violations": violations,
        "readability": {"ocr_engine": extracted.extraction_metadata.ocr_engine, "compliant": confidence >= 0.75},
        "status": status,
        "overall_confidence": confidence,
    }, f"/upload/{output_name}"
