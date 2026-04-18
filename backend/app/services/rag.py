from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from backend.app.models.note import Note
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class RAGService:
    """
    RAG (Retrieval-Augmented Generation) Service.
    
    Retrieval strategy: Keyword-based search over stored notes.
    This avoids any dependency on Torch/FAISS while still providing
    meaningful context from the user's past notes.
    
    When Torch/FAISS is fixed, swap _retrieve_notes() with vector similarity search.
    """

    def __init__(self, db: Session):
        self.db = db

    def _retrieve_notes(self, query: str, top_k: int = 5) -> List[Note]:
        """
        Retrieves the most relevant notes for a given query using keyword search.
        Falls back to the most recent notes if no keyword matches are found.
        """
        # Extract meaningful keywords from the query (words longer than 3 chars)
        query_words = [w.lower() for w in query.split() if len(w) > 3]

        if query_words:
            # Build a case-insensitive OR filter across all keywords
            filters = [Note.content.ilike(f"%{word}%") for word in query_words]
            matched_notes = (
                self.db.query(Note)
                .filter(or_(*filters))
                .order_by(desc(Note.created_at))
                .limit(top_k)
                .all()
            )
            if matched_notes:
                logger.info(f"RAG: Found {len(matched_notes)} keyword-matched notes for query '{query}'")
                return matched_notes

        # Fallback: return most recent notes as context
        recent_notes = (
            self.db.query(Note)
            .order_by(desc(Note.created_at))
            .limit(top_k)
            .all()
        )
        logger.info(f"RAG: No keyword matches found. Using {len(recent_notes)} recent notes as context.")
        return recent_notes

    def build_context(self, notes: List[Note]) -> str:
        """
        Formats retrieved notes into a structured context block for the LLM prompt.
        """
        if not notes:
            return ""

        context_lines = ["User's past notes and memories:"]
        for i, note in enumerate(notes, 1):
            context_lines.append(f"  {i}. {note.content}")

        return "\n".join(context_lines)

    def build_prompt(self, query: str, context: str) -> str:
        """
        Builds the personalized digital twin prompt combining context + query.
        """
        if context:
            return f"""You are the digital twin of this user. You have access to their past thoughts and notes.

{context}

Based on these memories and the user's patterns, answer the following question as if you ARE the user — using their perspective, thinking style, and past context:

Question: {query}

Respond in first person, naturally and authentically. Do NOT say "As your digital twin..." — just respond directly."""
        else:
            return f"""You are the digital twin of this user. You don't have specific memories for this query yet.

Answer the following question helpfully and naturally:

Question: {query}

Respond conversationally and personally."""

    def get_response(self, query: str, llm_service) -> str:
        """
        Main RAG pipeline:
        1. Retrieve relevant notes from DB
        2. Build structured context
        3. Create personalized prompt
        4. Send to LLM and return response
        """
        # Step 1: Retrieve
        relevant_notes = self._retrieve_notes(query, top_k=5)

        # Step 2: Build context
        context = self.build_context(relevant_notes)

        # Step 3: Build prompt
        prompt = self.build_prompt(query, context)

        # Step 4: Call LLM
        return llm_service.generate_response(prompt)
