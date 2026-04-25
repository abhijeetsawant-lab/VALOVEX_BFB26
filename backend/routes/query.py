from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.sarvam_tts import synthesize_speech
from services.gemini_llm import get_llm_response
from services.scheme_matcher import match_scheme, get_scheme, build_scheme_context

router = APIRouter()


class QueryRequest(BaseModel):
    text: str
    language: str = "en-IN"


def _extract_matched_scheme_payload(scheme):
    if not scheme:
        return None
    return {
        "id": scheme["id"],
        "name": scheme["name"],
        "name_mr": scheme.get("name_mr", scheme["name"]),
        "name_hi": scheme.get("name_hi", scheme["name"]),
        "category": scheme.get("category_label", scheme["category"]),
        "eligibility": scheme.get("eligibility", ""),
        "benefit": scheme.get("benefit", ""),
        "documents": scheme.get("documents", []),
        "apply_url": scheme.get("apply_url", ""),
        "apply_url_label": scheme.get("apply_url_label", scheme.get("apply_url", "")),
    }


@router.post("/query")
async def query_endpoint(body: QueryRequest):
    """
    Text-only pipeline (typing fallback) — skips STT entirely.
    Input : { text, language }
    Returns: { transcript, response_text, audio_base64, detected_language, matched_scheme }
    """
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    language = body.language if body.language and body.language != "auto" else "en-IN"

    # ── Scheme matcher ───────────────────────────────────────
    scheme_id = match_scheme(text)
    scheme = get_scheme(scheme_id) if scheme_id else None
    scheme_context = build_scheme_context(scheme, language) if scheme else None

    # ── Gemini with optional context ─────────────────────────
    response_text = await get_llm_response(text, language, scheme_context)

    # ── TTS ──────────────────────────────────────────────────
    audio_base64 = await synthesize_speech(response_text, language)

    return JSONResponse(
        content={
            "transcript": text,
            "response_text": response_text,
            "audio_base64": audio_base64,
            "detected_language": None,
            "matched_scheme": _extract_matched_scheme_payload(scheme),
        }
    )
