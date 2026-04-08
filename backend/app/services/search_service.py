from fastapi import HTTPException, status
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
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

    doc_ids: set[int] = set()
    for match in response.matches:
        metadata = match.metadata or {}
        doc_id = metadata.get("document_id")
        if isinstance(doc_id, int):
            doc_ids.add(doc_id)
        elif isinstance(doc_id, str) and doc_id.isdigit():
            doc_ids.add(int(doc_id))

    docs_by_id: dict[int, Document] = {}
    if doc_ids:
        documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()
        docs_by_id = {doc.id: doc for doc in documents}

    matches = []
    for match in response.matches:
        metadata = match.metadata or {}
        raw_doc_id = metadata.get("document_id", 0)
        document_id = int(raw_doc_id) if str(raw_doc_id).isdigit() else 0
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

    answer = None
    if include_answer:
        contexts = [item["text"] for item in matches if item["text"]]
        answer = generate_answer(query_text, contexts)

    return matches, answer
