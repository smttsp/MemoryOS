import uuid
import mimetypes
from pathlib import Path
from datetime import date
from PIL import Image
from app.config import settings

THUMBNAIL_SIZE = (600, 600)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
PDF_EXTENSIONS   = {".pdf"}

def detect_file_type(filename: str, mime_type: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext in IMAGE_EXTENSIONS or mime_type.startswith("image/"):
        return "image"
    if ext in VIDEO_EXTENSIONS or mime_type.startswith("video/"):
        return "video"
    if ext in PDF_EXTENSIONS or mime_type == "application/pdf":
        return "pdf"
    return "file"

def get_storage_paths(filename: str, entry_date_str: str) -> tuple[Path, str]:
    """
    Returns (absolute_path, relative_path).
    relative_path is relative to settings.upload_path.
    """
    try:
        d = date.fromisoformat(entry_date_str)
    except Exception:
        d = date.today()

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    rel = Path(str(d.year)) / f"{d.month:02d}" / f"{d.day:02d}" / "originals" / unique_name
    abs_path = settings.upload_path / rel
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    return abs_path, str(rel)

def generate_thumbnail(original_abs: Path, entry_date_str: str) -> str | None:
    """Generate thumbnail and return its relative path, or None on failure."""
    try:
        d = date.fromisoformat(entry_date_str)
    except Exception:
        d = date.today()

    thumb_dir = settings.upload_path / str(d.year) / f"{d.month:02d}" / f"{d.day:02d}" / "thumbnails"
    thumb_dir.mkdir(parents=True, exist_ok=True)
    thumb_abs = thumb_dir / original_abs.name

    with Image.open(original_abs) as img:
        img = img.convert("RGB") if img.mode in ("RGBA", "P") else img
        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
        img.save(thumb_abs, "JPEG", quality=82, optimize=True)

    rel = Path(str(d.year)) / f"{d.month:02d}" / f"{d.day:02d}" / "thumbnails" / original_abs.name
    return str(rel)

def delete_files(storage_path: str, thumbnail_path: str | None = None):
    for p in filter(None, [storage_path, thumbnail_path]):
        full = settings.upload_path / p
        if full.exists():
            full.unlink(missing_ok=True)

def guess_mime(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"
