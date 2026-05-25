from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Entry(Base):
    __tablename__ = "entries"

    id            = Column(String, primary_key=True)
    collection_id = Column(String, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    title         = Column(String, nullable=True)
    body          = Column(Text, nullable=False, default="")
    body_plain    = Column(Text, nullable=False, default="")
    tags          = Column(Text, nullable=False, default="[]")  # JSON string
    entry_date    = Column(String, nullable=False)               # YYYY-MM-DD
    created_at    = Column(String, nullable=False)
    updated_at    = Column(String, nullable=False)
    is_deleted    = Column(Integer, nullable=False, default=0)

    collection  = relationship("Collection", back_populates="entries")
    attachments = relationship("Attachment", back_populates="entry", cascade="all, delete-orphan", order_by="Attachment.created_at")
