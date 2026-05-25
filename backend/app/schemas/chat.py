from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    collection_ids: Optional[List[str]] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[list] = None
    created_at: str

    class Config:
        from_attributes = True
