import google.generativeai as genai
from typing import List
from backend.config import get_settings

settings = get_settings()

class StyleExtractorService:
    def __init__(self, api_key: str = None):
        api_key = api_key or settings.GOOGLE_API_KEY
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def extract_style(self, texts: List[str]) -> str:
        """
        Analyzes a list of texts (user notes) to extract the user's writing style, tone, and preferences.
        """
        if not texts:
            return "neutral, polite, and helpful"

        combined_text = "\n---\n".join(texts[:20]) # Analyze up to 20 recent notes
        
        prompt = f"""
        Analyze the following text samples written by a user. 
        Identify their:
        1. Tone (e.g., formal, casual, analytical, humorous, direct, poetic)
        2. Typical sentence structure (e.g., short/punchy, long/descriptive)
        3. Common vocabulary or specific preferences
        4. Personality traits visible in writing

        Text Samples:
        {combined_text}

        Return a concise "Style Profile" (max 3 sentences) that another AI can use to mimic this user.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()
