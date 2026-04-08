from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate


def create_task(db: Session, payload: TaskCreate, creator_id: int) -> Task:
    assignee = db.query(User).filter(User.id == payload.assigned_to, User.is_active.is_(True)).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )

    task = Task(
        title=payload.title,
        description=payload.description,
        assigned_to=payload.assigned_to,
        created_by=creator_id,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(
    db: Session,
    role_name: str,
    user_id: int,
    status_filter: Optional[str],
    assigned_to: Optional[int],
    page: int,
    page_size: int,
) -> tuple[list[Task], int]:
    query = db.query(Task)

    if role_name != "admin":
        query = query.filter(Task.assigned_to == user_id)

    if status_filter:
        query = query.filter(Task.status == status_filter)

    if assigned_to is not None and role_name == "admin":
        query = query.filter(Task.assigned_to == assigned_to)

    total = query.count()
    items = (
        query.order_by(Task.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def update_task_status(
    db: Session,
    task_id: int,
    status_value: str,
    current_user_id: int,
    role_name: str,
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if role_name != "admin" and task.assigned_to != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own assigned tasks",
        )

    task.status = status_value
    db.commit()
    db.refresh(task)
    return task
