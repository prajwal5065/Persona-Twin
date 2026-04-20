"""
dependencies/auth.py
--------------------
FastAPI dependency that resolves the currently authenticated user from a
Bearer JWT token in the Authorization header.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.config import get_settings

logger = logging.getLogger(__name__)

# Points FastAPI's OpenAPI UI at the token URL so the "Authorize" button works.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Decode the JWT bearer token and return the corresponding User row.

    Raises 401 if the token is missing, malformed, expired, or the user
    referenced by 'sub' no longer exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    settings = get_settings()

    try:
        payload: dict = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError) as exc:
        logger.warning("JWT decode failed: %s", exc)
        raise credentials_exception from exc

    user: User | None = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
