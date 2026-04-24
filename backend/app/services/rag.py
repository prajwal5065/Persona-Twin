"""
services/rag.py
---------------
RAG (Retrieval-Augmented Generation) pipeline.

_retrieve_notes() now performs real FAISS vector similarity search instead of
SQL ILIKE keyword matching.  The result set is scoped strictly to the
requesting user's own notes.

build_context() and build_prompt() are intentionally left unchanged so the
LLM prompt logic is not disturbed.
"""


import logging
from typing import List

from sqlalchemy.orm import Session

from backend.app.models.note import Note
from backend.app.services.retrieval import RetrievalService

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG pipeline scoped to a single user.

    Parameters
    ----------
    db:
        SQLAlchemy session used to hydrate Note objects from IDs returned
        by FAISS.
    user_id:
        The user whose FAISS index and notes are searched.
    retrieval_service:
        Optional injection point for testing/mocking.
    """

    def __init__(
        self,
        db: Session,
        user_id: int,
        retrieval_service: RetrievalService | None = None,
    ) -> None:
        self.db = db
        self.user_id = user_id
        self._retrieval = retrieval_service or RetrievalService()

    # ------------------------------------------------------------------
    # Retrieval — vector similarity search
    # ------------------------------------------------------------------

    def _retrieve_notes(self, query: str, top_k: int = 5) -> List[Note]:
        """
        Embed *query* and return the top-K most similar notes from the user's
        FAISS index.  When the index is empty (no notes indexed yet) falls back
        gracefully to an empty list — the prompt builder handles the empty case.
        """
        # 1. Vector search → list of Note IDs
        similar_ids: List[int] = self._retrieval.find_similar_notes(
            user_id=self.user_id,
            query=query,
            top_k=top_k,
        )

        if not similar_ids:
            logger.info(
                "user=%d  FAISS returned 0 results for query='%s'", self.user_id, query
            )
            return []

        # 2. Fetch Note rows in the order FAISS returned them (best-match first).
        #    Filter by user_id as a safety guard even though FAISS is already user-scoped.
        id_to_note = {
            n.id: n
            for n in self.db.query(Note)
            .filter(Note.id.in_(similar_ids), Note.user_id == self.user_id)
            .all()
        }

        # Preserve FAISS ranking order
        ordered_notes: List[Note] = [id_to_note[nid] for nid in similar_ids if nid in id_to_note]
        logger.info(
            "user=%d  retrieved %d notes via FAISS for query='%s'",
            self.user_id,
            len(ordered_notes),
            query,
        )
        return ordered_notes

    # ------------------------------------------------------------------
    # Context and prompt assembly (unchanged from original)
    # ------------------------------------------------------------------

    def build_context(self, notes: List[Note]) -> str:
        """Format retrieved notes into a structured context block for the LLM prompt."""
        if not notes:
            return ""

        context_lines = ["User's past notes and memories:"]
        for i, note in enumerate(notes, 1):
            context_lines.append(f"  {i}. {note.content}")

        return "\n".join(context_lines)

    def build_prompt(self, query: str, context: str) -> str:
        """Build the personalised digital-twin prompt combining context + query."""
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

    # ------------------------------------------------------------------
    # Main pipeline
    # ------------------------------------------------------------------

    def get_response(self, query: str, llm_service) -> str:
        """
        Full RAG pipeline:
        1. Retrieve relevant notes via FAISS vector search
        2. Build structured context string
        3. Create personalised prompt
        4. Send to LLM and return response
        """
        # Step 1: FAISS retrieval
        relevant_notes: List[Note] = self._retrieve_notes(query, top_k=5)

        # Step 2: Build context
        context: str = self.build_context(relevant_notes)

        # Step 3: Build prompt
        prompt: str = self.build_prompt(query, context)

        # Step 4: Call LLM (unchanged)
        return llm_service.generate_response(prompt)
