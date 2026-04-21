"""
routes/auth.py
--------------
Authentication endpoints:
  POST /auth/register  — create a new account, returns a JWT
  POST /auth/login     — OAuth2 password flow, returns a JWT
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_async_db
from backend.app.models.user import User
from backend.app.schemas.auth import TokenResponse, UserCreate
from backend.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------
ACCESS_TOKEN_EXPIRE_DAYS: int = 7
ALGORITHM: str = "HS256"


def _hash_password(plain: str) -> str:
    """Return the bcrypt hash of *plain*."""
    return pwd_context.hash(plain)


def _verify_password(plain: str, hashed: str) -> bool:
    """Return True when *plain* matches *hashed*."""
    return pwd_context.verify(plain, hashed)


def _create_access_token(user_id: int) -> str:
    """
    Build a signed HS256 JWT with *user_id* stored in the ``sub`` claim.
    Token expires after :data:`ACCESS_TOKEN_EXPIRE_DAYS` days.
    """
    settings = get_settings()
    expire = datetime.now(tz=timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload: dict = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    body: UserCreate,
    db: AsyncSession = Depends(get_async_db),
) -> TokenResponse:
    """
    Create a new user and return a JWT.

    - **400** if the e-mail is already registered.
    - **500** on unexpected database errors.
    """
    # Duplicate-email guard
    result = await db.execute(select(User).where(User.email == body.email))
    existing: User | None = result.scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_pw: str = _hash_password(body.password)
    new_user = User(email=body.email, hashed_password=hashed_pw)

    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error("DB error during registration: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a database error",
        ) from exc

    token: str = _create_access_token(new_user.id)
    return TokenResponse(access_token=token)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain a JWT (OAuth2 password flow)",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db),
) -> TokenResponse:
    """
    Validate credentials via the OAuth2 password form and return a JWT.

    ``username`` in the form is treated as the user's **e-mail address**.

    - **401** for invalid credentials (wrong email or password).
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user: User | None = result.scalar_one_or_none()

    if user is None or not _verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token: str = _create_access_token(user.id)
    return TokenResponse(access_token=token)
