"""Run process_image() against your labeled dataset and print field-level
accuracy. Run this after every change to preprocessing/OCR/extraction to
turn "I think it's better" into a real number.

Usage: uv run python ml/evaluate.py

Expects:
  ml/dataset/images/<product>_001_nutrition.<ext>
  ml/dataset/images/<product>_002_mrp_qty.<ext>
  ml/dataset/images/<product>_003_front.<ext>
  ml/dataset/ground_truth/<product>.json   (image_id = "<product>")

Since each product has 3 photos, this runs process_image() on the
002_mrp_qty photo by default (it's the one with MRP/net quantity/dates —
the fields this script checks). Change TARGET_SUFFIX below if your MRP/date
info lives on a different panel for some products.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.extraction.extractor import process_image


DATASET_DIR = Path(__file__).parent / "dataset"
IMAGES_DIR = DATASET_DIR / "images"
GROUND_TRUTH_DIR = DATASET_DIR / "ground_truth"

TARGET_SUFFIX = "002_mrp_qty"  # which of the 3 photos per product to test against
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"]


def find_image_for_product(product_id: str) -> Path | None:
    """Looks for <product_id>_<TARGET_SUFFIX>.<ext> across known extensions."""
    for ext in IMAGE_EXTENSIONS:
        candidate = IMAGES_DIR / f"{product_id}_{TARGET_SUFFIX}{ext}"
        if candidate.exists():
            return candidate
    return None


def get_expected_value(field_dict: dict | None):
    if not field_dict:
        return None
    return field_dict.get("value") or field_dict.get("name")


def get_actual_value(field_obj):
    if field_obj is None:
        return None
    return getattr(field_obj, "value", None) or getattr(field_obj, "name", None)


def run_evaluation():
    ground_truth_files = list(GROUND_TRUTH_DIR.glob("*.json"))
    if not ground_truth_files:
        print(f"No ground truth files found in {GROUND_TRUTH_DIR}. "
              "Add one JSON per product first (e.g. Lays.json, Maggi_4pack.json).")
        return

    fields_to_check = ["mrp", "net_quantity", "manufacturer"]
    correct, total = 0, 0
    per_product_results = []

    for gt_file in ground_truth_files:
        gt = json.loads(gt_file.read_text())
        product_id = gt.get("image_id", gt_file.stem)

        image_path = find_image_for_product(product_id)
        if image_path is None:
            print(f"WARNING: no image found for product '{product_id}' "
                  f"(looked for {product_id}_{TARGET_SUFFIX}.[jpg/jpeg/png])")
            continue

        try:
            result = process_image(str(image_path))
        except Exception as e:
            print(f"FAILED on {product_id}: {e}")
            continue

        product_correct = 0
        for field in fields_to_check:
            total += 1
            expected = get_expected_value(gt.get("expected", {}).get(field))
            actual = get_actual_value(getattr(result, field, None))
            if expected == actual:
                correct += 1
                product_correct += 1

        per_product_results.append(
            f"  {product_id} ({gt.get('condition', '?')}): "
            f"{product_correct}/{len(fields_to_check)} fields correct, "
            f"overall_confidence={result.extraction_metadata.overall_confidence}"
        )

    print("\n".join(per_product_results))
    if total:
        print(f"\nField accuracy: {correct}/{total} ({100 * correct / total:.1f}%)")
    else:
        print("No products were evaluated — check warnings above.")


if __name__ == "__main__":
    run_evaluation()