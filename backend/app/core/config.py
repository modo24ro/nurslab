import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "NursLab - Nursing Practice"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-at-least-32-chars-long!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://nurslab_user:nurslab_secure_password@postgres:5432/nurslab_db"
    SQL_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Media storage
    MEDIA_UPLOAD_DIR: str = os.getenv("MEDIA_UPLOAD_DIR", "media_uploads")
    MAX_UPLOAD_SIZE_MB: int = 50

    # Invoicing & RO e-Factura
    INVOICE_SERIES: str = "NLB"
    INVOICE_START_NUMBER: int = 1001
    COMPANY_NAME: str = "NursLab Medical Education S.R.L."
    COMPANY_CUI: str = "RO12345678"
    COMPANY_REG_COM: str = "J40/1234/2026"
    COMPANY_ADDRESS: str = "Str. Sanatatii Nr. 10, Sector 1, Bucuresti"

    # Payments Sandbox
    STRIPE_PUBLIC_KEY: str = "pk_test_sample"
    STRIPE_SECRET_KEY: str = "sk_test_sample"
    STRIPE_WEBHOOK_SECRET: str = "whsec_sample"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
