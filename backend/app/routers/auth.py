from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserCreate, UserRead
from app.services import auth_service
from app.services.activity_service import log_activity


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user, access_token = auth_service.login_and_issue_token(
        db, email=payload.email.lower(), password=payload.password
    )
    role_name = user.role.name if user.role else "user"
    log_activity(db, "login", user.email, {"role": role_name})

    return LoginResponse(
        user_id=user.id,
        email=user.email,
        role=role_name,
        access_token=access_token,
        token_type="bearer",
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
) -> UserRead:
    user = auth_service.create_user(db, payload)
    role_name = user.role.name if user.role else payload.role
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role_name,
        is_active=user.is_active,
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    role_name = current_user.role.name if current_user.role else "user"
    return UserRead(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=role_name,
        is_active=current_user.is_active,
    )


@router.get("/admin-check")
def admin_check(_: User = Depends(require_roles(["admin"]))) -> dict[str, str]:
    return {"message": "Admin access granted"}
