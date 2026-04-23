from pydantic import BaseModel
from datetime import date, datetime

class DigestResponse(BaseModel):
    id: int
    user_id: int
    content: str
    week_of: date
    created_at: datetime

    class Config:
        from_attributes = True
