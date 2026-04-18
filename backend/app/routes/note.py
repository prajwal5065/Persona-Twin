from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging
from backend.app.db.database import get_db
from backend.app.models.note import Note as NoteModel
from backend.app.schemas.note import Note as NoteSchema, NoteCreate
router = APIRouter(tags=["notes"])
logger = logging.getLogger(__name__)

@router.post("/add-note", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    try:
        # DB storage
        db_note = NoteModel(content=note.content, user_id=note.user_id)
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        
        # Lazy import of AI services to prevent startup crash if Torch/DLLs are missing
        try:
            from backend.app.services.retrieval import RetrievalService
            retrieval_service = RetrievalService()
            retrieval_service.add_note_to_index(db_note.id, db_note.content)
        except Exception as e:
            logger.warning(f"AI Indexing skipped: {e}")
            
        return db_note
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during note creation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store note in database"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/notes", response_model=List[NoteSchema])
def read_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        notes = db.query(NoteModel).offset(skip).limit(limit).all()
        return notes
    except SQLAlchemyError as e:
        logger.error(f"Database error during fetching notes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notes from database"
        )
