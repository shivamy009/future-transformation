from sqlalchemy import Column, DateTime, Integer, String, func

from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    actor_email = Column(String(255), nullable=False, index=True)
    metadata_json = Column(String(2000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
