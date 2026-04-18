import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.note import Note
from backend.config import get_settings
from collections import Counter
from datetime import datetime
from typing import List, Dict, Any

settings = get_settings()

class InsightService:
    def __init__(self, db: Session, api_key: str = None):
        self.db = db
        api_key = api_key or settings.GOOGLE_API_KEY
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def get_user_insights(self) -> Dict[str, Any]:
        """
        Analyzes user notes to detect behavioral patterns and generate qualitative insights.
        """
        notes = self.db.query(Note).all()
        if not notes:
            return {
                "patterns": "No data yet.",
                "trends": [],
                "summary": "Start writing notes to see insights!"
            }

        # 1. Study Time Trends
        hours = [note.created_at.hour for note in notes]
        hour_counts = Counter(hours)
        
        # Determine most active time of day
        hour_to_label = {
            range(0, 6): "Late Night",
            range(6, 12): "Morning",
            range(12, 18): "Afternoon",
            range(18, 24): "Evening"
        }
        
        activity_by_period = {label: 0 for label in hour_to_label.values()}
        for hour in hours:
            for r, label in hour_to_label.items():
                if hour in r:
                    activity_by_period[label] += 1
        
        most_active_period = max(activity_by_period, key=activity_by_period.get)
        
        # 2. Activity Frequency
        total_notes = len(notes)
        days_since_start = (datetime.now().date() - notes[0].created_at.date()).days or 1
        avg_freq = total_notes / days_since_start

        # 3. Qualitative Analysis using LLM
        note_summaries = "\n".join([n.content[:100] for n in notes[-30:]]) # last 30 notes
        
        prompt = f"""
        Based on these behavioral statistics and recent note samples, generate 3 unique insights about the user.
        
        Statistics:
        - Most active at: {most_active_period}
        - Total notes: {total_notes}
        - Average notes per day: {avg_freq:.2f}
        
        Recent Note Samples:
        {note_summaries}
        
        Return exactly 3 bullet points of insights. Be conversational and observational.
        Example: "You seem to focus on productivity in the mornings but get more reflective after 8 PM."
        """
        
        response = self.model.generate_content(prompt)
        qualitative_insights = response.text.strip()

        return {
            "patterns": {
                "most_active_period": most_active_period,
                "activity_distribution": activity_by_period,
                "frequency": f"{avg_freq:.2f} notes/day"
            },
            "trends": [
                f"Your total memory count is {total_notes}.",
                f"You are a {most_active_period} person!"
            ],
            "summary": qualitative_insights
        }
