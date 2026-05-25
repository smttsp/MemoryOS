import json
from pydantic import BaseModel, field_validator
from typing import Optional, List


class TodoCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    tags: List[str] = []
    priority: str = "medium"
    start_date: Optional[str] = None   # YYYY-MM-DD
    deadline: Optional[str] = None     # YYYY-MM-DD


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None       # pending | done
    priority: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None


class TodoOut(BaseModel):
    id: str
    title: str
    notes: Optional[str]
    tags: List[str]
    status: str
    priority: str
    start_date: Optional[str]
    deadline: Optional[str]
    completed_at: Optional[str]
    created_at: str
    updated_at: str

    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v: object) -> list:
        if isinstance(v, str):
            return json.loads(v)
        return v  # type: ignore[return-value]

    class Config:
        from_attributes = True
