from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Collection(Base):
    __tablename__ = "collections"

    id          = Column(String, primary_key=True)
    name        = Column(String, nullable=False)
    icon        = Column(String, nullable=False, default="📁")
    color       = Column(String, nullable=False, default="#6c63ff")
    description = Column(Text, nullable=True)
    sort_order  = Column(Integer, nullable=False, default=0)
    created_at  = Column(String, nullable=False)
    updated_at  = Column(String, nullable=False)

    entries = relationship("Entry", back_populates="collection", cascade="all, delete-orphan")
