import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Future Transformation API")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")

    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "future_transformation")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "ChangeThisAdminPassword123")
    BACKEND_CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    IMAGEKIT_PUBLIC_KEY: str = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
    IMAGEKIT_PRIVATE_KEY: str = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
    IMAGEKIT_URL_ENDPOINT: str = os.getenv("IMAGEKIT_URL_ENDPOINT", "")
    IMAGEKIT_UPLOAD_ENDPOINT: str = os.getenv("IMAGEKIT_UPLOAD_ENDPOINT", "https://upload.imagekit.io/api/v1/files/upload")
    IMAGEKIT_FOLDER: str = os.getenv("IMAGEKIT_FOLDER", "/future-transformation-docs")

    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
    PINECONE_CLOUD: str = os.getenv("PINECONE_CLOUD", "aws")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "documents-index")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    OPENAI_CHAT_MODEL: str = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "1536"))
    SEARCH_TOP_K_DEFAULT: int = int(os.getenv("SEARCH_TOP_K_DEFAULT", "5"))
    SEARCH_TOP_K_MAX: int = int(os.getenv("SEARCH_TOP_K_MAX", "20"))

    @property
    def sqlalchemy_database_uri(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@"
            f"{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
