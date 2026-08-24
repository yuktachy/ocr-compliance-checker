"""Manufacturer/address extraction — the messiest field to get via regex
alone, since names and addresses don't follow a fixed pattern.

Two-tier approach:
1. Keyword-anchored extraction (cheap, deterministic, no dependencies) —
   look for "Manufactured by" / "Mfd by" etc. and grab the text that follows
   until the next known label or a reasonable character limit.
2. LLM fallback (optional, only used when tier 1 comes back empty/low
   confidence) — feed the raw OCR text with a strict JSON prompt asking only
   for manufacturer name + address. Requires ANTHROPIC_API_KEY in .env.
   Always keep tier 1 as the first pass so the pipeline still works offline.
"""

import json
import re

from ..extraction.field_dictionary import FIELD_KEYWORDS

MANUFACTURER_LABELS = FIELD_KEYWORDS["manufacturer"] + FIELD_KEYWORDS["packer"]

# stop extraction at the next likely label, so we don't swallow unrelated
# text into the address field
STOP_LABELS = [
    "MRP", "Net", "Batch", "Best Before", "Expiry", "FSSAI", "Lic. No",
    "Consumer Care", "Customer Care",
]


def extract_manufacturer_keyword(text: str, max_chars: int = 150) -> dict | None:
    for label in MANUFACTURER_LABELS:
        match = re.search(re.escape(label), text, re.IGNORECASE)
        if not match:
            continue
        start = match.end()
        window = text[start:start + max_chars]

        # cut window off at the first stop label, if any appear
        cut_at = len(window)
        for stop in STOP_LABELS:
            stop_match = re.search(re.escape(stop), window, re.IGNORECASE)
            if stop_match and stop_match.start() < cut_at:
                cut_at = stop_match.start()
        window = window[:cut_at].strip(" :,\-\n")

        if not window:
            continue

        # naive split: first comma-separated segment = name, rest = address.
        # good-enough heuristic for hackathon scope; refine against your
        # 15-image dataset if accuracy is poor.
        parts = window.split(",", 1)
        name = parts[0].strip()
        address = parts[1].strip() if len(parts) > 1 else None

        return {"name": name, "address": address, "confidence": 0.6}
    return None


def extract_manufacturer_llm(raw_text: str) -> dict | None:
    """LLM fallback — only called when the keyword approach fails. Requires
    the `anthropic` package and ANTHROPIC_API_KEY set in the environment.
    Wrapped so a missing key / network failure degrades gracefully instead
    of crashing the whole pipeline.
    """
    try:
        import os
        import anthropic

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return None

        client = anthropic.Anthropic(api_key=api_key)
        prompt = f"""Extract the manufacturer or packer name and address from
this OCR text taken from a packaged food label. Respond with ONLY a JSON
object, no preamble, no markdown fences: {{"name": "...", "address": "..." }}
If not found, respond with {{"name": null, "address": null}}.

OCR TEXT:
{raw_text}"""

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        result_text = response.content[0].text.strip()
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(result_text)

        if not parsed.get("name"):
            return None
        return {"name": parsed["name"], "address": parsed.get("address"), "confidence": 0.7}

    except Exception:
        # any failure here (no package, bad key, network, bad JSON) should
        # never crash the pipeline — just fall through to "not found"
        return None


def extract_manufacturer(text: str) -> dict | None:
    result = extract_manufacturer_keyword(text)
    if result:
        return result
    return extract_manufacturer_llm(text)
