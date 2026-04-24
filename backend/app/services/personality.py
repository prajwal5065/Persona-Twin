"""
services/personality.py
-----------------------
PersonalityService — OCEAN-based personality profiling.

analyze(user_id) pipeline:
  1. Fetch the 30 most recent notes for the user from the DB.
  2. Join their content into a single text block (≤ 4 000 chars).
  3. Ask LLMService to return structured JSON with 5 OCEAN float scores
     and a one-sentence summary.
  4. Validate all scores are floats in [0.0, 1.0].
  5. Persist the profile to user.personality_profile in the DB.
  6. Return the validated dict.
"""


import json
import logging
import re
from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.note import Note as NoteModel
from backend.app.models.user import User as UserModel

if TYPE_CHECKING:
    from backend.app.services.llm import LLMService

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────

_OCEAN_KEYS = {"openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"}
_MAX_CHARS = 4_000
_NOTE_LIMIT = 30

_PROMPT_TEMPLATE = (
    "Analyze these text samples written by one person over time. "
    "Return ONLY valid JSON with these exact keys: "
    "{openness, conscientiousness, extraversion, agreeableness, neuroticism, summary} "
    "Each score is a float from 0.0 to 1.0. "
    "summary is a single sentence describing their personality. "
    "Text samples: {combined_notes}"
)


# ── Service ────────────────────────────────────────────────────────────────────

class PersonalityService:
    """Analyses a user's notes and produces an OCEAN personality profile."""

    def __init__(self, db: AsyncSession, llm: "LLMService") -> None:
        self.db = db
        self.llm = llm

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def analyze(self, user_id: int) -> dict:
        """
        Run the full personality-profiling pipeline for *user_id*.

        Returns
        -------
        dict
            Keys: openness, conscientiousness, extraversion, agreeableness,
                  neuroticism (all float 0.0–1.0) and summary (str).

        Raises
        ------
        ValueError
            If the LLM response cannot be parsed or scores are out of range.
        LookupError
            If *user_id* does not exist in the database.
        """
        # 1. Fetch 30 most-recent notes ───────────────────────────────────────
        stmt = (
            select(NoteModel)
            .where(NoteModel.user_id == user_id)
            .order_by(NoteModel.created_at.desc())
            .limit(_NOTE_LIMIT)
        )
        result = await self.db.execute(stmt)
        notes: list[NoteModel] = list(result.scalars().all())

        if not notes:
            raise ValueError(f"No notes found for user_id={user_id}. Cannot build a personality profile.")

        logger.info("personality_service: fetched %d notes for user_id=%d", len(notes), user_id)

        # 2. Combine into a single text block ─────────────────────────────────
        combined_notes = self._combine_notes(notes)

        # 3. Call LLM ─────────────────────────────────────────────────────────
        prompt = _PROMPT_TEMPLATE.format(combined_notes=combined_notes)
        raw_response: str = self.llm.generate_response(prompt)
        logger.debug("personality_service: raw LLM response: %s", raw_response)

        # 4. Parse & validate ─────────────────────────────────────────────────
        profile = self._parse_and_validate(raw_response)

        # 5. Persist to DB ────────────────────────────────────────────────────
        await self._persist(user_id, profile)

        # 6. Return ───────────────────────────────────────────────────────────
        return profile

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _combine_notes(notes: list[NoteModel]) -> str:
        """
        Join note contents with double-newline separators.
        Truncates the result to _MAX_CHARS characters to stay within
        the prompt budget.
        """
        parts: list[str] = []
        total = 0
        for note in notes:
            text = (note.content or "").strip()
            if not text:
                continue
            if total + len(text) > _MAX_CHARS:
                remaining = _MAX_CHARS - total
                if remaining > 0:
                    parts.append(text[:remaining])
                break
            parts.append(text)
            total += len(text)

        return "\n\n".join(parts)

    @staticmethod
    def _parse_and_validate(raw: str) -> dict:
        """
        Extract JSON from the LLM response and validate OCEAN scores.

        The LLM sometimes wraps the JSON in a markdown code-fence; this method
        strips that before parsing.
        """
        # Strip optional ```json … ``` wrapper
        cleaned = re.sub(r"```(?:json)?\s*", "", raw, flags=re.IGNORECASE).strip().rstrip("`").strip()

        try:
            data: dict = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(f"LLM did not return valid JSON. Raw response: {raw!r}") from exc

        # Validate OCEAN keys exist and are floats in [0.0, 1.0]
        missing = _OCEAN_KEYS - data.keys()
        if missing:
            raise ValueError(f"LLM response missing OCEAN keys: {missing}. Response: {data}")

        if "summary" not in data:
            raise ValueError(f"LLM response missing 'summary' key. Response: {data}")

        for key in _OCEAN_KEYS:
            try:
                score = float(data[key])
            except (TypeError, ValueError) as exc:
                raise ValueError(f"OCEAN key '{key}' is not a valid float: {data[key]!r}") from exc

            if not (0.0 <= score <= 1.0):
                raise ValueError(f"OCEAN key '{key}' score {score} is outside [0.0, 1.0].")

            data[key] = round(score, 4)  # normalise to 4 d.p.

        return data

    async def _persist(self, user_id: int, profile: dict) -> None:
        """Write *profile* to user.personality_profile and commit."""
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user: UserModel | None = result.scalar_one_or_none()

        if user is None:
            raise LookupError(f"User with id={user_id} not found.")

        user.personality_profile = profile
        await self.db.commit()
        logger.info("personality_service: profile persisted for user_id=%d", user_id)
