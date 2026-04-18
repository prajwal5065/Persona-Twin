from sqlalchemy.orm import Session
from backend.app.models.note import Note
from .retrieval import RetrievalService
from .llm import LLMService
from typing import List

class RAGService:
    def __init__(self, db: Session, retrieval_service: RetrievalService = None, llm_service: LLMService = None):
        self.db = db
        self.retrieval_service = retrieval_service or RetrievalService()
        self.llm_service = llm_service or LLMService()

    def get_response(self, query: str) -> str:
        """
        Retrieves relevant notes, formats them as context, and generates a response using the LLM.
        """
        # 1. Retrieve top 5 relevant note IDs
        note_ids = self.retrieval_service.find_similar_notes(query, top_k=5)
        
        # 2. Fetch note contents from database
        relevant_notes = self.db.query(Note).filter(Note.id.in_(note_ids)).all()
        
        # 3. Format as context
        context = "\n".join([f"- {note.content}" for note in relevant_notes])
        
        # 4. Generate response using LLM
        response = self.llm_service.generate_response(query, context)
        
        return response
