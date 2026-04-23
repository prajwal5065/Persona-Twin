from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_async_db
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse
from backend.app.rate_limit import limiter
from fastapi import Request

router = APIRouter(tags=["simulation"])


@router.post("/simulate", response_model=SimulationResponse)
@limiter.limit("5/minute")
async def simulate(body: SimulationRequest, request: Request, db: AsyncSession = Depends(get_async_db)):
    """
    Simulation endpoint.
    Takes a hypothetical scenario and predicts the user's decision based on their digital twin data.
    """
    try:
        from backend.app.services.decision import DecisionService
        service = DecisionService(db)
        prediction = await service.simulate_decision(body.scenario)
        return SimulationResponse(**prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
