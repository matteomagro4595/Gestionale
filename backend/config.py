from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://gestionale:gestionale_password@localhost:5432/gestionale_db"

    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 4320  # 72 hours

    # URLs for CORS and OAuth
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Google OAuth (optional)
    GOOGLE_CLIENT_ID: Optional[str] = ""
    GOOGLE_CLIENT_SECRET: Optional[str] = ""
    GOOGLE_REDIRECT_URI: Optional[str] = None

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
