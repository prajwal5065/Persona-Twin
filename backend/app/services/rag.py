from sqlalchemy.orm import Session
from backend.app.models.note import Note
from .retrieval import RetrievalService
from .llm import LLMService
from sqlalchemy import desc
from .style_extractor import StyleExtractorService
from typing import List

class RAGService:
    def __init__(self, db: Session, retrieval_service: RetrievalService = None, llm_service: LLMService = None, style_extractor: StyleExtractorService = None):
        self.db = db
        self.retrieval_service = retrieval_service or RetrievalService()
        self.llm_service = llm_service or LLMService()
        self.style_extractor = style_extractor or StyleExtractorService()

    def get_response(self, query: str) -> str:
        """
        Retrieves relevant notes, extracts style profile, and generates a personalized response.
        """
        # 1. Retrieve top 5 relevant note IDs for factual context
        note_ids = self.retrieval_service.find_similar_notes(query, top_k=5)
        
        # 2. Fetch relevant note contents from database
        relevant_notes = self.db.query(Note).filter(Note.id.in_(note_ids)).all()
        context = "\n".join([f"- {note.content}" for note in relevant_notes])

        # 3. Fetch recent notes to extract user style (Tone analysis)
        recent_notes = self.db.query(Note).order_by(desc(Note.created_at)).limit(10).all()
        recent_texts = [n.content for n in recent_notes]
        style_profile = self.style_extractor.extract_style(recent_texts)
        
        # 4. Generate response using LLM with context and style profile
        response = self.llm_service.generate_response(query, context, style_profile)
        
        return response
