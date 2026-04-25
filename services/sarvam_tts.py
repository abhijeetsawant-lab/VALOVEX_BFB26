import httpx
import os
import base64
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
TTS_URL = "https://api.sarvam.ai/text-to-speech"


async def synthesize_speech(text: str, language_code: str) -> str:
    """Send text to Sarvam AI TTS and return base64-encoded audio."""
    try:
        headers = {
            "api-subscription-key": SARVAM_API_KEY,
            "Content-Type": "application/json",
        }

        payload = {
            "inputs": [text],
            "target_language_code": language_code,
            "speaker": "meera",
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.5,
            "enable_preprocessing": True,
            "model": "bulbul:v1",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(TTS_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            audios = result.get("audios", [])
            if not audios:
                return ""
            return audios[0]
    except Exception as e:
        print(f"Sarvam TTS Error bypassed for MVP: {e}")
        return ""
