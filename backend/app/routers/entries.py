import uuid
import json
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_
from bs4 import BeautifulSoup
from app.database import get_db
from app.models.entry import Entry
from app.schemas.entry import EntryCreate, EntryUpdate, EntryOut
from app.services import embedding_service

router = APIRouter()

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _strip_html(html: str) -> str:
    return BeautifulSoup(html, "html.parser").get_text(separator=" ").strip()

def _bg_embed(entry_id: str, collection_id: str, entry_date: str,
              text: str, tags: list[str]):
    embedding_service.embed_entry(entry_id, collection_id, entry_date, text, tags)

@router.get("", response_model=list[EntryOut])
def list_entries(
    collection_id: str | None = Query(None),
    date: str | None = Query(None),
    tag: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    q = db.query(Entry).filter(Entry.is_deleted == 0)
    if collection_id:
        q = q.filter(Entry.collection_id == collection_id)
    if date:
        q = q.filter(Entry.entry_date == date)
    if tag:
        q = q.filter(Entry.tags.contains(f'"{tag}"'))
    total = q.count()
    entries = q.order_by(Entry.entry_date.desc(), Entry.created_at.desc()).offset(offset).limit(limit).all()
    return [EntryOut.model_validate(e, update={"tags": json.loads(e.tags)}) for e in entries]

@router.post("", response_model=EntryOut, status_code=201)
def create_entry(data: EntryCreate, bg: BackgroundTasks, db: Session = Depends(get_db)):
    now = _now()
    body_plain = _strip_html(data.body)
    e = Entry(
        id=str(uuid.uuid4()),
        collection_id=data.collection_id,
        title=data.title,
        body=data.body,
        body_plain=body_plain,
        tags=json.dumps(data.tags),
        entry_date=data.entry_date,
        created_at=now,
        updated_at=now,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    text = f"{data.title or ''} {body_plain}".strip()
    bg.add_task(_bg_embed, e.id, e.collection_id, e.entry_date, text, data.tags)
    return EntryOut.model_validate(e, update={"tags": data.tags, "attachments": []})

@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(entry_id: str, db: Session = Depends(get_db)):
    e = db.get(Entry, entry_id)
    if not e or e.is_deleted:
        raise HTTPException(404, "Entry not found")
    return EntryOut.model_validate(e, update={"tags": json.loads(e.tags)})

@router.patch("/{entry_id}", response_model=EntryOut)
def update_entry(entry_id: str, data: EntryUpdate, bg: BackgroundTasks, db: Session = Depends(get_db)):
    e = db.get(Entry, entry_id)
    if not e or e.is_deleted:
        raise HTTPException(404, "Entry not found")
    if data.body is not None:
        e.body = data.body
        e.body_plain = _strip_html(data.body)
    if data.title is not None:
        e.title = data.title
    if data.tags is not None:
        e.tags = json.dumps(data.tags)
    if data.collection_id is not None:
        e.collection_id = data.collection_id
    if data.entry_date is not None:
        e.entry_date = data.entry_date
    e.updated_at = _now()
    db.commit()
    db.refresh(e)
    tags = json.loads(e.tags)
    text = f"{e.title or ''} {e.body_plain}".strip()
    bg.add_task(_bg_embed, e.id, e.collection_id, e.entry_date, text, tags)
    return EntryOut.model_validate(e, update={"tags": tags})

@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: str, db: Session = Depends(get_db)):
    e = db.get(Entry, entry_id)
    if not e or e.is_deleted:
        raise HTTPException(404, "Entry not found")
    e.is_deleted = 1
    e.updated_at = _now()
    db.commit()
    embedding_service.delete_embeddings(entry_id)
