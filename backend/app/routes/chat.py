from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.services.rag import RAGService
from backend.app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    FastAPI endpoint for chat.
    Retrieves internal memories (notes) and generates an AI response.
    """
    try:
        rag_service = RAGService(db)
        ai_response = rag_service.get_response(request.query)
        return ChatResponse(response=ai_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
