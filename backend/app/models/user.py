from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    role = relationship("Role", back_populates="users")
    assigned_tasks = relationship(
        "Task", foreign_keys="Task.assigned_to", back_populates="assignee"
    )
    created_tasks = relationship(
        "Task", foreign_keys="Task.created_by", back_populates="creator"
    )
    documents = relationship("Document", back_populates="uploader")
    search_queries = relationship("SearchQuery", back_populates="user")
