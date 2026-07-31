import os

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv


load_dotenv()


class Settings:

    # Application
    APP_NAME = os.getenv(
        "APP_NAME",
        "Smart Event Platform API"
    )

    ENVIRONMENT = os.getenv(
        "ENVIRONMENT",
        "development"
    )

    DEBUG = os.getenv(
        "DEBUG",
        "true"
    ).lower() == "true"

    # API
    API_V1_PREFIX = os.getenv(
        "API_V1_PREFIX",
        "/api/v1"
    )

    API_V1_STR = os.getenv(
        "API_V1_STR",
        "/api/v1"
    )

    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./smart_event.db"
    )

    # OpenAI
    OPENAI_API_KEY = os.getenv(
        "OPENAI_API_KEY",
        ""
    )

    OPENAI_MODEL = os.getenv(
        "OPENAI_MODEL",
        "gpt-4.1-mini"
    )

    # JWT
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "smart-event-local-development-secret"
    )

    JWT_ALGORITHM = os.getenv(
        "JWT_ALGORITHM",
        "HS256"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "60"
        )
    )

    # Frontend
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    # CORS
    BACKEND_CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]

    # Redis
    REDIS_URL = os.getenv(
        "REDIS_URL",
        ""
    )

    # Socket.IO
    SOCKET_IO_CORS_ORIGINS = os.getenv(
        "SOCKET_IO_CORS_ORIGINS",
        "http://localhost:5173"
    )


settings = Settings()


# Direct exports for files that import values directly

APP_NAME = settings.APP_NAME

ENVIRONMENT = settings.ENVIRONMENT

DEBUG = settings.DEBUG

API_V1_PREFIX = settings.API_V1_PREFIX

API_V1_STR = settings.API_V1_STR

DATABASE_URL = settings.DATABASE_URL

OPENAI_API_KEY = settings.OPENAI_API_KEY

OPENAI_MODEL = settings.OPENAI_MODEL

JWT_SECRET_KEY = settings.JWT_SECRET_KEY

JWT_ALGORITHM = settings.JWT_ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = (
    settings.ACCESS_TOKEN_EXPIRE_MINUTES
)

FRONTEND_URL = settings.FRONTEND_URL

BACKEND_CORS_ORIGINS = (
    settings.BACKEND_CORS_ORIGINS
)

REDIS_URL = settings.REDIS_URL

SOCKET_IO_CORS_ORIGINS = (
    settings.SOCKET_IO_CORS_ORIGINS
)