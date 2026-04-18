import google.generativeai as genai
from backend.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_response(self, prompt: str, context: str = "") -> str:
        """
        Generates a response from Gemini using the provided prompt and context.
        """
        full_prompt = f"""
        You are a personal AI twin. Use the following context (past memories/notes) to answer the user's question.
        If the context doesn't contain relevant information, answer to the best of your ability using your general knowledge, 
        but prioritize the context provided.

        Context:
        {context}

        Question:
        {prompt}

        Answer:
        """
        response = self.model.generate_content(full_prompt)
        return response.text
