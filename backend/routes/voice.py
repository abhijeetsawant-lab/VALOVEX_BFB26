from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from services.sarvam_stt import transcribe_audio
from services.sarvam_tts import synthesize_speech
from services.gemini_llm import get_llm_response
from services.scheme_matcher import match_scheme, get_scheme, build_scheme_context

router = APIRouter()


def _extract_matched_scheme_payload(scheme: Optional[dict]) -> Optional[dict]:
    """Return only the fields frontend needs (avoids sending full steps arrays)."""
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


@router.post("/voice")
async def voice_endpoint(
    audio_file: UploadFile = File(...),
    language: str = Form(...),
    demo_text: Optional[str] = Form(None),
):
    """
    Full voice pipeline:
    1. STT  → transcript  (skipped when demo_text is provided)
    2. Scheme matcher → inject knowledge base context
    3. Gemini → response text
    4. TTS  → audio base64
    Returns: { transcript, response_text, audio_base64, detected_language, matched_scheme }
    """
    try:
        detected_language: Optional[str] = None

        if demo_text and demo_text.strip():
            transcript = demo_text.strip()
            if language == "auto":
                language = "en-IN"
        else:
            audio_bytes = await audio_file.read()
            if not audio_bytes:
                raise HTTPException(status_code=400, detail="Empty audio file received.")
            transcript, detected_language = await transcribe_audio(audio_bytes, language)

        effective_language = (
            detected_language if (language == "auto" and detected_language) else language
        )
        if effective_language == "auto":
            effective_language = "en-IN"

        # ── Scheme matcher ───────────────────────────────────────
        scheme_id = match_scheme(transcript)
        scheme = get_scheme(scheme_id) if scheme_id else None
        scheme_context = build_scheme_context(scheme, effective_language) if scheme else None

        # ── Gemini with optional context ─────────────────────────
        response_text = await get_llm_response(transcript, effective_language, scheme_context)

        # ── TTS ──────────────────────────────────────────────────
        audio_base64 = await synthesize_speech(response_text, effective_language)

        return JSONResponse(
            content={
                "transcript": transcript,
                "response_text": response_text,
                "audio_base64": audio_base64,
                "detected_language": detected_language,
                "matched_scheme": _extract_matched_scheme_payload(scheme),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "NaamSeva API", "version": "1.2.0"}
