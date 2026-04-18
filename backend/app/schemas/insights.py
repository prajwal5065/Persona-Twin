from pydantic import BaseModel
from typing import List, Dict, Any

class InsightResponse(BaseModel):
    patterns: Dict[str, Any]
    trends: List[str]
    summary: str
