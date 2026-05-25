from pydantic import BaseModel
from typing import Optional, List
from app.schemas.attachment import AttachmentOut

class EntryCreate(BaseModel):
    collection_id: str
    title: Optional[str] = None
    body: str = ""
    tags: List[str] = []
    entry_date: str  # YYYY-MM-DD

class EntryUpdate(BaseModel):
    collection_id: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[List[str]] = None
    entry_date: Optional[str] = None

class EntryOut(BaseModel):
    id: str
    collection_id: str
    title: Optional[str]
    body: str
    body_plain: str
    tags: List[str]
    entry_date: str
    created_at: str
    updated_at: str
    attachments: List[AttachmentOut] = []

    class Config:
        from_attributes = True
