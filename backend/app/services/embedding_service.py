import json
import uuid
import lancedb
import pyarrow as pa
from openai import OpenAI
from app.config import settings

# ── LanceDB setup ──────────────────────────────────────────────────────────────

SCHEMA = pa.schema([
    pa.field("id",            pa.string()),
    pa.field("source_type",   pa.string()),   # entry | attachment
    pa.field("source_id",     pa.string()),
    pa.field("entry_id",      pa.string()),   # always the parent entry
    pa.field("collection_id", pa.string()),
    pa.field("entry_date",    pa.string()),   # YYYY-MM-DD
    pa.field("chunk_text",    pa.string()),
    pa.field("tags",          pa.string()),   # JSON array string
    pa.field("vector",        pa.list_(pa.float32(), 1536)),
])

def _get_table():
    settings.vector_path.mkdir(parents=True, exist_ok=True)
    db = lancedb.connect(str(settings.vector_path))
    try:
        return db.open_table("embeddings")
    except Exception:
        # Create with empty data using schema
        return db.create_table("embeddings", schema=SCHEMA)

# ── Chunking ───────────────────────────────────────────────────────────────────

def _chunk(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    text = text.strip()
    if not text:
        return []
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start: start + size])
        start += size - overlap
    return [c for c in chunks if c.strip()]

# ── Embedding ──────────────────────────────────────────────────────────────────

def _embed(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    client = OpenAI(api_key=settings.openai_api_key)
    resp = client.embeddings.create(model=settings.embed_model, input=texts)
    return [r.embedding for r in resp.data]

# ── Public API ─────────────────────────────────────────────────────────────────

def embed_entry(entry_id: str, collection_id: str, entry_date: str,
                text: str, tags: list[str]):
    """Embed an entry's text into LanceDB."""
    if not settings.openai_api_key:
        return
    table = _get_table()
    # Remove old vectors
    try:
        table.delete(f"source_id = '{entry_id}' AND source_type = 'entry'")
    except Exception:
        pass

    chunks = _chunk(text)
    if not chunks:
        return
    vectors = _embed(chunks)
    rows = [
        {
            "id":            str(uuid.uuid4()),
            "source_type":   "entry",
            "source_id":     entry_id,
            "entry_id":      entry_id,
            "collection_id": collection_id,
            "entry_date":    entry_date,
            "chunk_text":    chunk,
            "tags":          json.dumps(tags),
            "vector":        vec,
        }
        for chunk, vec in zip(chunks, vectors)
    ]
    table.add(rows)

def embed_attachment(attachment_id: str, entry_id: str, collection_id: str,
                     entry_date: str, text: str, tags: list[str]):
    """Embed an attachment's text (caption + ocr + user note)."""
    if not settings.openai_api_key or not text.strip():
        return
    table = _get_table()
    try:
        table.delete(f"source_id = '{attachment_id}' AND source_type = 'attachment'")
    except Exception:
        pass

    chunks = _chunk(text)
    if not chunks:
        return
    vectors = _embed(chunks)
    rows = [
        {
            "id":            str(uuid.uuid4()),
            "source_type":   "attachment",
            "source_id":     attachment_id,
            "entry_id":      entry_id,
            "collection_id": collection_id,
            "entry_date":    entry_date,
            "chunk_text":    chunk,
            "tags":          json.dumps(tags),
            "vector":        vec,
        }
        for chunk, vec in zip(chunks, vectors)
    ]
    table.add(rows)

def delete_embeddings(source_id: str):
    try:
        table = _get_table()
        table.delete(f"source_id = '{source_id}'")
    except Exception:
        pass

def search(query: str, collection_ids: list[str] | None = None,
           date_from: str | None = None, date_to: str | None = None,
           top_k: int = 8) -> list[dict]:
    """Semantic search with optional metadata pre-filters."""
    if not settings.openai_api_key:
        return []
    vectors = _embed([query])
    if not vectors:
        return []
    query_vec = vectors[0]

    table = _get_table()
    filters = []
    if collection_ids:
        ids_str = ", ".join(f"'{c}'" for c in collection_ids)
        filters.append(f"collection_id IN ({ids_str})")
    if date_from:
        filters.append(f"entry_date >= '{date_from}'")
    if date_to:
        filters.append(f"entry_date <= '{date_to}'")

    q = table.search(query_vec).limit(top_k)
    if filters:
        q = q.where(" AND ".join(filters))

    try:
        return q.to_list()
    except Exception:
        return []
