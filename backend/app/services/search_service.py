from fastapi import HTTPException, status
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.search_query import SearchQuery
from app.services.embedding_service import embed_text
from app.services.llm_service import generate_answer
from app.services.pinecone_service import get_pinecone_index


def perform_semantic_search(
    db: Session,
    query_text: str,
    user_id: int,
    top_k: Optional[int],
    include_answer: bool,
) -> tuple[list[dict], Optional[str]]:
    search_record = SearchQuery(query=query_text, searched_by=user_id)
    db.add(search_record)
    db.commit()

    requested_top_k = top_k if top_k is not None else settings.SEARCH_TOP_K_DEFAULT
    if requested_top_k > settings.SEARCH_TOP_K_MAX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"top_k exceeds max limit of {settings.SEARCH_TOP_K_MAX}",
        )

    query_embedding = embed_text(query_text)
    index = get_pinecone_index()
    response = index.query(
        namespace="documents",
        vector=query_embedding,
        top_k=max(1, requested_top_k),
        include_metadata=True,
    )

    matches = []
    for match in response.matches:
        metadata = match.metadata or {}
        matches.append(
            {
                "document_id": int(metadata.get("document_id", 0)),
                "text": metadata.get("text", ""),
                "score": float(match.score),
            }
        )

    answer = None
    if include_answer:
        contexts = [item["text"] for item in matches if item["text"]]
        answer = generate_answer(query_text, contexts)

    return matches, answer
