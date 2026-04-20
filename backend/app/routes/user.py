from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging
from backend.app.db.database import get_db
from backend.app.models.user import User as UserModel
from backend.app.schemas.user import User as UserSchema
from backend.app.dependencies.auth import get_current_user

router = APIRouter(tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/users/{user_id}", response_model=UserSchema)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    _current_user: UserModel = Depends(get_current_user),
) -> UserSchema:
    """Retrieve a user by ID. Requires a valid JWT."""
    db_user: UserModel | None = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user
