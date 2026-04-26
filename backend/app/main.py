"""
main.py
-------
FastAPI application entry point.

Startup (lifespan):
  • Creates LLMService once and stores it on app.state.llm so every route
    can share the same instance instead of constructing a new one per request.
  • Creates all ORM tables via the async engine.

All routes retrieve the singleton via:
    request.app.state.llm
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.database import async_engine, Base
from backend.app.routes import note, chat, insights, simulation, user, profile, digest
from backend.app.routes import auth
from backend.app.models import user as user_model, note as note_model, digest as digest_model  # noqa: F401 — ensure models are registered
from backend.app.services.llm import LLMService
from backend.config import get_settings
from backend.app.tasks.weekly_digest import setup_scheduler
from backend.app.rate_limit import limiter
from backend.app.logger import setup_logging
from backend.app.middleware.logging import RequestLoggingMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded", "retry_after": 60}
    )


# ---------------------------------------------------------------------------
# Lifespan: startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.

    Startup
    -------
    1. Create all ORM tables (idempotent — safe with Alembic-managed DBs too).
    2. Instantiate LLMService once and attach it to app.state.llm.

    Shutdown
    --------
    Dispose the async engine connection pool gracefully.
    """
    # --- Startup ---
    app.state.llm = LLMService()
    app.state.limiter = limiter
    setup_scheduler()

    yield  # ← application runs here

    # --- Shutdown ---
    await async_engine.dispose()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

setup_logging()
settings = get_settings()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router first — exposes /auth/register and /auth/login
app.include_router(auth.router)
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)
app.include_router(user.router)
app.include_router(note.router)
app.include_router(chat.router)
app.include_router(insights.router)
app.include_router(simulation.router)
app.include_router(profile.router)
app.include_router(digest.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Persona Twin API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
