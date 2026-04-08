from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    assigned_to: int


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|completed)$")


class TaskAdminUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|completed)$")
    assigned_to: Optional[int] = Field(None, gt=0)


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    assigned_to: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    items: list[TaskOut]
    page: int
    page_size: int
    total: int
