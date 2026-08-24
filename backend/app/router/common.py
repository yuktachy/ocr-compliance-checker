"""Convert Supabase rows from query.sql into the API's existing response shape."""
from typing import Any


def inspection_response(row: dict[str, Any]) -> dict[str, Any]:
    # File fallback already uses the public response shape.
    if "product_name" in row:
        return row
    extracted = row.get("extracted_json") or {}
    product = row.get("products") or {}
    declarations = extracted.get("declarations", extracted.get("mandatory_declarations", {}))
    return {
        "id": row["id"], "product_name": product.get("name", "Unknown product"),
        "brand": product.get("brand") or "", "category": product.get("category") or "",
        "manufacturer": extracted.get("manufacturer"), "retailer": extracted.get("retailer"),
        "location": extracted.get("location", ""),
        "image_url": row.get("image_path") or product.get("image_path") or "",
        "declarations": declarations, "violations": violations_response(row.get("violations") or []),
        "readability": extracted.get("readability", {}), "status": public_status(row.get("status", "pending")),
        "overall_confidence": row.get("overall_confidence") or 0.0,
        "created_at": row.get("created_at", ""), "updated_at": row.get("processed_at") or row.get("created_at", ""),
    }


def violations_response(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for row in rows:
        rule = row.get("rules") or {}
        result.append({"id": row.get("id"), "rule": rule.get("legal_reference") or rule.get("rule_code", ""),
                       "category": rule.get("field_name", "Missing Declarations"),
                       "severity": row.get("severity") or rule.get("severity", "minor"),
                       "field": row.get("field_name") or rule.get("field_name", ""),
                       "expected": row.get("expected", ""), "actual": row.get("found", ""),
                       "description": row.get("explanation") or rule.get("description", "")})
    return result


def database_status(status: str | None) -> str:
    return {"compliant": "completed", "violation": "failed", "needs-verification": "pending"}.get(status or "", status or "pending")


def public_status(status: str | None) -> str:
    return {"completed": "compliant", "failed": "violation", "pending": "needs-verification", "processing": "needs-verification"}.get(status or "", status or "needs-verification")


def product_response(row: dict[str, Any], inspections: list[dict[str, Any]]) -> dict[str, Any]:
    if "total_inspections" in row:  # Read-only file fallback shape.
        return row
    linked = [item for item in inspections if item.get("product_id") == row["id"]]
    statuses = [public_status(item.get("status")) for item in linked]
    return {"id": row["id"], "name": row["name"], "category": row.get("category") or "",
            "brand": row.get("brand") or "", "manufacturer": "", "total_inspections": len(linked),
            "compliant_count": statuses.count("compliant"), "violation_count": statuses.count("violation"),
            "latest_status": statuses[0] if statuses else "pending", "image_url": row.get("image_path") or "",
            "last_inspected": linked[0].get("created_at", "") if linked else row.get("created_at", "")}
