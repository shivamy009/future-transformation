from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User


def seed_roles_and_admin() -> None:
    db: Session = SessionLocal()
    try:
        for role_name in ["admin", "user"]:
            role = db.query(Role).filter(Role.name == role_name).first()
            if role is None:
                db.add(Role(name=role_name))
        db.commit()

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if admin_role is None:
            return

        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin_user is None:
            db.add(
                User(
                    email=settings.ADMIN_EMAIL,
                    full_name="System Admin",
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    role_id=admin_role.id,
                    is_active=True,
                )
            )
            db.commit()
    finally:
        db.close()
