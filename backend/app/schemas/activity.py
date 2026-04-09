from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ActivityOut(BaseModel):
    id: int
    action: str
    actor_email: str
    metadata: dict[str, Any]
    created_at: datetime


class UserActivityResponse(BaseModel):
    user_id: int
    user_email: str
    activities: list[ActivityOut]
