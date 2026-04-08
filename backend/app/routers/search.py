from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.search import SearchRequest, SearchResponse
from app.services.activity_service import log_activity
from app.services.search_service import perform_semantic_search


router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
def semantic_search(
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    matches, answer = perform_semantic_search(
        db=db,
        query_text=payload.query,
        user_id=current_user.id,
        top_k=5,
        include_answer=True,
    )

    log_activity(
        db,
        "search",
        current_user.email,
        {"query": payload.query, "result_count": len(matches)},
    )

    return SearchResponse(query=payload.query, results=matches, answer=answer)
