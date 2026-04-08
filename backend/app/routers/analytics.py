from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import fetch_analytics


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse, dependencies=[Depends(require_roles(["admin"]))])
def get_analytics(db: Session = Depends(get_db)):
    return fetch_analytics(db)
