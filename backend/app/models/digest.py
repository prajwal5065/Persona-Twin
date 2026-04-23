from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class Digest(Base):
    __tablename__ = "digests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    week_of = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="digests")
