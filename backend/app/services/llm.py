import google.generativeai as genai
from backend.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            logger.error("No GEMINI_API_KEY found")
            
        genai.configure(api_key=self.api_key)
        
        # Smart Model Discovery: Find the best available model
        self.model_name = self._discover_model()
        logger.info(f"Using Gemini model: {self.model_name}")
        self.model = genai.GenerativeModel(self.model_name)

    def _discover_model(self) -> str:
        """
        Interrogates the API to find an available model that supports generation.
        """
        try:
            available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            
            # Priority list
            priorities = ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-pro', 'models/gemini-1.0-pro']
            
            for p in priorities:
                if p in available_models:
                    return p.replace('models/', '') # SDK often prefers just the name
            
            if available_models:
                return available_models[0].replace('models/', '')
        except Exception as e:
            logger.warning(f"Model discovery failed: {e}. Falling back to default.")
            
        return 'gemini-1.5-flash' # Absolute fallback

    def generate_response(self, prompt: str, context: str = "", style_profile: str = "") -> str:
        prompt_with_instructions = f"Question: {prompt}\nContext: {context}\nStyle: {style_profile}"
        
        try:
            response = self.model.generate_content(
                prompt_with_instructions,
                safety_settings={
                    'HATE': 'BLOCK_NONE', 'HARASSMENT': 'BLOCK_NONE', 'SEXUAL' : 'BLOCK_NONE', 'DANGEROUS' : 'BLOCK_NONE'
                }
            )
            
            try:
                return response.text.strip()
            except:
                return "I couldn't generate a safe response for this query."
                
        except Exception as e:
            logger.error(f"Gemini Call failed: {e}")
            return f"AI Connection Error: {str(e)}"
