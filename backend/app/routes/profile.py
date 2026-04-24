"""
routes/profile.py
-----------------
Profile endpoints for the authenticated user.

GET  /profile/personality  — returns the cached OCEAN personality profile
                             stored in user.personality_profile.
POST /profile/personality/analyze — triggers a fresh analysis and
                             overwrites the stored profile.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_async_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User as UserModel
from backend.app.services.personality import PersonalityService

router = APIRouter(prefix="/profile", tags=["profile"])
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# GET /profile/personality
# ---------------------------------------------------------------------------

@router.get("/personality")
async def get_personality_profile(
    current_user: Annotated[UserModel, Depends(get_current_user)],
) -> dict:
    """
    Return the stored OCEAN personality profile for the authenticated user.

    The profile is populated by a prior call to POST /profile/personality/analyze.
    Returns 404 if no analysis has been run yet.
    """
    profile = current_user.personality_profile
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No personality profile found. "
                "Run POST /profile/personality/analyze first."
            ),
        )
    return profile


# ---------------------------------------------------------------------------
# POST /profile/personality/analyze
# ---------------------------------------------------------------------------

@router.post("/personality/analyze", status_code=status.HTTP_200_OK)
async def analyze_personality(
    http_request: Request,
    db: Annotated[AsyncSession, Depends(get_async_db)],
    current_user: Annotated[UserModel, Depends(get_current_user)],
) -> dict:
    """
    Trigger a fresh OCEAN personality analysis for the authenticated user.

    Reads the 30 most recent notes, sends them to the LLM, validates the
    response, persists it, and returns the profile dict.
    """
    llm_service = http_request.app.state.llm

    try:
        service = PersonalityService(db=db, llm=llm_service)
        profile = await service.analyze(user_id=current_user.id)
        return profile

    except ValueError as exc:
        logger.warning(
            "Personality analysis failed for user_id=%d: %s",
            current_user.id,
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.error(
            "Unexpected error during personality analysis for user_id=%d: %s",
            current_user.id,
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Personality analysis error: {exc}",
        ) from exc
