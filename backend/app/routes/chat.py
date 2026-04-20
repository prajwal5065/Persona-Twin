"""
routes/chat.py
--------------
RAG-powered chat endpoint.

Passes request.user_id to RAGService so retrieval is scoped to the correct
per-user FAISS index.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.llm import LLMService
from backend.app.services.rag import RAGService

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    """
    RAG-powered chat endpoint.

    Flow:
    1. Embed the query and search the user's FAISS index for similar notes
    2. Hydrate matching Note rows from the DB
    3. Build a personalised digital-twin prompt
    4. Send to Gemini and return the response
    """
    try:
        llm_service = LLMService()
        # user_id scopes FAISS search to this user's own notes
        rag_service = RAGService(db=db, user_id=request.user_id)

        ai_response: str = rag_service.get_response(
            query=request.query,
            llm_service=llm_service,
        )

        return ChatResponse(response=ai_response)

    except Exception as exc:
        logger.error("Chat endpoint error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Service Error: {exc}",
        ) from exc
