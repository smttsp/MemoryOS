from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id             = Column(String, primary_key=True)
    entry_id       = Column(String, ForeignKey("entries.id", ondelete="CASCADE"), nullable=False)
    filename       = Column(String, nullable=False)
    mime_type      = Column(String, nullable=False)
    file_type      = Column(String, nullable=False)   # image | video | pdf | file
    storage_path   = Column(String, nullable=False)   # relative to uploads/
    thumbnail_path = Column(String, nullable=True)
    file_size      = Column(Integer, nullable=False)
    ai_caption     = Column(Text, nullable=True)
    ocr_text       = Column(Text, nullable=True)
    user_note      = Column(Text, nullable=True)
    embed_status   = Column(String, nullable=False, default="pending")  # pending|processing|done|skipped
    created_at     = Column(String, nullable=False)

    entry = relationship("Entry", back_populates="attachments")
