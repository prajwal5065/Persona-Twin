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

import structlog
import re

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from backend.config import get_settings

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Build DATABASE_URL
# ---------------------------------------------------------------------------
settings = get_settings()
_raw_url: str = settings.DATABASE_URL

# Rewrite scheme: postgresql[+anything]:// → postgresql+asyncpg://
_async_url = re.sub(r"^postgresql(\+\w+)?://", "postgresql+asyncpg://", _raw_url)

# asyncpg does not support 'sslmode'. We must strip it from the URL
# and pass 'ssl=True' via connect_args for hosted services like Neon.
_async_url = re.sub(r"\?sslmode=[^&]+", "", _async_url)
_async_url = re.sub(r"&sslmode=[^&]+", "", _async_url)

_connect_args = {}
if "neon.tech" in _async_url or "sslmode=require" in _raw_url:
    _connect_args["ssl"] = True

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
        connect_args=_connect_args,
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
