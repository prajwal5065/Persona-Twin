from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.models.note import Note as NoteModel
from backend.app.schemas.note import Note as NoteSchema, NoteCreate
from backend.app.services.retrieval import RetrievalService

router = APIRouter(tags=["notes"])

@router.post("/add-note", response_model=NoteSchema)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = NoteModel(content=note.content, user_id=note.user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Add to FAISS index
    try:
        retrieval_service = RetrievalService()
        retrieval_service.add_note_to_index(db_note.id, db_note.content)
    except Exception as e:
        print(f"Error adding note to index: {e}")
        
    return db_note

@router.get("/notes", response_model=List[NoteSchema])
def read_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notes = db.query(NoteModel).offset(skip).limit(limit).all()
    return notes
