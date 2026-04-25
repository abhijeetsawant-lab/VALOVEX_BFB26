"""
Scheme Matcher Service
Matches user query text (any language) to a known scheme using keyword lookup.
Called BEFORE Gemini to inject relevant context into the prompt.
"""
import json
import pathlib
import re
from typing import Optional

# ── Load schemes data ────────────────────────────────────────────────────────
_DATA_FILE = pathlib.Path(__file__).parent.parent / "backend" / "data" / "schemes_data.json"

_SCHEMES: dict[str, dict] = {}  # id → scheme dict
_KEYWORD_MAP: dict[str, str] = {}  # lowercase keyword → scheme_id


def _load():
    global _SCHEMES, _KEYWORD_MAP
    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    for scheme in data["schemes"]:
        sid = scheme["id"]
        _SCHEMES[sid] = scheme
        for kw in scheme.get("keywords", []):
            _KEYWORD_MAP[kw.lower()] = sid

    # Sort keywords longest-first so multi-word matches win over single-word
    _KEYWORD_MAP = dict(
        sorted(_KEYWORD_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    )


_load()  # Load at import time


def match_scheme(query_text: str) -> Optional[str]:
    """Return scheme_id matching the query, or None."""
    normalized = query_text.lower()
    for keyword, scheme_id in _KEYWORD_MAP.items():
        # Use word-boundary-aware search (handles Unicode via simple 'in' check)
        if keyword in normalized:
            return scheme_id
    return None


def get_scheme(scheme_id: str) -> Optional[dict]:
    """Return full scheme dict by ID, or None."""
    return _SCHEMES.get(scheme_id)


def get_all_schemes() -> list[dict]:
    """Return all schemes as a list (summary fields only for browser)."""
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "name_mr": s.get("name_mr", s["name"]),
            "name_hi": s.get("name_hi", s["name"]),
            "category": s["category"],
            "category_label": s.get("category_label", s["category"].title()),
            "benefit": s["benefit"][:120] + ("…" if len(s["benefit"]) > 120 else ""),
            "apply_url": s["apply_url"],
        }
        for s in _SCHEMES.values()
    ]


def build_scheme_context(scheme: dict, language_code: str) -> str:
    """Format scheme fields into a compact context string for Gemini."""
    lang = language_code[:2]  # "mr", "hi", "en"
    line = lambda label, val: f"{label}: {val}" if val else ""

    # Pick localised name
    name = scheme.get(f"name_{'mr' if lang == 'mr' else 'hi' if lang == 'hi' else 'en'}", scheme["name"])

    docs = ", ".join(scheme.get("documents", [])[:4])  # top 4 docs to stay concise
    return "\n".join(filter(None, [
        f"Scheme: {name}",
        line("Eligibility", scheme.get("eligibility", "")[:200]),
        line("Benefit", scheme.get("benefit", "")[:150]),
        line("Key documents needed", docs),
        line("Apply at", scheme.get("apply_url", "")),
    ]))
