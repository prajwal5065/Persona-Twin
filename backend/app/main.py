from fastapi import FastAPI
from backend.config import get_settings
from backend.app.db.database import engine, Base
from backend.app.routes import note, chat, insights, simulation, user
from backend.app.routes import auth  # ← new auth module
from backend.app.models import user as user_model, note as note_model  # Ensure models are loaded

# Create tables (includes hashed_password column added to User)
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

# Auth router first — exposes /auth/register and /auth/login
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(note.router)
app.include_router(chat.router)
app.include_router(insights.router)
app.include_router(simulation.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Persona Twin API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
