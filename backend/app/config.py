from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    llm_api_key: str = ""
    llm_model: str = "gemini-2.0-flash"
    database_url: str = "sqlite:///./darukaa.db"
    embedding_model: str = "text-embedding-004"
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": "backend/.env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
