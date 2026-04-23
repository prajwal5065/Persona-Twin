from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import date
from sqlalchemy import select
from backend.app.db.database import AsyncSessionLocal
from backend.app.models.user import User
from backend.app.models.digest import Digest
from backend.app.services.digest import DigestService
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def generate_weekly_digests():
    logger.info("Starting weekly digest generation task.")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        for user in users:
            try:
                content = await DigestService.generate_digest(user.id)
                if content:
                    digest = Digest(user_id=user.id, content=content, week_of=date.today())
                    session.add(digest)
            except Exception as e:
                logger.error(f"Error generating digest for user {user.id}: {e}")
        await session.commit()
    logger.info("Weekly digest generation completed.")

def setup_scheduler():
    scheduler.add_job(
        generate_weekly_digests,
        CronTrigger(day_of_week='sun', hour=9, minute=0),
        id="weekly_digest",
        replace_existing=True
    )
    scheduler.start()
