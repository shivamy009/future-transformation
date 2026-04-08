from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.db_init import seed_roles_and_admin
from app.models import activity_log, role, user
from app.routers.auth import router as auth_router


app = FastAPI(title=settings.PROJECT_NAME)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_roles_and_admin(db)
    finally:
        db.close()


app.include_router(auth_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}