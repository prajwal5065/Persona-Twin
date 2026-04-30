from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.note import Note
from .llm import LLMService
from collections import Counter
from datetime import datetime
from typing import List, Dict, Any

class InsightService:
    def __init__(self, db: AsyncSession, llm_service: LLMService = None):
        self.db = db
        self.llm = llm_service or LLMService()

    async def get_user_insights(self, user_id: int) -> Dict[str, Any]:
        """
        Analyzes user notes to detect behavioral patterns and generate qualitative insights via OpenAI.
        """
        stmt = select(Note).where(Note.user_id == user_id).order_by(Note.created_at.asc())
        result = await self.db.execute(stmt)
        notes = result.scalars().all()
        
        if not notes:
            return {
                "patterns": "No data yet.",
                "trends": [],
                "summary": "Start writing notes to see insights!"
            }

        # 1. Study Time Trends
        hours = [note.created_at.hour for note in notes]
        
        # Determine most active time of day
        activity_by_period = {"Morning": 0, "Afternoon": 0, "Evening": 0, "Late Night": 0}
        for hour in hours:
            if 6 <= hour < 12: activity_by_period["Morning"] += 1
            elif 12 <= hour < 18: activity_by_period["Afternoon"] += 1
            elif 18 <= hour < 24: activity_by_period["Evening"] += 1
            else: activity_by_period["Late Night"] += 1
        
        most_active_period = max(activity_by_period, key=activity_by_period.get)
        
        # 2. Activity Frequency
        total_notes = len(notes)
        days_since_start = (datetime.now().date() - notes[0].created_at.date()).days or 1
        avg_freq = total_notes / days_since_start

        # 3. Qualitative Analysis using LLM
        note_summaries = "\n".join([n.content[:100] for n in notes[-15:]]) 
        
        prompt = f"""
        Based on these behavioral statistics and recent note samples, generate 3 unique insights about the user.
        
        Statistics:
        - Most active at: {most_active_period}
        - Total notes: {total_notes}
        - Average notes per day: {avg_freq:.2f}
        
        Recent Note Samples:
        {note_summaries}
        
        Return exactly 3 bullet points of insights. Be observational.
        """
        
        try:
            # Note: LLMService.generate_response is still sync, but we call it from our async method.
            # In a real production app, we would use an async LLM client.
            qualitative_insights = self.llm.generate_response(prompt)
        except Exception:
            qualitative_insights = "Continue recording notes for more deep-dive AI insights."

        return {
            "patterns": {
                "most_active_period": most_active_period,
                "activity_distribution": activity_by_period,
                "frequency": f"{avg_freq:.2f} notes/day"
            },
            "trends": [
                f"Your total memory count is {total_notes}.",
                f"You are most active in the {most_active_period}."
            ],
            "summary": qualitative_insights
        }
