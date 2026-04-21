from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

_INJECTION_PATTERNS = [
    "ignore previous",
    "system:",
    "forget everything",
    "you are now",
    "act as",
]


class NoteBase(BaseModel):
    content: str
    user_id: int


class NoteCreate(NoteBase):

    @field_validator("content", mode="before")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Content must be a string")

        v = v.strip()

        if len(v) < 1:
            raise ValueError("Content must be at least 1 character")
        if len(v) > 5000:
            raise ValueError("Content must be at most 5000 characters")

        v_lower = v.lower()
        for pattern in _INJECTION_PATTERNS:
            if pattern in v_lower:
                raise ValueError("Content contains restricted patterns")

        return v


class Note(NoteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
