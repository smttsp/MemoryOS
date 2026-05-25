import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.collection import Collection
from app.models.entry import Entry
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionOut

router = APIRouter()

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get("", response_model=list[CollectionOut])
def list_collections(db: Session = Depends(get_db)):
    collections = db.query(Collection).order_by(Collection.sort_order, Collection.created_at).all()
    result = []
    for c in collections:
        count = db.query(func.count(Entry.id)).filter(
            Entry.collection_id == c.id, Entry.is_deleted == 0
        ).scalar() or 0
        out = CollectionOut.model_validate(c)
        out.entry_count = count
        result.append(out)
    return result

@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db)):
    now = _now()
    c = Collection(
        id=str(uuid.uuid4()),
        name=data.name,
        icon=data.icon,
        color=data.color,
        description=data.description,
        sort_order=data.sort_order,
        created_at=now,
        updated_at=now,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    out = CollectionOut.model_validate(c)
    out.entry_count = 0
    return out

@router.patch("/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: str, data: CollectionUpdate, db: Session = Depends(get_db)):
    c = db.get(Collection, collection_id)
    if not c:
        raise HTTPException(404, "Collection not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(c, field, value)
    c.updated_at = _now()
    db.commit()
    db.refresh(c)
    count = db.query(func.count(Entry.id)).filter(
        Entry.collection_id == c.id, Entry.is_deleted == 0
    ).scalar() or 0
    out = CollectionOut.model_validate(c)
    out.entry_count = count
    return out

@router.delete("/{collection_id}", status_code=204)
def delete_collection(collection_id: str, db: Session = Depends(get_db)):
    c = db.get(Collection, collection_id)
    if not c:
        raise HTTPException(404, "Collection not found")
    db.delete(c)
    db.commit()
