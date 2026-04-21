from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
import logging

from backend.app.db.database import get_async_db
from backend.app.models.user import User as UserModel
from backend.app.schemas.user import User as UserSchema
from backend.app.dependencies.auth import get_current_user

router = APIRouter(tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/users/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
    _current_user: UserModel = Depends(get_current_user),
) -> UserSchema:
    """Retrieve a user by ID. Requires a valid JWT."""
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    db_user: UserModel | None = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user
