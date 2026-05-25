from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.entry import Entry
from app.schemas.entry import EntryOut

router = APIRouter()

@router.get("/month")
def month_summary(year: int, month: int, db: Session = Depends(get_db)):
    """Returns entry counts per day for a given month."""
    month_str = f"{year}-{month:02d}"
    rows = (
        db.query(Entry.entry_date, func.count(Entry.id).label("entry_count"))
        .filter(Entry.is_deleted == 0, Entry.entry_date.like(f"{month_str}%"))
        .group_by(Entry.entry_date)
        .all()
    )
    return [{"date": r.entry_date, "entry_count": r.entry_count} for r in rows]

@router.get("/day")
def day_view(date: str = Query(...), db: Session = Depends(get_db)):
    """Returns all entries (with attachments) for a given date."""
    entries = (
        db.query(Entry)
        .filter(Entry.is_deleted == 0, Entry.entry_date == date)
        .order_by(Entry.created_at)
        .all()
    )
    return [EntryOut.model_validate(e, from_attributes=True) for e in entries]
