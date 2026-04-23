from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.db.database import get_async_db
from backend.app.models.digest import Digest
from backend.app.schemas.digest import DigestResponse
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/digest", tags=["Digest"])

@router.get("/latest", response_model=DigestResponse)
async def get_latest_digest(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Digest).where(Digest.user_id == current_user.id).order_by(desc(Digest.created_at)).limit(1)
    result = await db.execute(stmt)
    digest = result.scalar_one_or_none()
    
    if not digest:
        raise HTTPException(status_code=404, detail="No digests found for this user.")
        
    return digest
