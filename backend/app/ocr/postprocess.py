"""Merge and clean up raw OCR detections before extraction.

Raw OCR output is a flat list of small text fragments with individual
bounding boxes. This module groups nearby fragments into lines, drops noise,
and produces a single clean text blob (plus the still-available structured
detections) for extraction/patterns.py and ner.py to work against.
"""

from app.ocr.engine import Detection


# Detections below this confidence are usually OCR noise.
MIN_CONFIDENCE = 0.3


def filter_low_confidence(
    detections: list[Detection],
    threshold: float = MIN_CONFIDENCE,
) -> list[Detection]:
    """Remove detections whose confidence is below the threshold."""
    return [
        detection
        for detection in detections
        if detection.confidence >= threshold
    ]


def _bbox_center_y(detection: Detection) -> float:
    """Return the vertical center of a detection's bounding box."""
    bbox = detection.bbox

    ys = [point[1] for point in bbox]

    return sum(ys) / len(ys)


def _bbox_left_x(detection: Detection) -> float:
    """Return the left-most x coordinate of a detection."""
    bbox = detection.bbox

    return min(point[0] for point in bbox)


def merge_into_lines(
    detections: list[Detection],
    y_tolerance: int = 15,
) -> list[Detection]:
    """Group nearby OCR detections into horizontal text lines.

    Example:

        ["MRP", "Rs.50.00"]

    becomes:

        ["MRP Rs.50.00"]

    Bounding boxes are combined and confidence is averaged.
    """

    if not detections:
        return []

    # Sort detections from top to bottom.
    sorted_dets = sorted(
        detections,
        key=_bbox_center_y,
    )

    lines: list[list[Detection]] = []

    for detection in sorted_dets:
        placed = False

        for line in lines:
            # Compare the vertical center of this detection
            # with the first detection in the existing line.
            if (
                abs(
                    _bbox_center_y(line[0])
                    - _bbox_center_y(detection)
                )
                <= y_tolerance
            ):
                line.append(detection)
                placed = True
                break

        if not placed:
            lines.append([detection])

    merged: list[Detection] = []

    for line in lines:

        # Sort each line from left to right.
        line_sorted = sorted(
            line,
            key=_bbox_left_x,
        )

        # Join the text fragments.
        text = " ".join(
            detection.text
            for detection in line_sorted
        )

        # Average confidence for the merged line.
        avg_confidence = sum(
            detection.confidence
            for detection in line_sorted
        ) / len(line_sorted)

        # Combine all bounding-box points.
        all_points = [
            point
            for detection in line_sorted
            for point in detection.bbox
        ]

        xs = [point[0] for point in all_points]
        ys = [point[1] for point in all_points]

        combined_bbox = [
            [min(xs), min(ys)],
            [max(xs), min(ys)],
            [max(xs), max(ys)],
            [min(xs), max(ys)],
        ]

        merged.append(
            Detection(
                text=text,
                confidence=avg_confidence,
                bbox=combined_bbox,
            )
        )

    return merged


def get_full_text(
    detections: list[Detection],
) -> str:
    """Convert merged detections into newline-separated text.

    This text will later be passed to the extraction layer.
    """

    return "\n".join(
        detection.text
        for detection in detections
    )


def clean_detections(
    raw_detections: list[Detection],
) -> list[Detection]:
    """Run the complete OCR postprocessing pipeline.

    1. Remove very low-confidence detections.
    2. Group nearby detections into lines.
    3. Merge each line into a single Detection.
    """

    filtered = filter_low_confidence(
        raw_detections
    )

    lines = merge_into_lines(
        filtered
    )

    return lines