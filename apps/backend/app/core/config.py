# app/core/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGO_URI: str
    DATABASE_NAME: str
    SECRET_KEY: str
    OTP_EXPIRY_MINUTES: int = 10
    EMAIL_SENDER: str
    EMAIL_PASSWORD: str
    SMTP_SERVER: str
    SMTP_PORT: int  # ✅ Add this
    STRIPE_SECRET_KEY: str

    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()

settings = get_settings()
