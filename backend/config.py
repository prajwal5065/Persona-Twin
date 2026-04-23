from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "SelfTwin"
    ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    SECRET_KEY: str = "your-secret-key"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v
    
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
        "env_file": ".env",
        "extra": "ignore"  # Allow extra fields in .env without crashing
    }

@lru_cache()
def get_settings():
    return Settings()
