from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import LoginResponse, LoginUser, UserRegister, UserSignup


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user


def login_user(db: Session, email: str, password: str) -> LoginResponse:
    user = authenticate_user(db, email, password)
    token = create_access_token(subject=str(user.id))
    role_name = user.role.name if user.role else "user"
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_role=role_name,
        user=LoginUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=role_name,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


def create_user(db: Session, payload: UserRegister) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    role = db.query(Role).filter(Role.name == payload.role.lower()).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'admin' or 'user'",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def signup_user(db: Session, payload: UserSignup) -> User:
    register_payload = UserRegister(
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role="user",
    )
    return create_user(db, register_payload)
