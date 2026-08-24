"""Bilingual (English + Hindi) keyword-to-field mapping.

Cheapest high-value trick for the multilingual demo bullet point: we don't
translate anything, we just recognize field LABELS regardless of language,
then extract whatever value sits next to whichever label matched.

Extend FIELD_KEYWORDS with more languages/synonyms as time allows —
Tamil/Telugu are stretch goals per the 2-day plan.
"""

FIELD_KEYWORDS: dict[str, list[str]] = {
    "mrp": [
        "MRP", "Maximum Retail Price", "M.R.P",
        "अधिकतम खुदरा मूल्य", "एम.आर.पी",
    ],
    "net_quantity": [
        "Net Quantity", "Net Wt", "Net Weight", "Net Qty",
        "निवल मात्रा", "शुद्ध मात्रा", "निवल भार",
    ],
    "manufacturer": [
        "Manufactured by", "Mfd by", "Mfg by", "Marketed by",
        "निर्माता", "द्वारा निर्मित",
    ],
    "packer": [
        "Packed by", "Packer",
        "पैककर्ता", "द्वारा पैक",
    ],
    "consumer_care": [
        "Consumer Care", "Customer Care", "For queries", "Helpline",
        "उपभोक्ता सेवा", "ग्राहक सेवा",
    ],
    "mfg_date": [
        "Mfg Date", "Manufacturing Date", "Date of Manufacture", "Mfd",
        "निर्माण तिथि",
    ],
    "expiry_date": [
        "Expiry Date", "Best Before", "Use By", "Exp Date",
        "समाप्ति तिथि", "उपयोग करें",
    ],
    "batch_number": [
        "Batch No", "Batch Number", "Lot No",
        "बैच संख्या",
    ],
    "country_of_origin": [
        "Country of Origin", "Made in",
        "मूल देश", "में निर्मित",
    ],
}


def detect_language(text: str) -> list[str]:
    """Very lightweight language hint based on Unicode ranges — good enough
    for logging extraction_metadata.language_detected without adding a full
    langdetect/fastText dependency. Swap for langdetect if more languages
    are added later."""
    languages = []
    if any("\u0900" <= ch <= "\u097F" for ch in text):  # Devanagari block
        languages.append("hi")
    if any(ch.isascii() and ch.isalpha() for ch in text):
        languages.append("en")
    return languages or ["en"]


def find_value_near_label(text: str, field: str, window: int = 60) -> str | None:
    """Given the field name, searches for any of its known keyword labels
    (in any supported language) and returns the text immediately following
    the match — a raw candidate string for the caller to further parse with
    patterns.py's regexes.

    This is a fallback path used when the primary regex in patterns.py
    doesn't find a match directly — useful for Hindi-labeled packs where the
    value format is still numeric/Latin (e.g. "₹50.00") but the label text is
    in Devanagari.
    """
    keywords = FIELD_KEYWORDS.get(field, [])
    for keyword in keywords:
        idx = text.find(keyword)
        if idx != -1:
            start = idx + len(keyword)
            return text[start:start + window].strip(" :\-\n")
    return None
