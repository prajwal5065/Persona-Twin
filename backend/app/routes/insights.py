from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.services.insights import InsightService
from backend.app.schemas.insights import InsightResponse

router = APIRouter(tags=["insights"])

@router.get("/insights", response_model=InsightResponse)
def get_insights(db: Session = Depends(get_db)):
    """
    Analyzes all notes to return trends, behavioral patterns, and qualitative AI insights.
    """
    try:
        service = InsightService(db)
        return service.get_user_insights()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
