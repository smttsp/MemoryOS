import json
from sqlalchemy.orm import Session
from app.services.embedding_service import search as vector_search
from app.models.entry import Entry
from app.models.attachment import Attachment

def retrieve(
    query: str,
    db: Session,
    collection_ids: list[str] | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    top_k: int = 8,
) -> list[dict]:
    """
    Full retrieval pipeline:
    1. Vector search with metadata filters
    2. Hydrate from SQLite
    3. Deduplicate by entry_id
    4. Return sorted by relevance score
    """
    raw = vector_search(query, collection_ids, date_from, date_to, top_k * 2)

    # Deduplicate by entry_id, keep best score
    seen: dict[str, dict] = {}
    for r in raw:
        eid = r["entry_id"]
        score = float(r.get("_distance", 1.0))
        if eid not in seen or score < seen[eid]["score"]:
            seen[eid] = {
                "entry_id":   eid,
                "score":      score,
                "chunk_text": r.get("chunk_text", ""),
            }

    if not seen:
        return []

    entries = (
        db.query(Entry)
        .filter(Entry.id.in_(list(seen.keys())), Entry.is_deleted == 0)
        .all()
    )

    results = []
    for entry in entries:
        meta = seen[entry.id]
        attachments = [
            {
                "id":           a.id,
                "file_type":    a.file_type,
                "thumbnail_path": a.thumbnail_path,
                "ai_caption":  a.ai_caption,
                "user_note":   a.user_note,
                "filename":    a.filename,
            }
            for a in entry.attachments
        ]
        results.append({
            "entry_id":      entry.id,
            "title":         entry.title,
            "body_plain":    entry.body_plain,
            "entry_date":    entry.entry_date,
            "collection_id": entry.collection_id,
            "score":         meta["score"],
            "chunk_text":    meta["chunk_text"],
            "attachments":   attachments,
        })

    return sorted(results, key=lambda x: x["score"])[:top_k]
