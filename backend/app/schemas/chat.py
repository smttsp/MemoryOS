import json
from pydantic import BaseModel, field_validator
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

    @field_validator('sources', mode='before')
    @classmethod
    def parse_sources(cls, v: object) -> list | None:
        if isinstance(v, str):
            return json.loads(v)
        return v  # type: ignore[return-value]

    class Config:
        from_attributes = True
