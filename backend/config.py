import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://gestionale:gestionale_password@localhost:5432/gestionale_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "4320"))  # 72 hours

    # URLs for CORS and OAuth
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: Optional[str] = os.getenv("BACKEND_URL", "http://localhost:8000")

    # Google OAuth (optional)
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: Optional[str] = os.getenv("GOOGLE_REDIRECT_URI")

    @model_validator(mode='after')
    def set_redirect_uri(self):
        # Auto-configure redirect URI based on backend URL if not set
        if not self.GOOGLE_REDIRECT_URI:
            backend = self.BACKEND_URL or "http://localhost:8000"
            self.GOOGLE_REDIRECT_URI = f"{backend}/api/oauth/google/callback"
        return self

    class Config:
        env_file = ".env"

settings = Settings()
