from fastapi import FastAPI
from backend.config import get_settings
from backend.app.db.database import engine, Base
from backend.app.routes import note, chat
from backend.app.models import user, note as note_model # Ensure models are loaded

# Create tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

app.include_router(note.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Persona Twin API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
