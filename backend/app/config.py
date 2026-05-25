from pydantic_settings import BaseSettings
from pathlib import Path

# Project root = backend/ parent
BASE_DIR = Path(__file__).parent.parent.parent  # memoryos/

class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    embed_model: str = "text-embedding-3-small"

    db_path: Path = BASE_DIR / "data" / "app.db"
    vector_path: Path = BASE_DIR / "data" / "vectors"
    upload_path: Path = BASE_DIR / "uploads"

    max_upload_mb: int = 200
    embed_chunk_size: int = 500
    embed_chunk_overlap: int = 50
    rag_top_k: int = 8

    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = "utf-8"

settings = Settings()
