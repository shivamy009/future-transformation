from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User


ROLES = ["admin", "user"]


def seed_roles_and_admin(db: Session) -> None:
    for role_name in ROLES:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            db.add(Role(name=role_name))

    db.commit()

    admin_role = db.query(Role).filter(Role.name == "admin").first()
    admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()

    if not admin_user and admin_role:
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
