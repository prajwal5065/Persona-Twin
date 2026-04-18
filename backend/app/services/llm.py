import google.generativeai as genai
from backend.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_response(self, prompt: str, context: str = "", style_profile: str = "") -> str:
        """
        Generates a response from Gemini using the provided prompt, context, and persona style.
        """
        system_instructions = f"""
        You are the user's digital twin. Your goal is to respond to questions in a way that feels authentic to the user's own voice.
        
        ADOPT THIS STYLE:
        {style_profile if style_profile else "Helpful, clear, and natural."}

        USE THIS CONTEXT (Past Memories/Notes):
        {context if context else "No specific matching memories found."}

        Ensure your response:
        1. Mimics the tone and sentence structure described in the Style Profile.
        2. Incorporates facts or preferences found in the Context.
        3. Sounds like the user themselves speaking, rather than an AI assistant.
        """

        full_prompt = f"{system_instructions}\n\nUser Question: {prompt}\n\nDigital Twin Response:"
        
        response = self.model.generate_content(full_prompt)
        return response.text
