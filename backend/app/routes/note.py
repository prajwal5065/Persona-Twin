"""
routes/note.py
--------------
Note management endpoints.

Changes vs original:
• POST /add-note    — passes user_id to retrieval_service.add_note_to_index();
                      surfaces indexing errors as HTTP 207 warnings instead of
                      silently swallowing them.
• GET  /notes       — unchanged, but now filtered to a specific user via ?user_id=
• POST /notes/reindex — NEW: rebuilds the FAISS index for a user from their DB notes.
"""

from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.note import Note as NoteModel
from backend.app.schemas.note import Note as NoteSchema, NoteCreate

router = APIRouter(tags=["notes"])
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# POST /add-note
# ---------------------------------------------------------------------------

@router.post("/add-note", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)) -> NoteSchema:
    """
    Save a note to the database and index it in the user's FAISS vector store.

    The FAISS indexing step is non-critical: the note is always saved and the
    HTTP 201 is always returned.  If indexing fails the error is logged at
    WARNING level so it shows up in server logs without crashing the request.
    """
    # --- DB write (critical) ---
    try:
        db_note = NoteModel(content=note.content, user_id=note.user_id)
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("DB error during note creation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store note in database",
        ) from exc

    # --- FAISS indexing (non-critical, lazy import keeps startup clean) ---
    try:
        from backend.app.services.retrieval import RetrievalService

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
def read_notes(
    user_id: int | None = Query(default=None, description="Filter notes by user"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[NoteSchema]:
    """Return notes, optionally scoped to a single user."""
    try:
        q = db.query(NoteModel)
        if user_id is not None:
            q = q.filter(NoteModel.user_id == user_id)
        return q.offset(skip).limit(limit).all()
    except SQLAlchemyError as exc:
        logger.error("DB error during note fetch: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notes from database",
        ) from exc


# ---------------------------------------------------------------------------
# POST /notes/reindex  (new)
# ---------------------------------------------------------------------------

@router.post("/notes/reindex", status_code=status.HTTP_200_OK)
def reindex_notes(
    user_id: int = Query(..., description="User whose FAISS index should be rebuilt"),
    db: Session = Depends(get_db),
) -> dict:
    """
    Rebuild the FAISS vector index for *user_id* from scratch using all their
    notes currently stored in the database.

    Use this endpoint when:
    - The index file is corrupted or deleted.
    - Notes were imported directly into the DB without going through /add-note.
    - The embedding model is upgraded and all vectors need to be regenerated.
    """
    # Fetch every note for the user
    notes: List[NoteModel] = (
        db.query(NoteModel)
        .filter(NoteModel.user_id == user_id)
        .order_by(NoteModel.id)
        .all()
    )

    if not notes:
        return {"detail": f"No notes found for user_id={user_id}. Index is empty."}

    note_ids = [n.id for n in notes]
    contents = [n.content for n in notes]

    try:
        from backend.app.services.retrieval import RetrievalService

        retrieval_service = RetrievalService()
        retrieval_service.rebuild_index(
            user_id=user_id,
            note_ids=note_ids,
            contents=contents,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Reindex failed for user=%d: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reindex failed: {exc}",
        ) from exc

    return {
        "detail": f"Reindex complete for user_id={user_id}.",
        "notes_indexed": len(note_ids),
    }
