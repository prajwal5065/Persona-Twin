from fastapi import FastAPI
from backend.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

@app.get("/")
async def root():
    return {"message": "Welcome to Persona Twin API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
