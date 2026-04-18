import google.generativeai as genai
from backend.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            logger.error("No GEMINI_API_KEY found in settings")

        genai.configure(api_key=self.api_key)
        self.model_name = self._discover_model()
        logger.info(f"Gemini model selected: {self.model_name}")
        self.model = genai.GenerativeModel(self.model_name)

    def _discover_model(self) -> str:
        """Finds the best available Gemini model that supports generateContent."""
        try:
            available = [
                m.name for m in genai.list_models()
                if 'generateContent' in m.supported_generation_methods
            ]
            logger.info(f"Available Gemini models: {available}")
            priority = [
                'models/gemini-1.5-flash-latest',
                'models/gemini-1.5-flash',
                'models/gemini-1.5-pro-latest',
                'models/gemini-1.5-pro',
                'models/gemini-1.0-pro',
            ]
            for model in priority:
                if model in available:
                    # Return just the name portion (after "models/")
                    return model.replace('models/', '')
            # Use the first available model as a last resort
            if available:
                return available[0].replace('models/', '')
        except Exception as e:
            logger.warning(f"Model discovery failed: {e}")
        return 'gemini-1.5-flash-latest'

    def generate_response(self, prompt: str, context: str = "", style_profile: str = "") -> str:
        """
        Sends a prompt directly to Gemini and returns the response text.
        The prompt is expected to be already fully constructed by the RAGService.
        If raw context and style_profile are passed (legacy calls), they are appended.
        """
        full_prompt = prompt
        if context:
            full_prompt += f"\n\nContext: {context}"
        if style_profile:
            full_prompt += f"\n\nStyle: {style_profile}"

        try:
            response = self.model.generate_content(
                full_prompt,
                safety_settings={
                    'HATE': 'BLOCK_NONE',
                    'HARASSMENT': 'BLOCK_NONE',
                    'SEXUAL': 'BLOCK_NONE',
                    'DANGEROUS': 'BLOCK_NONE'
                }
            )
            try:
                return response.text.strip()
            except (ValueError, AttributeError):
                return "I'm sorry, I couldn't generate a response for that query."
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return f"AI Connection Error: {str(e)}"
