from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.search_query import SearchQuery
from app.models.task import Task


def fetch_analytics(db: Session) -> dict[str, int]:
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == "completed").scalar() or 0
    pending_tasks = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar() or 0
    total_searches = db.query(func.count(SearchQuery.id)).scalar() or 0

    return {
        "total_tasks": int(total_tasks),
        "completed_tasks": int(completed_tasks),
        "pending_tasks": int(pending_tasks),
        "total_searches_performed": int(total_searches),
    }
