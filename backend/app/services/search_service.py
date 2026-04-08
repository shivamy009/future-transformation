from fastapi import HTTPException, status
from typing import Optional
import re

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.models.search_query import SearchQuery
from app.services.embedding_service import embed_text
from app.services.llm_service import generate_answer
from app.services.pinecone_service import get_pinecone_index


def _tokenize(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-zA-Z0-9]+", (text or "").lower())
        if len(token) >= 2
    }


def _parse_doc_id(raw_doc_id) -> int:
    if isinstance(raw_doc_id, int):
        return raw_doc_id
    if isinstance(raw_doc_id, float):
        return int(raw_doc_id)
    if isinstance(raw_doc_id, str):
        candidate = raw_doc_id.strip()
        if candidate.isdigit():
            return int(candidate)
        try:
            return int(float(candidate))
        except ValueError:
            return 0
    return 0


def _is_relevant_match(query_text: str, match_item: dict) -> bool:
    if not match_item["file_url"] or not match_item["text"].strip():
        return False

    if match_item["score"] >= settings.SEARCH_MIN_RELEVANCE_SCORE:
        return True

    query_terms = _tokenize(query_text)
    text_terms = _tokenize(match_item["text"])
    # Fallback: allow grounded answer when there is explicit lexical overlap.
    overlap_count = len(query_terms.intersection(text_terms))
    return overlap_count >= 1


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

    doc_ids: set[int] = set()
    for match in response.matches:
        metadata = match.metadata or {}
        document_id = _parse_doc_id(metadata.get("document_id"))
        if document_id > 0:
            doc_ids.add(document_id)

    docs_by_id: dict[int, Document] = {}
    if doc_ids:
        documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()
        docs_by_id = {doc.id: doc for doc in documents}

    matches = []
    for match in response.matches:
        metadata = match.metadata or {}
        document_id = _parse_doc_id(metadata.get("document_id", 0))
        document = docs_by_id.get(document_id)

        raw_page = metadata.get("page")
        page_value = None
        if isinstance(raw_page, int):
            page_value = raw_page
        elif isinstance(raw_page, str) and raw_page.isdigit():
            page_value = int(raw_page)

        matches.append(
            {
                "document_id": document_id,
                "document_title": document.title if document else f"Document #{document_id}",
                "file_url": document.file_path if document else "",
                "text": metadata.get("text", ""),
                "score": float(match.score),
                "page": page_value,
            }
        )

    source_matches = [item for item in matches if item["file_url"] and item["text"].strip()]

    relevant_matches = [item for item in source_matches if _is_relevant_match(query_text, item)]

    answer = None
    if include_answer and source_matches:
        context_candidates = relevant_matches if relevant_matches else source_matches
        contexts = [item["text"] for item in context_candidates[:5]]
        answer = generate_answer(query_text, contexts)

    return source_matches, answer
