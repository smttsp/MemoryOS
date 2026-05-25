from pydantic import BaseModel
from typing import Optional

class CollectionCreate(BaseModel):
    name: str
    icon: str = "📁"
    color: str = "#6c63ff"
    description: Optional[str] = None
    sort_order: int = 0

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None

class CollectionOut(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: Optional[str]
    sort_order: int
    created_at: str
    updated_at: str
    entry_count: int = 0

    class Config:
        from_attributes = True
