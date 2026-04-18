from pydantic import BaseModel

class SimulationRequest(BaseModel):
    scenario: str

class SimulationResponse(BaseModel):
    predicted_decision: str
    reasoning: str
