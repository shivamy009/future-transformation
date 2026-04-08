from typing import Optional

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    top_k: Optional[int] = None
    include_answer: bool = True


class SearchMatch(BaseModel):
    document_id: int
    text: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchMatch]
    answer: Optional[str] = None
