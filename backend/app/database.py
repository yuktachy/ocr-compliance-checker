"""Supabase repository and read-only sample-data fallback."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import HTTPException
from supabase import Client, create_client
from .config import SUPABASE_KEY, SUPABASE_URL

SAMPLE_DATA_PATH = Path(__file__).with_name("sample_inspections.txt")


class SupabaseRepository:
    def __init__(self) -> None:
        self.client: Client | None = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

    @staticmethod
    def _samples() -> list[dict[str, Any]]:
        return json.loads(SAMPLE_DATA_PATH.read_text(encoding="utf-8"))

    def select(self, table: str, *, columns: str = "*", order: str | None = None) -> list[dict[str, Any]]:
        if not self.client:
            return self._fallback(table)
        try:
            query = self.client.table(table).select(columns)
            if order:
                query = query.order(order, desc=True)
            return query.execute().data or []
        except Exception:
            return self._fallback(table)

    def get(self, table: str, identifier: str | int, *, column: str = "id") -> dict[str, Any] | None:
        if not self.client:
            return self._fallback_get(table, identifier, column)
        try:
            rows = self.client.table(table).select("*").eq(column, identifier).limit(1).execute().data
            return rows[0] if rows else None
        except Exception:
            return self._fallback_get(table, identifier, column)

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        return self._write(lambda: self.client.table(table).insert(row).execute().data[0])

    def update(self, table: str, identifier: str | int, changes: dict[str, Any], *, column: str = "id") -> dict[str, Any]:
        return self._write(lambda: self.client.table(table).update(changes).eq(column, identifier).execute().data[0])

    def delete(self, table: str, identifier: str | int, *, column: str = "id") -> None:
        self._write(lambda: self.client.table(table).delete().eq(column, identifier).execute())

    def _write(self, operation):
        if not self.client:
            raise HTTPException(503, "Supabase is not configured; sample data is read-only.")
        try:
            return operation()
        except Exception as exc:
            raise HTTPException(503, "Supabase is unavailable; write was not saved.") from exc

    def _fallback(self, table: str) -> list[dict[str, Any]]:
        inspections = self._samples()
        if table == "inspections": return inspections
        if table == "products": return _products_from_inspections(inspections)
        return []

    def _fallback_get(self, table: str, identifier: str | int, column: str) -> dict[str, Any] | None:
        return next((row for row in self._fallback(table) if row.get(column) == identifier), None)


def _products_from_inspections(inspections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    products: dict[str, dict[str, Any]] = {}
    for item in inspections:
        product = products.setdefault(item["product_name"], {"id": f"SAMPLE-{len(products) + 1:03d}", "name": item["product_name"], "category": item.get("category", "Food & Beverages"), "brand": item.get("brand", "Generic Brand"), "manufacturer": item.get("manufacturer") or "Unknown Mfg", "total_inspections": 0, "compliant_count": 0, "violation_count": 0, "latest_status": item.get("status"), "image_url": item.get("image_url", "/upload/sample_package.jpg"), "last_inspected": item.get("created_at", "")})
        product["total_inspections"] += 1
        product["compliant_count"] += item.get("status") == "compliant"
        product["violation_count"] += item.get("status") == "violation"
    return list(products.values())


repository = SupabaseRepository()


def get_db():
    return repository
