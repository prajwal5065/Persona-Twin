from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.note import Note
from app.models.user import User
from app.services.llm import LLMService

class DigestService:
    @staticmethod
    async def generate_digest(user_id: int) -> str:
        async with AsyncSessionLocal() as session:
            user = await session.get(User, user_id)
            if not user:
                return "User not found"
            
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            stmt = select(Note).where(Note.user_id == user_id, Note.created_at >= seven_days_ago)
            result = await session.execute(stmt)
            notes = result.scalars().all()
            
            if not notes:
                return ""
            
            notes_text = "\n".join([f"- {note.content}" for note in notes])
            personality = user.personality_profile or "Unknown"

            prompt = f"You are writing a weekly reflection for the user based on their notes. Notes from this week: {notes_text}\nPersonality profile: {personality}\nWrite a warm, insightful 3-paragraph summary covering: 1. Key themes and thoughts from this week 2. A notable growth or change you observed 3. One question to reflect on next week Write in second person (You...). Be specific, not generic."

            llm = LLMService()
            response = llm.generate_response(prompt)
            return response
