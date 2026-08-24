"""Runs preprocess -> OCR -> postprocess and prints the merged, cleaned
lines plus the final flattened text blob that extraction/patterns.py will
actually search through.

Usage: uv run python scripts/test_postprocess.py path/to/image.jpg
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.ocr.preprocess import load_and_preprocess
from app.ocr.engine import run_ocr
from app.ocr.postprocess import clean_detections, get_full_text

if len(sys.argv) < 2:
    print("Usage: uv run python scripts/test_postprocess.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]
image = load_and_preprocess(image_path)
raw_detections, engine_used = run_ocr(image)
lines = clean_detections(raw_detections)

print(f"Raw fragments: {len(raw_detections)} -> Merged lines: {len(lines)}\n")
for line in lines:
    print(f"  [{line.confidence:.2f}] {line.text}")

print("\n--- Full text blob (what patterns.py will search) ---")
print(get_full_text(lines))
