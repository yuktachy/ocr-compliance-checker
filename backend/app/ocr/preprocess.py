"""OpenCV preprocessing pipeline: deskew, contrast enhancement, denoise.

Run preprocess() on every image before it reaches the OCR engine. Each step
is also exposed individually so you can eyeball before/after on your 15
dataset images and confirm each step actually helps before trusting it.
"""

import cv2
import numpy as np


def deskew(image: np.ndarray) -> np.ndarray:
    """Detects the dominant text/edge angle and rotates the image to
    straighten it. Uses minAreaRect on thresholded pixels — works well for
    photos taken slightly off-angle, not for extreme perspective distortion
    (that needs a full perspective-warp, out of scope for the hackathon)."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    gray = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))
    if coords.size == 0:
        return image  # nothing detected, skip rotation rather than crash

    angle = cv2.minAreaRect(coords)[-1]
    # cv2.minAreaRect angle convention correction
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    # skip rotation for near-zero angles — avoids introducing noise on
    # already-straight images
    if abs(angle) < 0.5:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated


def apply_clahe(image: np.ndarray) -> np.ndarray:
    """Contrast Limited Adaptive Histogram Equalization — big help on glossy
    or unevenly lit packaging where text contrast varies across the label."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l_channel)

    merged = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def denoise(image: np.ndarray) -> np.ndarray:
    """Fast non-local-means denoising. Helps with phone-camera grain,
    especially in low-light shots."""
    return cv2.fastNlMeansDenoisingColored(image, None, h=7, hColor=7,
                                            templateWindowSize=7, searchWindowSize=21)


def preprocess(image: np.ndarray) -> np.ndarray:
    """Full pipeline: denoise -> CLAHE -> deskew.

    Order matters: denoise before CLAHE (so contrast enhancement doesn't
    amplify noise), CLAHE before deskew (so the deskew angle-detection step
    sees clean edges).
    """
    image = denoise(image)
    image = apply_clahe(image)
    image = deskew(image)
    return image


def load_and_preprocess(image_path: str) -> np.ndarray:
    """Convenience wrapper: read from disk + run preprocess().
    Raises FileNotFoundError / cv2 errors upward — caller (engine.py or
    extractor.py) decides whether to wrap these as OCRFailedError."""
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image at {image_path}")
    return preprocess(image)
