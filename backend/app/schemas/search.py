from pydantic import BaseModel
from typing import Optional, List

class SearchRequest(BaseModel):
    query: str
    collection_ids: Optional[List[str]] = None
    date_from: Optional[str] = None   # YYYY-MM-DD
    date_to: Optional[str] = None
    top_k: int = 8

class SearchResultItem(BaseModel):
    entry_id: str
    title: Optional[str]
    body_plain: str
    entry_date: str
    collection_id: str
    score: float
    chunk_text: str
    attachments: list = []
