"""Custom exceptions raised by the ML pipeline.

Backend catches these via @app.exception_handler — see docs/interface.md.
"""


class OCRFailedError(Exception):
    """Raised when the image cannot be processed at all — corrupt file,
    unreadable format, or the OCR engine crashes entirely.

    NOT raised for low-confidence or missing-field results — those are
    normal outcomes reflected in ExtractionMetadata.fields_missing and
    per-field confidence scores, not failures.
    """

    def __init__(self, message: str, image_path: str = ""):
        self.image_path = image_path
        super().__init__(message)
