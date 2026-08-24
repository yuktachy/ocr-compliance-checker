"""Runs the FULL pipeline end-to-end (preprocess -> OCR -> postprocess ->
regex/NER extraction) and prints the final structured ExtractedLabelInfo
object. This is what process_image() actually returns, and what your
backend teammate imports.

Usage: uv run python scripts/test_extraction.py path/to/image.jpg
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.extraction.extractor import process_image
from app.extraction.exceptions import OCRFailedError

if len(sys.argv) < 2:
    print("Usage: uv run python scripts/test_extraction.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]

try:
    result = process_image(image_path)
except OCRFailedError as e:
    print(f"OCR FAILED: {e}")
    sys.exit(1)

print(result.model_dump_json(indent=2))
