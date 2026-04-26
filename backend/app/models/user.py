from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from backend.app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # OCEAN personality profile — populated by PersonalityService.analyze()
    # Uses JSONB on Postgres for indexing; falls back to plain JSON on SQLite
    personality_profile = Column(JSON, nullable=True)
