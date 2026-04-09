from fastapi import APIRouter, Depends, status
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import json
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.activity import ActivityOut, UserActivityResponse
from app.schemas.auth import LoginResponse, UserRegister, UserSignup
from app.schemas.user import UserOut
from app.services.activity_service import list_activities_by_email, log_activity
from app.services.auth_service import create_user, login_user, signup_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = login_user(db, form_data.username, form_data.password)
    log_activity(db, "login", form_data.username, {"status": "success"})
    return result


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    user = signup_user(db, payload)
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(["admin"]))],
)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    user = create_user(db, payload)
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.get("/admin-check", dependencies=[Depends(require_roles(["admin"]))])
def admin_check(current_user: User = Depends(get_current_user)):
    return {"message": f"Admin access granted for {current_user.email}"}


@router.get("/users", response_model=list[UserOut], dependencies=[Depends(require_roles(["admin"]))])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active.is_(True)).order_by(User.id.asc()).all()
    return [
        UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.name,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.get(
    "/users/{user_id}/activities",
    response_model=UserActivityResponse,
    dependencies=[Depends(require_roles(["admin"]))],
)
def list_user_activities(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return UserActivityResponse(user_id=user_id, user_email="", activities=[])

    records = list_activities_by_email(db, user.email, limit=50)

    activities: list[ActivityOut] = []
    for record in records:
        metadata_value = {}
        if record.metadata_json:
            try:
                parsed = json.loads(record.metadata_json)
                if isinstance(parsed, dict):
                    metadata_value = parsed
            except json.JSONDecodeError:
                metadata_value = {}

        activities.append(
            ActivityOut(
                id=record.id,
                action=record.action,
                actor_email=record.actor_email,
                metadata=metadata_value,
                created_at=record.created_at,
            )
        )

    return UserActivityResponse(user_id=user.id, user_email=user.email, activities=activities)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles(["admin"]))],
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()

    log_activity(
        db,
        "user_delete",
        current_user.email,
        {"deleted_user_id": user.id, "deleted_user_email": user.email},
    )

    return None
