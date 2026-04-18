from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from backend.app.db.database import get_db
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.llm import LLMService
from backend.app.services.rag import RAGService

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    RAG-powered Chat endpoint.
    
    Flow:
    1. Receive user query
    2. Retrieve relevant notes from DB (keyword search)
    3. Build a personalized digital twin prompt
    4. Send to Gemini and return the response
    """
    try:
        llm_service = LLMService()
        rag_service = RAGService(db)
        
        # Full RAG pipeline: retrieve → build prompt → call LLM
        ai_response = rag_service.get_response(
            query=request.query,
            llm_service=llm_service
        )
        
        return ChatResponse(response=ai_response)

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Service Error: {str(e)}"
        )
