from pydantic import BaseModel


class ChatRequest(BaseModel):
    query: str
    user_id: int  # required so RAGService can scope FAISS search to the right user


class ChatResponse(BaseModel):
    response: str
