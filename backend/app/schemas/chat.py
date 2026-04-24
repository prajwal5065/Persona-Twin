from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    query: str

    @field_validator("query", mode="before")
    @classmethod
    def validate_query(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Query must be a string")

        v = v.strip()

        if len(v) < 2:
            raise ValueError("Query must be at least 2 characters")
        if len(v) > 1000:
            raise ValueError("Query must be at most 1000 characters")

        return v


class ChatResponse(BaseModel):
    response: str
