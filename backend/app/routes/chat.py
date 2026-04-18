from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from backend.app.db.database import get_db
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.llm import LLMService

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Direct Chat Endpoint. 
    Temporarily bypassing RAG/Memories to avoid the system-level Torch DLL error.
    """
    try:
        # Direct Gemini Call
        llm_service = LLMService()
        ai_response = llm_service.generate_response(
            prompt=request.query, 
            context="System is currently in Direct-Mode (RAG/Memory is pending system fixes).",
            style_profile="Helpful digital twin."
        )
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        logger.error(f"Chat Endpoint Failure: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"AI Service Error: {str(e)}"
        )
