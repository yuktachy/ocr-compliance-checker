"""Runs preprocess.py on ONE image from your dataset and saves the before/
after so you can visually confirm it's actually helping.

Usage: uv run python scripts/test_preprocess.py path/to/image.jpg
"""
import os
import sys
import cv2
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.ocr.preprocess import preprocess

if len(sys.argv) < 2:
    print("Usage: uv run python scripts/test_preprocess.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]
image = cv2.imread(image_path)

if image is None:
    print(f"Could not read image at {image_path}")
    sys.exit(1)

processed = preprocess(image)

cv2.imwrite("preprocess_before.jpg", image)
cv2.imwrite("preprocess_after.jpg", processed)

print("Saved preprocess_before.jpg and preprocess_after.jpg — open both and compare.")
print("Look for: straighter image, better contrast/readability, less grain.")
