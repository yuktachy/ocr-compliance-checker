"""Regex + heuristic extraction for the highest-value deterministic fields:
MRP, net quantity, mfg/expiry dates, batch number.

Each extract_* function takes the full OCR text blob and returns a dict
matching the corresponding Pydantic model's fields, or None if not found.
Deliberately deterministic and dependency-light — no ML here, per the
"keep ML confined to OCR + extraction, compliance decision stays
rule-based" design call.
"""

import re
from datetime import datetime

# --- MRP -------------------------------------------------------------

MRP_PATTERNS = [
    r"MRP\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*(\d+(?:\.\d{1,2})?)",
    r"(?:Rs\.?|₹|INR)\s*(\d+(?:\.\d{1,2})?)\s*(?:only|/-)?",
    r"Maximum\s+Retail\s+Price\s*[:\-]?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)",
]

INCLUSIVE_TAX_HINTS = ["incl", "inclusive of all taxes", "incl. of all taxes"]


def extract_mrp(text: str) -> dict | None:
    for pattern in MRP_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw_text = match.group(0).strip()
            value = float(match.group(1))
            # look at a small window around the match for "inclusive of taxes" language
            window_start = max(0, match.start() - 10)
            window_end = min(len(text), match.end() + 60)
            context = text[window_start:window_end].lower()
            inclusive = any(hint in context for hint in INCLUSIVE_TAX_HINTS)
            return {
                "value": value,
                "currency": "INR",
                "inclusive_of_taxes": inclusive if inclusive else None,
                "raw_text": raw_text,
            }
    return None


# --- Net quantity ------------------------------------------------------

NET_QTY_PATTERN = re.compile(
    r"(?:Net\s*(?:Wt|Weight|Qty|Quantity)?\.?\s*[:\-]?\s*)?"
    r"(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|litre|liter|N)\b",
    re.IGNORECASE,
)

UNIT_NORMALIZATION = {
    "g": "g", "gm": "g", "gms": "g",
    "kg": "kg",
    "ml": "ml",
    "l": "l", "litre": "l", "liter": "l",
    "n": "N",
}


def extract_net_quantity(text: str) -> dict | None:
    # prefer matches near the words "net" / "quantity" / "weight" if present,
    # otherwise fall back to the first plausible unit match
    net_context_match = re.search(
        r"Net\s*(?:Wt|Weight|Qty|Quantity)?\.?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|litre|liter|N)",
        text, re.IGNORECASE,
    )
    match = net_context_match or NET_QTY_PATTERN.search(text)
    if match:
        raw_text = match.group(0).strip()
        value = float(match.group(1))
        unit = UNIT_NORMALIZATION.get(match.group(2).lower(), match.group(2))
        return {"value": value, "unit": unit, "raw_text": raw_text}
    return None


# --- Dates ---------------------------------------------------------------

DATE_PATTERNS = [
    r"(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2,4})",          # 25/08/2026, 25-08-26
    r"(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})",             # 25 Aug 2026
    r"([A-Za-z]{3,9})\s+(\d{2,4})",                          # Aug 2026 (month/year only)
]

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _parse_date_fragment(match: re.Match, pattern_index: int) -> str | None:
    try:
        groups = match.groups()
        if pattern_index == 0:  # numeric d/m/y
            d, m, y = groups
            y = int(y)
            if y < 100:
                y += 2000
            return datetime(y, int(m), int(d)).date().isoformat()
        elif pattern_index == 1:  # "25 Aug 2026"
            d, mon, y = groups
            mon_num = MONTH_MAP.get(mon[:3].lower())
            y = int(y)
            if y < 100:
                y += 2000
            if mon_num:
                return datetime(y, mon_num, int(d)).date().isoformat()
        elif pattern_index == 2:  # "Aug 2026"
            mon, y = groups
            mon_num = MONTH_MAP.get(mon[:3].lower())
            y = int(y)
            if y < 100:
                y += 2000
            if mon_num:
                return datetime(y, mon_num, 1).date().isoformat()
    except (ValueError, TypeError):
        return None
    return None


def _find_date_near_keyword(text: str, keywords: list[str]) -> str | None:
    for keyword in keywords:
        kw_match = re.search(keyword, text, re.IGNORECASE)
        if not kw_match:
            continue
        window = text[kw_match.end(): kw_match.end() + 25]
        for i, pattern in enumerate(DATE_PATTERNS):
            date_match = re.search(pattern, window)
            if date_match:
                parsed = _parse_date_fragment(date_match, i)
                if parsed:
                    return parsed
    return None


def extract_mfg_date(text: str) -> str | None:
    return _find_date_near_keyword(text, [r"Mfg\.?\s*Date", r"Manufactur(?:ed|ing)\s*Date", r"Mfd\.?"])


def extract_expiry_date(text: str) -> str | None:
    return _find_date_near_keyword(text, [r"Expiry\s*Date", r"Exp\.?\s*Date", r"Best\s*Before", r"Use\s*By"])


# --- Batch number ---------------------------------------------------------

BATCH_PATTERN = re.compile(
    r"Batch\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Za-z0-9\-/]{3,20})",
    re.IGNORECASE,
)


def extract_batch_number(text: str) -> str | None:
    match = BATCH_PATTERN.search(text)
    if match:
        return match.group(1).strip()
    return None


# --- FSSAI license (bonus, common on Indian food packaging) --------------

FSSAI_PATTERN = re.compile(r"(?:FSSAI|Lic\.?\s*No\.?)\s*[:\-]?\s*(\d{10,14})", re.IGNORECASE)


def extract_fssai_license(text: str) -> str | None:
    match = FSSAI_PATTERN.search(text)
    if match:
        return match.group(1)
    return None
