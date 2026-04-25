import os
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

LANGUAGE_NAMES = {
    "mr-IN": "Marathi",
    "hi-IN": "Hindi",
    "en-IN": "English",
}

# ── Prompt without scheme context (generic fallback) ────────────────────────
_SYSTEM_GENERIC = (
    "You are NaamSeva, a helpful Indian government services assistant. "
    "Always reply in {language}. Use very simple words like you are "
    "explaining to a village elder. Give numbered steps. Keep it under "
    "80 words. Never use jargon. "
    "If you don't have specific information, say: "
    "'Please visit your nearest CSC center for this query.'"
)

# ── Prompt with scheme context injected ─────────────────────────────────────
_SYSTEM_WITH_CONTEXT = (
    "You are NaamSeva, an Indian government services assistant. "
    "Reply in {language}. Use simple words. Max 80 words. Numbered steps only.\n\n"
    "Context from knowledge base:\n"
    "{scheme_context}\n\n"
    "Answer based on the context above. "
    "If the user's question is not covered by the context, say: "
    "'Please visit your nearest CSC center for this query.'"
)


async def get_llm_response(
    transcript: str,
    language_code: str,
    scheme_context: Optional[str] = None,
) -> str:
    language_name = LANGUAGE_NAMES.get(language_code, "English")

    if scheme_context:
        system_instruction = _SYSTEM_WITH_CONTEXT.format(
            language=language_name,
            scheme_context=scheme_context,
        )
    else:
        system_instruction = _SYSTEM_GENERIC.format(language=language_name)

    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        prompt = f"{system_instruction}\n\nUser Question:\n{transcript}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error bypassed for MVP: {e}")
        # Smart fallback — use scheme data to build a real answer
        return _build_offline_response(transcript, language_code, scheme_context)


def _build_offline_response(transcript: str, language_code: str, scheme_context: Optional[str]) -> str:
    """Build a useful response from local scheme data when Gemini is unavailable."""
    from services.scheme_matcher import match_scheme, get_scheme

    scheme_id = match_scheme(transcript)
    scheme = get_scheme(scheme_id) if scheme_id else None

    if scheme:
        lang = language_code[:2]
        name = scheme.get(f"name_{lang}", scheme["name"])
        steps_key = f"steps_{lang}" if f"steps_{lang}" in scheme else "steps_en"
        steps = scheme.get(steps_key, scheme.get("steps_en", []))
        docs = scheme.get("documents", [])
        benefit = scheme.get("benefit", "")
        eligibility = scheme.get("eligibility", "")
        url = scheme.get("apply_url", "")

        parts = [f"📋 {name}\n"]
        if benefit:
            parts.append(f"💰 Benefit: {benefit}\n")
        if eligibility:
            parts.append(f"✅ Eligibility: {eligibility}\n")
        if steps:
            parts.append("📝 Steps to Apply:")
            for i, step in enumerate(steps[:6], 1):
                parts.append(f"  {i}. {step}")
        if docs:
            parts.append(f"\n📄 Documents: {', '.join(docs[:5])}")
        if url:
            parts.append(f"\n🔗 Apply: {url}")
        return "\n".join(parts)
    else:
        if language_code == "mr-IN":
            return (
                "नमस्कार! NaamSeva मध्ये आपले स्वागत आहे.\n\n"
                "तुमच्या प्रश्नासाठी, कृपया खालील पर्याय वापरा:\n"
                "1. 📋 'Schemes' बटण दाबा — 25+ सरकारी योजना पहा\n"
                "2. ✅ 'Check My Eligibility' — तुम्हाला कोणत्या योजना लागू होतात ते तपासा\n"
                "3. कृपया तुमचा प्रश्न अधिक विशिष्ट करा (उदा: 'रेशन कार्ड', 'शिष्यवृत्ती', 'आधार')"
            )
        elif language_code == "hi-IN":
            return (
                "नमस्ते! NaamSeva में आपका स्वागत है.\n\n"
                "आपके प्रश्न के लिए:\n"
                "1. 📋 'Schemes' बटन दबाएं — 25+ सरकारी योजनाएं देखें\n"
                "2. ✅ 'Check My Eligibility' — कौन सी योजनाएं आप पर लागू हैं\n"
                "3. अपना प्रश्न और विशिष्ट करें (जैसे: 'राशन कार्ड', 'छात्रवृत्ति', 'आधार')"
            )
        else:
            return (
                "Hello! Welcome to NaamSeva.\n\n"
                "For your query, please try:\n"
                "1. 📋 Click 'Schemes' — browse 25+ government schemes\n"
                "2. ✅ Click 'Check My Eligibility' — find schemes you qualify for\n"
                "3. Try a specific query like 'ration card', 'scholarship', 'aadhaar update'"
            )
