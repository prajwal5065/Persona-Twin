from pydantic_settings import BaseSettings
from pydantic import field_validator, Field
from functools import lru_cache
from pathlib import Path
import os

# root/.env
_base_dir = Path(__file__).resolve().parent.parent
_env_file = _base_dir / ".env"

class Settings(BaseSettings):
    APP_NAME: str = "SelfTwin"
    ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    SECRET_KEY: str = "your-secret-key"
    CORS_ORIGINS: str = Field("http://localhost:3000,http://localhost:5173", validation_alias="ALLOWED_ORIGINS")
    
    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [i.strip() for i in self.CORS_ORIGINS.split(",") if i.strip()]

    
    # LLM & Embeddings
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""  # Used by VoiceService (Whisper) only
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    MAX_TOKENS: int = 1000
    TEMPERATURE: float = 0.7
    
    # Vector DB
    FAISS_INDEX_PATH: str = "./faiss_index"
    ID_MAPPING_PATH: str = "data/id_mapping.pkl"

    model_config = {
        "env_file": str(_env_file),
        "extra": "ignore"  # Allow extra fields in .env without crashing
    }

@lru_cache()
def get_settings():
    return Settings()
