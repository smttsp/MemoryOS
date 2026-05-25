from pydantic import BaseModel
from typing import Optional

class AttachmentOut(BaseModel):
    id: str
    entry_id: str
    filename: str
    mime_type: str
    file_type: str
    storage_path: str
    thumbnail_path: Optional[str]
    file_size: int
    ai_caption: Optional[str]
    ocr_text: Optional[str]
    user_note: Optional[str]
    embed_status: str
    created_at: str

    class Config:
        from_attributes = True

class AttachmentNoteUpdate(BaseModel):
    user_note: str
