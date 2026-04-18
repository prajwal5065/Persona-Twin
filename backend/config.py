from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "Persona Twin API"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    SECRET_KEY: str = "your-secret-key"
    
    FAISS_INDEX_PATH: str = "data/faiss_index.bin"
    ID_MAPPING_PATH: str = "data/id_mapping.pkl"
    GOOGLE_API_KEY: str = "your-google-api-key"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
