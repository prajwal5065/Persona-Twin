"""
services/voice.py
-----------------
VoiceService — audio-to-text transcription via OpenAI Whisper.

The service accepts raw audio bytes and the file's MIME type, wraps the
bytes in an in-memory BytesIO buffer (named so that the OpenAI client can
infer the file extension), and calls the Whisper API.

Supported MIME types → file extensions:
    audio/mpeg  → .mp3
    audio/wav   → .wav
    audio/mp4   → .mp4
    audio/m4a   → .m4a
"""


import io
import logging
from typing import ClassVar

import openai

from config import get_settings

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────

_MIME_TO_EXT: dict[str, str] = {
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/mp4": ".mp4",
    "audio/m4a": ".m4a",
}

_WHISPER_MODEL = "whisper-1"


# ── Service ────────────────────────────────────────────────────────────────────

class VoiceService:
    """Thin wrapper around the OpenAI Whisper transcription API."""

    SUPPORTED_MIME_TYPES: ClassVar[frozenset[str]] = frozenset(_MIME_TO_EXT.keys())

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        self._client = openai.OpenAI(api_key=api_key or settings.OPENAI_API_KEY)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def transcribe(self, audio_bytes: bytes, mime_type: str) -> str:
        """
        Transcribe *audio_bytes* using OpenAI Whisper.

        Parameters
        ----------
        audio_bytes:
            Raw audio file content.
        mime_type:
            MIME type of the audio (e.g. "audio/wav").

        Returns
        -------
        str
            The transcribed text, stripped of leading/trailing whitespace.

        Raises
        ------
        ValueError
            If *mime_type* is not in SUPPORTED_MIME_TYPES.
        RuntimeError
            If the Whisper API call fails for any reason.
        """
        if mime_type not in self.SUPPORTED_MIME_TYPES:
            raise ValueError(
                f"Unsupported audio format: '{mime_type}'. "
                f"Allowed types: {sorted(self.SUPPORTED_MIME_TYPES)}"
            )

        extension = _MIME_TO_EXT[mime_type]
        # The OpenAI client uses the filename to determine the codec;
        # wrapping bytes in a named BytesIO satisfies that requirement.
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = f"audio{extension}"

        try:
            response = self._client.audio.transcriptions.create(
                model=_WHISPER_MODEL,
                file=audio_file,
            )
            transcript: str = response.text.strip()
            logger.info(
                "voice_service: transcription complete (%d chars)", len(transcript)
            )
            return transcript

        except openai.OpenAIError as exc:
            logger.error("voice_service: Whisper API error: %s", exc)
            raise RuntimeError(f"Whisper transcription failed: {exc}") from exc
