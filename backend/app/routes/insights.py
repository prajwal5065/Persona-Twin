from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_db
from app.dependencies.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.insights import InsightResponse
from app.rate_limit import limiter

router = APIRouter(tags=["insights"])


@router.get("/insights", response_model=InsightResponse)
@limiter.limit("10/minute")
async def get_insights(
    request: Request,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    Analyzes current user's notes to return trends, behavioral patterns, and qualitative AI insights.
    """
    try:
        from app.services.insights import InsightService
        service = InsightService(db)
        return await service.get_user_insights(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
