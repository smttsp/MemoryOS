from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.search import SearchRequest, SearchResultItem
from app.services.rag_service import retrieve

router = APIRouter()

@router.post("", response_model=list[SearchResultItem])
def semantic_search(req: SearchRequest, db: Session = Depends(get_db)):
    results = retrieve(
        query=req.query,
        db=db,
        collection_ids=req.collection_ids,
        date_from=req.date_from,
        date_to=req.date_to,
        top_k=req.top_k,
    )
    return [SearchResultItem(**r) for r in results]
