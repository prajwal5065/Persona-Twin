from typing import List
from .llm import LLMService

class StyleExtractorService:
    def __init__(self, llm_service: LLMService = None):
        """
        Initializes the service using the unified LLMService (OpenAI).
        """
        self.llm = llm_service or LLMService()

    def extract_style(self, texts: List[str]) -> str:
        """
        Analyzes a list of texts (user notes) to extract the user's writing style, tone, and preferences.
        """
        if not texts:
            return "neutral, polite, and helpful"

        combined_text = "\n---\n".join(texts[:15]) # Analyze up to 15 recent notes
        
        prompt = f"""
        Analyze the following text samples written by a user. 
        Identify their:
        1. Tone (e.g., formal, casual, analytical, humorous, direct, poetic)
        2. Typical sentence structure (e.g., short/punchy, long/descriptive)
        3. Common vocabulary or specific preferences
        4. Personality traits visible in writing

        Text Samples:
        {combined_text}

        Return a concise "Style Profile" (max 2 sentences) that another AI can use to mimic this user.
        """
        
        # Use our unified OpenAI service
        try:
            style_profile = self.llm.generate_response(prompt)
            return style_profile.strip()
        except Exception:
            return "conversational and natural"
