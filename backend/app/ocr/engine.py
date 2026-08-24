"""OCR engine wrapper: PaddleOCR primary, Tesseract fallback.

Returns a normalized list of detections regardless of which engine ran, so
downstream code (postprocess.py, extraction/) never needs to know which
engine produced the result.
"""

from dataclasses import dataclass

import numpy as np

from ..extraction.exceptions import OCRFailedError


# Confidence threshold below which we retry with Tesseract.
# Tune this against the 15-image dataset once real results are available.
LOW_CONFIDENCE_THRESHOLD = 0.5


@dataclass
class Detection:
    text: str
    confidence: float
    bbox: list  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]


_paddle_instance = None


def _get_paddle_ocr(lang: str = "en"):
    """Lazily initialize PaddleOCR.

    PaddleOCR is slow to initialize, so create only one instance per process.
    """
    global _paddle_instance

    if _paddle_instance is None:
        from paddleocr import PaddleOCR

        _paddle_instance = PaddleOCR(
            use_textline_orientation=True,
            lang=lang,
        )

    return _paddle_instance


def run_paddleocr(
    image: np.ndarray,
    lang: str = "en",
) -> list[Detection]:
    """Run PaddleOCR and normalize its output into Detection objects."""

    ocr = _get_paddle_ocr(lang=lang)

    # New PaddleOCR API
    results = ocr.predict(image)

    detections = []

    for result in results:
        texts = result.get("rec_texts", [])
        scores = result.get("rec_scores", [])
        boxes = result.get("rec_polys", [])

        for text, confidence, bbox in zip(texts, scores, boxes):
            detections.append(
                Detection(
                    text=str(text),
                    confidence=float(confidence),
                    bbox=bbox.tolist(),
                )
            )

    return detections


def run_tesseract(image: np.ndarray) -> list[Detection]:
    """Run Tesseract as a fallback OCR engine."""

    import pytesseract
    from pytesseract import Output

    data = pytesseract.image_to_data(
        image,
        output_type=Output.DICT,
    )

    detections = []

    n = len(data["text"])

    for i in range(n):
        text = data["text"][i].strip()
        conf = float(data["conf"][i])

        # Ignore empty/invalid detections.
        if not text or conf < 0:
            continue

        x = data["left"][i]
        y = data["top"][i]
        w = data["width"][i]
        h = data["height"][i]

        bbox = [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
        ]

        detections.append(
            Detection(
                text=text,
                confidence=conf / 100.0,
                bbox=bbox,
            )
        )

    return detections


def run_ocr(
    image: np.ndarray,
    lang: str = "en",
) -> tuple[list[Detection], str]:
    """Run PaddleOCR first and fall back to Tesseract when necessary.

    Returns:
        (detections, engine_used)

    engine_used is either:
        "paddleocr"
        "tesseract_fallback"
    """

    try:
        # ---------------------------------------------------------
        # 1. Try PaddleOCR
        # ---------------------------------------------------------
        detections = run_paddleocr(
            image,
            lang=lang,
        )

        if detections:
            avg_conf = sum(
                detection.confidence
                for detection in detections
            ) / len(detections)

            print(
                f"PaddleOCR average confidence: "
                f"{avg_conf:.2f}"
            )

            # PaddleOCR result is good enough.
            if avg_conf >= LOW_CONFIDENCE_THRESHOLD:
                return detections, "paddleocr"

        # ---------------------------------------------------------
        # 2. PaddleOCR produced low/empty confidence.
        #    Try Tesseract.
        # ---------------------------------------------------------
        print("PaddleOCR confidence is low; trying Tesseract fallback...")

        fallback = run_tesseract(image)

        if fallback:
            return fallback, "tesseract_fallback"

        # Neither engine produced useful text.
        if detections:
            return detections, "paddleocr"

        raise OCRFailedError(
            "PaddleOCR returned no detections and "
            "Tesseract returned no detections."
        )

    except OCRFailedError:
        raise

    except Exception as paddle_error:
        # ---------------------------------------------------------
        # 3. PaddleOCR crashed.
        #    Keep the actual error visible during development.
        # ---------------------------------------------------------
        print(
            f"\nPaddleOCR ERROR: "
            f"{type(paddle_error).__name__}: "
            f"{paddle_error}"
        )

        try:
            fallback = run_tesseract(image)

            if fallback:
                return fallback, "tesseract_fallback"

        except Exception as tesseract_error:
            raise OCRFailedError(
                "Both OCR engines failed. "
                f"Paddle: {paddle_error}; "
                f"Tesseract: {tesseract_error}"
            ) from tesseract_error

        raise OCRFailedError(
            "PaddleOCR failed and Tesseract returned no detections: "
            f"{paddle_error}"
        ) from paddle_error