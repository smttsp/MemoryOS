from sqlalchemy import Column, String, Text
from app.database import Base


class Todo(Base):
    __tablename__ = "todos"

    id           = Column(String, primary_key=True)
    title        = Column(String, nullable=False)
    notes        = Column(Text, nullable=True)
    tags         = Column(Text, nullable=False, default="[]")   # JSON array
    status       = Column(String, nullable=False, default="pending")  # pending | done
    priority     = Column(String, nullable=False, default="medium")   # low | medium | high
    start_date   = Column(String, nullable=True)   # YYYY-MM-DD
    deadline     = Column(String, nullable=True)   # YYYY-MM-DD
    completed_at = Column(String, nullable=True)
    created_at   = Column(String, nullable=False)
    updated_at   = Column(String, nullable=False)
