import os
import io
import time
import httpx
import edge_tts
from typing import Optional

DEFAULT_ELEVEN_VOICE = "21m00Tcm4TlvDq8ikWAM" # Rachel

# High-fidelity Edge Neural voices for Indian Languages:
EDGE_VOICE_MAP = {
    "en": "en-IN-NeerjaNeural",  # Indian English accent
    "kn": "kn-IN-SapnaNeural",   # Kannada (Karnataka native accent)
    "hi": "hi-IN-SwaraNeural"    # Hindi (Indian native accent)
}

def detect_language(text: str, explicit_lang: Optional[str] = None) -> str:
    """Detect language based on character script or explicit flag."""
    if not text:
        return explicit_lang if explicit_lang in ["kn", "hi", "en"] else "en"
    # 1. Kannada Unicode range: 0x0C80 - 0x0CFF
    if any(0x0C80 <= ord(char) <= 0x0CFF for char in text):
        return "kn"
    # 2. Devanagari (Hindi) range: 0x0900 - 0x097F
    if any(0x0900 <= ord(char) <= 0x097F for char in text):
        return "hi"
    # 3. Explicit language passed
    if explicit_lang in ["kn", "hi", "en"]:
        return explicit_lang
    return "en"

class TTSService:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "")

    async def generate_audio(
        self, 
        text: str, 
        voice_id: Optional[str] = None, 
        api_key: Optional[str] = None,
        language: Optional[str] = None
    ) -> bytes:
        """
        Generate MP3 audio bytes using authentic regional neural voices:
        - Kannada: kn-IN-SapnaNeural (Karnataka accent)
        - Hindi: hi-IN-SwaraNeural (Indian accent)
        - English: ElevenLabs or en-IN-NeerjaNeural
        """
        if not text or not text.strip():
            return b""

        clean_text = text.strip()
        resolved_lang = detect_language(clean_text, language)

        # 1. For Kannada & Hindi: Always prioritize Edge Neural Indian native accents
        if resolved_lang in ["kn", "hi"]:
            target_voice = EDGE_VOICE_MAP.get(resolved_lang, "kn-IN-SapnaNeural" if resolved_lang == "kn" else "hi-IN-SwaraNeural")
            try:
                print(f"[TTS] Generating native {resolved_lang.upper()} speech ({target_voice})...")
                communicate = edge_tts.Communicate(clean_text, target_voice)
                audio_buffer = io.BytesIO()
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_buffer.write(chunk["data"])
                audio_bytes = audio_buffer.getvalue()
                if len(audio_bytes) > 100:
                    print(f"[TTS] Native {resolved_lang.upper()} audio ready ({len(audio_bytes)} bytes)")
                    return audio_bytes
            except Exception as e:
                print(f"[TTS] Edge-TTS error for {resolved_lang}: {e}")

        # 2. For English: Try ElevenLabs if API key is provided
        key_to_use = api_key or os.getenv("ELEVENLABS_API_KEY", self.api_key)
        if key_to_use and resolved_lang == "en":
            selected_voice = voice_id or DEFAULT_ELEVEN_VOICE
            try:
                print(f"[TTS] Generating English TTS via ElevenLabs (Voice: {selected_voice})...")
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice}"
                headers = {
                    "xi-api-key": key_to_use,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                }
                payload = {
                    "text": clean_text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.8,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200 and len(resp.content) > 100:
                        print(f"[TTS] ElevenLabs audio generated ({len(resp.content)} bytes)")
                        return resp.content
                    else:
                        print(f"[TTS] ElevenLabs returned {resp.status_code}: {resp.text[:200]}")
            except Exception as e:
                print(f"[TTS] ElevenLabs request failed: {e}")

        # 3. Fallback to Microsoft Edge Indian English Neural Voice
        target_edge_voice = EDGE_VOICE_MAP.get(resolved_lang, "en-IN-NeerjaNeural")
        try:
            print(f"[TTS] Generating TTS via Edge-TTS Neural ({target_edge_voice})...")
            communicate = edge_tts.Communicate(clean_text, target_edge_voice)
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            audio_bytes = audio_buffer.getvalue()
            print(f"[TTS] Edge-TTS audio generated ({len(audio_bytes)} bytes)")
            return audio_bytes
        except Exception as e:
            print(f"[TTS] Fallback TTS failed: {e}")
            return b""

tts_service = TTSService()
