"""
db/database.py
--------------
Database engine configuration.

Provides:
  • async_engine  — SQLAlchemy async engine (asyncpg driver)
  • AsyncSessionLocal — async session factory
  • get_async_db() — FastAPI dependency yielding an AsyncSession

The legacy sync engine/SessionLocal/get_db are intentionally removed;
all routes now use the async variants.
"""

import logging
import re

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from backend.config import get_settings

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Build DATABASE_URL
# ---------------------------------------------------------------------------
settings = get_settings()
_raw_url: str = settings.DATABASE_URL

# Rewrite scheme: postgresql[+anything]:// → postgresql+asyncpg://
_async_url = re.sub(r"^postgresql(\+\w+)?://", "postgresql+asyncpg://", _raw_url)

# Ensure sslmode=require for Neon / hosted Postgres
# Note: asyncpg uses connect_args for SSL; strip sslmode from URL if present
# and pass ssl=True via connect_args instead, so the URL stays clean.
_has_sslmode = "sslmode" in _async_url
if "postgresql" in _async_url and not _has_sslmode:
    if "?" in _async_url:
        _async_url += "&sslmode=require"
    else:
        _async_url += "?sslmode=require"

# ---------------------------------------------------------------------------
# Async engine
# ---------------------------------------------------------------------------
try:
    async_engine = create_async_engine(
        _async_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )
except Exception as exc:
    logger.error("Failed to create async database engine: %s", exc)
    raise

# ---------------------------------------------------------------------------
# ORM base
# ---------------------------------------------------------------------------
Base = declarative_base()

# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

async def get_async_db():
    """Yield an AsyncSession and guarantee it is closed after the request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as exc:
            logger.error("Async database session error: %s", exc)
            await session.rollback()
            raise
