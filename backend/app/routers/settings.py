from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setting import Setting

router = APIRouter()

DEFAULT_SETTINGS = {
    "openai_api_key": "",
    "openai_model":   "gpt-4o",
    "embed_model":    "text-embedding-3-small",
    "app_theme":      "light",
}

def _now():
    return datetime.now(timezone.utc).isoformat()

def _ensure_defaults(db: Session):
    for key, value in DEFAULT_SETTINGS.items():
        if not db.get(Setting, key):
            db.add(Setting(key=key, value=value, updated_at=_now()))
    db.commit()

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    _ensure_defaults(db)
    rows = db.query(Setting).all()
    return {r.key: r.value for r in rows}

@router.patch("")
def update_settings(data: dict, db: Session = Depends(get_db)):
    _ensure_defaults(db)
    for key, value in data.items():
        row = db.get(Setting, key)
        if row:
            row.value = str(value)
            row.updated_at = _now()
        else:
            db.add(Setting(key=key, value=str(value), updated_at=_now()))
    db.commit()

    # Update runtime config if API key changed
    from app.config import settings
    if "openai_api_key" in data:
        settings.openai_api_key = data["openai_api_key"]
    if "openai_model" in data:
        settings.openai_model = data["openai_model"]

    return {"ok": True}
