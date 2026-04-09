from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.db_init import seed_roles_and_admin
from app.models import activity_log, document, role, search_query, task, user
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.search import router as search_router
from app.routers.tasks import router as tasks_router
from app.services.pinecone_service import init_pinecone_index


app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    if settings.PINECONE_API_KEY:
        init_pinecone_index()

    db = SessionLocal()
    try:
        seed_roles_and_admin(db)
    finally:
        db.close()


app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)


@app.get("/ping")
def health() -> dict[str, str]:
    return {"status": "ok"}