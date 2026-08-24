print("Checking OpenCV...")
import cv2
print(f"  OK — OpenCV version {cv2.__version__}")

print("Checking PaddleOCR (this takes 10-30s to download model weights the first time)...")
from paddleocr import PaddleOCR
ocr = PaddleOCR(
    use_textline_orientation=True,
    lang="en"
)
print("  OK — PaddleOCR loaded successfully")

print("Checking pytesseract (fallback engine)...")
import pytesseract
print(f"  OK — pytesseract version {pytesseract.get_tesseract_version()}")

print("\nAll engines ready. Proceed to Step 1.")