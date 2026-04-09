from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.task import TaskAdminUpdate, TaskCreate, TaskListResponse, TaskOut, TaskStatusUpdate
from app.services.activity_service import log_activity
from app.services.task_service import admin_update_task, create_task, delete_task, list_tasks, update_task_status


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "",
    response_model=TaskOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(["admin"]))],
)
def create_task_endpoint(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = create_task(db, payload, creator_id=current_user.id)
    return task


@router.get("", response_model=TaskListResponse)
def list_tasks_endpoint(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(pending|completed)$"),
    assigned_to: Optional[int] = Query(None),
    assigned_name: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role_name = current_user.role.name if current_user.role else "user"
    items, total = list_tasks(
        db=db,
        role_name=role_name,
        user_id=current_user.id,
        status_filter=status_filter,
        assigned_to=assigned_to,
        assigned_name=assigned_name,
        page=page,
        page_size=page_size,
    )
    return TaskListResponse(items=items, page=page, page_size=page_size, total=total)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task_status_endpoint(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role_name = current_user.role.name if current_user.role else "user"
    task = update_task_status(
        db=db,
        task_id=task_id,
        status_value=payload.status,
        current_user_id=current_user.id,
        role_name=role_name,
    )

    log_activity(
        db,
        "task_update",
        current_user.email,
        {"task_id": task.id, "status": payload.status},
    )
    return task


@router.patch(
    "/{task_id}/admin",
    response_model=TaskOut,
    dependencies=[Depends(require_roles(["admin"]))],
)
def admin_update_task_endpoint(
    task_id: int,
    payload: TaskAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = admin_update_task(db=db, task_id=task_id, payload=payload)

    log_activity(
        db,
        "task_update",
        current_user.email,
        {"task_id": task.id, "admin_edit": True},
    )
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles(["admin"]))],
)
def delete_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task(db=db, task_id=task_id)

    log_activity(
        db,
        "task_delete",
        current_user.email,
        {"task_id": task_id},
    )
    return None
