from typing import List

from openai import OpenAI

from app.core.config import settings


_client = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def _embedding_options() -> dict:
    options = {"model": settings.OPENAI_EMBEDDING_MODEL}
    if settings.OPENAI_EMBEDDING_MODEL.startswith("text-embedding-3"):
        options["dimensions"] = settings.EMBEDDING_DIMENSION
    return options


def embed_text(text: str) -> List[float]:
    client = get_openai_client()
    response = client.embeddings.create(input=text, **_embedding_options())
    return response.data[0].embedding


def embed_texts(texts: list[str]) -> list[list[float]]:
    client = get_openai_client()
    response = client.embeddings.create(input=texts, **_embedding_options())
    return [item.embedding for item in response.data]
