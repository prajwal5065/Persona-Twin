from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_async_db
from backend.app.schemas.insights import InsightResponse
from backend.app.rate_limit import limiter
from fastapi import Request

router = APIRouter(tags=["insights"])


@router.get("/insights", response_model=InsightResponse)
@limiter.limit("10/minute")
async def get_insights(request: Request, db: AsyncSession = Depends(get_async_db)):
    """
    Analyzes all notes to return trends, behavioral patterns, and qualitative AI insights.
    """
    try:
        from backend.app.services.insights import InsightService
        service = InsightService(db)
        return await service.get_user_insights()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
