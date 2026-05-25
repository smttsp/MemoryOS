import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.attachment import Attachment
from app.models.entry import Entry
from app.schemas.attachment import AttachmentOut, AttachmentNoteUpdate
from app.services import file_service, vision_service, embedding_service
from app.config import settings

router = APIRouter()

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _process_image(attachment_id: str, entry_id: str, collection_id: str,
                   entry_date: str, image_abs: Path, tags: list[str], db_url: str):
    """Background task: caption image then embed."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    engine = create_engine(f"sqlite:///{settings.db_path}", connect_args={"check_same_thread": False})
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        att = db.get(Attachment, attachment_id)
        if not att:
            return
        att.embed_status = "processing"
        db.commit()

        caption, ocr = vision_service.caption_image(image_abs)
        att.ai_caption = caption
        att.ocr_text = ocr
        db.commit()

        # Build text to embed: caption + ocr + user note
        parts = filter(None, [caption, ocr, att.user_note])
        text = " ".join(parts)
        if text.strip():
            embedding_service.embed_attachment(
                attachment_id, entry_id, collection_id, entry_date, text, tags
            )
        att.embed_status = "done"
        db.commit()
    except Exception as e:
        print(f"[attachment bg] Error: {e}")
        try:
            att = db.get(Attachment, attachment_id)
            if att:
                att.embed_status = "done"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

@router.post("/upload", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    bg: BackgroundTasks,
    entry_id: str = Form(...),
    file: UploadFile = File(...),
    user_note: str = Form(""),
    db: Session = Depends(get_db),
):
    entry = db.get(Entry, entry_id)
    if not entry or entry.is_deleted:
        raise HTTPException(404, "Entry not found")

    # Size check
    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {settings.max_upload_mb}MB limit")

    filename = file.filename or "upload"
    mime_type = file.content_type or file_service.guess_mime(filename)
    file_type = file_service.detect_file_type(filename, mime_type)

    abs_path, rel_path = file_service.get_storage_paths(filename, entry.entry_date)
    abs_path.write_bytes(content)

    thumbnail_path = None
    if file_type == "image":
        try:
            thumbnail_path = file_service.generate_thumbnail(abs_path, entry.entry_date)
        except Exception as e:
            print(f"[thumbnail] {e}")

    tags = json.loads(entry.tags)
    embed_status = "pending" if file_type == "image" else ("skipped" if not user_note else "pending")

    att = Attachment(
        id=str(uuid.uuid4()),
        entry_id=entry_id,
        filename=filename,
        mime_type=mime_type,
        file_type=file_type,
        storage_path=rel_path,
        thumbnail_path=thumbnail_path,
        file_size=len(content),
        user_note=user_note or None,
        embed_status=embed_status,
        created_at=_now(),
    )
    db.add(att)
    db.commit()
    db.refresh(att)

    # Background processing
    if file_type == "image":
        bg.add_task(
            _process_image,
            att.id, entry_id, entry.collection_id,
            entry.entry_date, abs_path, tags, str(settings.db_path)
        )
    elif user_note:
        bg.add_task(
            embedding_service.embed_attachment,
            att.id, entry_id, entry.collection_id,
            entry.entry_date, user_note, tags
        )

    return AttachmentOut.model_validate(att)

@router.patch("/{attachment_id}", response_model=AttachmentOut)
def update_note(attachment_id: str, data: AttachmentNoteUpdate,
                bg: BackgroundTasks, db: Session = Depends(get_db)):
    att = db.get(Attachment, attachment_id)
    if not att:
        raise HTTPException(404, "Attachment not found")
    att.user_note = data.user_note
    db.commit()
    db.refresh(att)

    # Re-embed with updated note
    entry = db.get(Entry, att.entry_id)
    if entry:
        tags = json.loads(entry.tags)
        parts = filter(None, [att.ai_caption, att.ocr_text, data.user_note])
        text = " ".join(parts)
        if text.strip():
            bg.add_task(
                embedding_service.embed_attachment,
                att.id, att.entry_id, entry.collection_id,
                entry.entry_date, text, tags
            )
            att.embed_status = "pending"
            db.commit()

    return AttachmentOut.model_validate(att)

@router.get("/{attachment_id}/status")
def get_status(attachment_id: str, db: Session = Depends(get_db)):
    att = db.get(Attachment, attachment_id)
    if not att:
        raise HTTPException(404, "Attachment not found")
    return {"id": att.id, "embed_status": att.embed_status, "ai_caption": att.ai_caption}

@router.delete("/{attachment_id}", status_code=204)
def delete_attachment(attachment_id: str, db: Session = Depends(get_db)):
    att = db.get(Attachment, attachment_id)
    if not att:
        raise HTTPException(404, "Attachment not found")
    file_service.delete_files(att.storage_path, att.thumbnail_path)
    embedding_service.delete_embeddings(attachment_id)
    db.delete(att)
    db.commit()
