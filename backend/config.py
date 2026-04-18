from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "SelfTwin"
    ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    SECRET_KEY: str = "your-secret-key"
    
    # LLM & Embeddings
    GEMINI_API_KEY: str = ""
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
