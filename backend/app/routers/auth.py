from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.auth import LoginResponse, UserRegister, UserSignup
from app.schemas.user import UserOut
from app.services.activity_service import log_activity
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
