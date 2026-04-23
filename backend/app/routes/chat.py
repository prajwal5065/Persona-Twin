"""
routes/chat.py
--------------
RAG-powered chat endpoint.

LLMService is retrieved from app.state.llm (singleton created at startup)
instead of being instantiated per-request.

Passes request.user_id to RAGService so retrieval is scoped to the correct
per-user FAISS index.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_async_db
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.rag import RAGService
from backend.app.rate_limit import limiter

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(
    body: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
) -> ChatResponse:
    """
    RAG-powered chat endpoint.

    Flow:
    1. Retrieve the shared LLMService singleton from app.state.
    2. Embed the query and search the user's FAISS index for similar notes.
    3. Hydrate matching Note rows from the DB.
    4. Build a personalised digital-twin prompt.
    5. Send to Gemini and return the response.
    """
    try:
        llm_service = request.app.state.llm

        # user_id scopes FAISS search to this user's own notes
        rag_service = RAGService(db=db, user_id=body.user_id)

        ai_response: str = await rag_service.get_response(
            query=body.query,
            llm_service=llm_service,
        )

        return ChatResponse(response=ai_response)

    except Exception as exc:
        logger.error("Chat endpoint error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Service Error: {exc}",
        ) from exc
