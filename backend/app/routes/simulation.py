from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse

router = APIRouter(tags=["simulation"])

@router.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Simulation endpoint.
    Takes a hypothetical scenario and predicts the user's decision based on their digital twin data.
    """
    try:
        from backend.app.services.decision import DecisionService
        service = DecisionService(db)
        prediction = service.simulate_decision(request.scenario)
        return SimulationResponse(**prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
