from openai import OpenAI
from typing import Optional

from app.core.config import settings


_client = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def generate_answer(query: str, contexts: list[str]) -> Optional[str]:
    if not settings.OPENAI_API_KEY:
        return None

    if not contexts:
        return "No matching context found in uploaded documents."

    joined_context = "\n\n".join(
        [f"Context {index + 1}: {text}" for index, text in enumerate(contexts)]
    )

    system_prompt = (
        "You are a helpful assistant for enterprise knowledge search. "
        "Answer ONLY from the provided contexts. "
        "If answer is not present, clearly say it is not available in retrieved context."
    )

    user_prompt = (
        f"Question: {query}\n\n"
        f"Retrieved contexts:\n{joined_context}\n\n"
        "Provide a concise answer with factual tone."
    )

    client = get_openai_client()
    response = client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content
