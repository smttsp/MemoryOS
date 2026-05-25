from sqlalchemy import Column, String, Text
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(String, primary_key=True)
    role       = Column(String, nullable=False)   # user | assistant
    content    = Column(Text, nullable=False)
    sources    = Column(Text, nullable=True)       # JSON
    created_at = Column(String, nullable=False)
