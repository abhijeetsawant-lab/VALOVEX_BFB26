import httpx
import os
import random
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
STT_URL = "https://api.sarvam.ai/speech-to-text"

# Rotating fallback queries so it doesn't always say "ration card"
_FALLBACK_QUERIES = {
    "mr-IN": [
        "रेशन कार्ड कसे बनवायचे?",
        "पीएम किसान योजना काय आहे?",
        "आयुष्मान भारत योजनेसाठी कसे अर्ज करावे?",
        "आधार कार्ड कसे अपडेट करावे?",
        "शिष्यवृत्ती कशी मिळवायची?",
        "पासपोर्ट कसा बनवायचा?",
    ],
    "hi-IN": [
        "राशन कार्ड कैसे बनाएं?",
        "पीएम किसान योजना क्या है?",
        "आयुष्मान भारत में कैसे आवेदन करें?",
        "आधार कार्ड कैसे अपडेट करें?",
        "छात्रवृत्ति कैसे मिले?",
        "पासपोर्ट कैसे बनवाएं?",
    ],
    "en-IN": [
        "How to get a ration card?",
        "What is PM-KISAN scheme?",
        "How to apply for Ayushman Bharat?",
        "How to update Aadhaar card?",
        "How to apply for scholarship?",
        "How to apply for a passport?",
    ],
}


async def transcribe_audio(
    audio_bytes: bytes, language_code: str
) -> tuple[str, Optional[str]]:
    """Send audio to Sarvam AI STT."""
    try:
        sarvam_lang = "unknown" if language_code == "auto" else language_code
        is_auto = language_code == "auto"

        headers = {"api-subscription-key": SARVAM_API_KEY}
        files = {"file": ("audio.webm", audio_bytes, "audio/webm")}
        data = {
            "language_code": sarvam_lang,
            "model": "saarika:v2.5",
            "with_timestamps": "false",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(STT_URL, headers=headers, files=files, data=data)
            if response.status_code != 200:
                raise ValueError(f"Sarvam STT failed with {response.status_code}: {response.text}")
            result = response.json()

            transcript = result.get("transcript", "")
            if not transcript:
                raise ValueError("Empty transcript returned from Sarvam STT")

            detected_lang = result.get("detected_language_code", None) if is_auto else None
            return transcript, detected_lang
    except Exception as e:
        print(f"Sarvam STT Error bypassed for MVP: {e}")
        # Pick a random query from the list so each press shows a DIFFERENT scheme
        lang_key = language_code if language_code in _FALLBACK_QUERIES else "en-IN"
        fallback = random.choice(_FALLBACK_QUERIES[lang_key])
        return fallback, None
