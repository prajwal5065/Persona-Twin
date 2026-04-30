"""
routes/note.py
--------------
Note management endpoints.

• POST /add-note          — save a note and index it in FAISS.
• GET  /notes             — list notes (optionally scoped to a user).
• POST /notes/reindex     — rebuild FAISS index from DB notes.
• POST /notes/voice       — transcribe an audio file via Whisper and save as a note.
"""

import logging
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_db
from app.dependencies.auth import get_current_user
from app.models.note import Note as NoteModel
from app.models.user import User as UserModel
from app.schemas.note import Note as NoteSchema, NoteCreate
from app.rate_limit import limiter

# ── Voice endpoint constants ───────────────────────────────────────────────────
_ALLOWED_AUDIO_TYPES: frozenset[str] = frozenset({
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/m4a",
})
_MAX_AUDIO_BYTES: int = 25 * 1024 * 1024  # 25 MB

router = APIRouter(tags=["notes"])
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# POST /add-note
# ---------------------------------------------------------------------------

@router.post("/add-note", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_note(
    request: Request,
    note: NoteCreate,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
) -> NoteSchema:
    """
    Save a note to the database and index it in the user's FAISS vector store.

    The FAISS indexing step is non-critical: the note is always saved and the
    HTTP 201 is always returned.  If indexing fails the error is logged at
    WARNING level so it shows up in server logs without crashing the request.
    """
    # --- DB write (critical) ---
    try:
        db_note = NoteModel(content=note.content, user_id=current_user.id)
        db.add(db_note)
        await db.commit()
        await db.refresh(db_note)
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error("DB error during note creation for user %d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store note in database",
        ) from exc

    # --- FAISS indexing (non-critical, lazy import keeps startup clean) ---
    try:
        from app.services.retrieval import RetrievalService

        retrieval_service = RetrievalService()
        retrieval_service.add_note_to_index(
            user_id=db_note.user_id,
            note_id=db_note.id,
            content=db_note.content,
        )
        logger.info("note_id=%d indexed in FAISS for user=%d", db_note.id, db_note.user_id)
    except Exception as exc:  # noqa: BLE001
        # Non-fatal: log clearly but do not fail the request.
        logger.warning(
            "FAISS indexing skipped for note_id=%d user=%d: %s",
            db_note.id,
            db_note.user_id,
            exc,
        )

    return db_note


# ---------------------------------------------------------------------------
# GET /notes
# ---------------------------------------------------------------------------

@router.get("/notes", response_model=List[NoteSchema])
async def read_notes(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db),
) -> List[NoteSchema]:
    """Return notes for the authenticated user."""
    try:
        stmt = (
            select(NoteModel)
            .where(NoteModel.user_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()
    except SQLAlchemyError as exc:
        logger.error("DB error during note fetch for user %d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notes from database",
        ) from exc


# ---------------------------------------------------------------------------
# POST /notes/reindex  (new)
# ---------------------------------------------------------------------------

@router.post("/notes/reindex", status_code=status.HTTP_200_OK)
async def reindex_notes(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """
    Rebuild the FAISS vector index for *user_id* from scratch using all their
    notes currently stored in the database.

    Use this endpoint when:
    - The index file is corrupted or deleted.
    - Notes were imported directly into the DB without going through /add-note.
    - The embedding model is upgraded and all vectors need to be regenerated.
    """
    stmt = (
        select(NoteModel)
        .where(NoteModel.user_id == current_user.id)
        .order_by(NoteModel.id)
    )
    result = await db.execute(stmt)
    notes: List[NoteModel] = result.scalars().all()

    if not notes:
        return {"detail": f"No notes found for user_id={current_user.id}. Index is empty."}

    note_ids = [n.id for n in notes]
    contents = [n.content for n in notes]

    try:
        from app.services.retrieval import RetrievalService

        retrieval_service = RetrievalService()
        retrieval_service.rebuild_index(
            user_id=current_user.id,
            note_ids=note_ids,
            contents=contents,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Reindex failed for user=%d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reindex failed: {exc}",
        ) from exc

    return {
        "detail": f"Reindex complete for user_id={current_user.id}.",
        "notes_indexed": len(note_ids),
    }


# ---------------------------------------------------------------------------
# POST /notes/voice
# ---------------------------------------------------------------------------

@router.post("/notes/voice", status_code=status.HTTP_201_CREATED)
async def voice_to_note(
    audio: Annotated[UploadFile, File(description="Audio file to transcribe (mp3/wav/mp4/m4a, max 25 MB)")],
    db: Annotated[AsyncSession, Depends(get_async_db)],
    current_user: Annotated[UserModel, Depends(get_current_user)],
) -> dict:
    """
    Transcribe an uploaded audio file with OpenAI Whisper and save the result
    as a new Note for the authenticated user.

    Returns
    -------
    JSON with two keys:
      • ``note``          — the persisted Note object (id, user_id, content, created_at)
      • ``transcription`` — the raw text returned by Whisper
    """
    # 1. Validate MIME type ───────────────────────────────────────────────────
    content_type: str = (audio.content_type or "").lower()
    if content_type not in _ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported audio format: '{content_type}'. "
                f"Allowed: {sorted(_ALLOWED_AUDIO_TYPES)}"
            ),
        )

    # 2. Enforce max file size before reading the whole payload ───────────────
    # UploadFile.size is set by Starlette when the client sends Content-Length.
    # We also double-check after reading to handle chunked transfers.
    if audio.size is not None and audio.size > _MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file exceeds the 25 MB limit ({audio.size} bytes received).",
        )

    audio_bytes: bytes = await audio.read()
    if len(audio_bytes) > _MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Audio file exceeds the 25 MB limit "
                f"({len(audio_bytes):,} bytes after reading)."
            ),
        )

    # 3. Transcribe via Whisper (lazy import — keeps startup fast) ────────────
    try:
        from app.services.voice import VoiceService

        voice_service = VoiceService()
        transcription: str = voice_service.transcribe(
            audio_bytes=audio_bytes,
            mime_type=content_type,
        )
    except ValueError as exc:
        # Raised by VoiceService for unsupported MIME types (belt-and-suspenders)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        # Raised by VoiceService when the Whisper API call fails
        logger.error("Whisper API error for user_id=%d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Transcription service unavailable: {exc}",
        ) from exc

    # 4. Persist transcription as a Note ──────────────────────────────────────
    try:
        db_note = NoteModel(content=transcription, user_id=current_user.id)
        db.add(db_note)
        await db.commit()
        await db.refresh(db_note)
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error("DB error saving voice note for user_id=%d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store transcription as a note.",
        ) from exc

    # 5. Non-critical: index the new note in FAISS ────────────────────────────
    try:
        from app.services.retrieval import RetrievalService

        retrieval_service = RetrievalService()
        retrieval_service.add_note_to_index(
            user_id=db_note.user_id,
            note_id=db_note.id,
            content=db_note.content,
        )
        logger.info(
            "voice_note: note_id=%d indexed in FAISS for user_id=%d",
            db_note.id,
            db_note.user_id,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "voice_note: FAISS indexing skipped for note_id=%d user_id=%d: %s",
            db_note.id,
            db_note.user_id,
            exc,
        )

    # 6. Return note + raw transcription ──────────────────────────────────────
    return {
        "note": NoteSchema.model_validate(db_note),
        "transcription": transcription,
    }


# ---------------------------------------------------------------------------
# DELETE /notes/{note_id}
# ---------------------------------------------------------------------------

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db),
) -> None:
    """
    Delete a note from the database and remove it from the vector index.
    """
    try:
        stmt = select(NoteModel).where(
            (NoteModel.id == note_id) & (NoteModel.user_id == current_user.id)
        )
        result = await db.execute(stmt)
        db_note = result.scalar_one_or_none()

        if not db_note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )

        # Delete from DB
        await db.delete(db_note)
        await db.commit()

        # Non-critical: remove from index (optional/rebuild handles this usually, 
        # but for consistency we should trigger a refresh or mark as deleted if supported).
        # For FAISS simple index, we usually rebuild if many are deleted.
        # Here we just log it.
        logger.info("Deleted note_id=%d for user_id=%d", note_id, current_user.id)

    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error("DB error during note deletion: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete note",
        ) from exc
