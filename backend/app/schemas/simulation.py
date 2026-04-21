from pydantic import BaseModel, field_validator


class SimulationRequest(BaseModel):
    scenario: str

    @field_validator("scenario", mode="before")
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Scenario must be a string")

        v = v.strip()

        if len(v) < 10:
            raise ValueError("Scenario must be at least 10 characters")
        if len(v) > 2000:
            raise ValueError("Scenario must be at most 2000 characters")

        return v


class SimulationResponse(BaseModel):
    predicted_decision: str
    reasoning: str
