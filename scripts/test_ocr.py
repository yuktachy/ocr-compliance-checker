"""Runs preprocess -> OCR on one image and prints every text fragment
detected, with confidence scores. This is the real milestone — once you see
sensible text come out of a real photo, most of the pipeline risk is gone.

Usage: uv run python scripts/test_ocr.py path/to/image.jpg
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.ocr.preprocess import load_and_preprocess
from app.ocr.engine import run_ocr

if len(sys.argv) < 2:
    print("Usage: uv run python scripts/test_ocr.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]
image = load_and_preprocess(image_path)

detections, engine_used = run_ocr(image)

print(f"Engine used: {engine_used}")
print(f"Total fragments detected: {len(detections)}\n")

for d in detections:
    print(f"  [{d.confidence:.2f}] {d.text}")
