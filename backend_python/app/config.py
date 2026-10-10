import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SliceCraft Artisan Pizza API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database Settings
    # Supports PostgreSQL via asyncpg; if PostgreSQL is not yet ready, falls back safely to SQLite async
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/pizza_db"
    )
    FALLBACK_SQLITE_URL: str = "sqlite+aiosqlite:///./pizza_app.db"
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-slicecraft-artisan-pizza-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
