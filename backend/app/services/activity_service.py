import json
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


def log_activity(
    db: Session, action: str, actor_email: str, metadata: Optional[dict[str, Any]] = None
) -> None:
    record = ActivityLog(
        action=action,
        actor_email=actor_email,
        metadata_json=json.dumps(metadata or {}),
    )
    db.add(record)
    db.commit()
