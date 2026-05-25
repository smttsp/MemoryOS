from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.database import engine, Base
from app.config import settings

# Ensure directories exist before StaticFiles is mounted
settings.upload_path.mkdir(parents=True, exist_ok=True)
settings.vector_path.mkdir(parents=True, exist_ok=True)
settings.db_path.parent.mkdir(parents=True, exist_ok=True)

# Import all models so they register with Base
import app.models  # noqa: F401

from app.routers import (
    collections, entries, attachments,
    timeline, search, chat, settings as settings_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Ensure directories exist
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    settings.vector_path.mkdir(parents=True, exist_ok=True)
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    yield

app = FastAPI(title="MemoryOS", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path), html=False), name="uploads")

app.include_router(collections.router,     prefix="/api/collections", tags=["collections"])
app.include_router(entries.router,         prefix="/api/entries",     tags=["entries"])
app.include_router(attachments.router,     prefix="/api/attachments", tags=["attachments"])
app.include_router(timeline.router,        prefix="/api/timeline",    tags=["timeline"])
app.include_router(search.router,          prefix="/api/search",      tags=["search"])
app.include_router(chat.router,            prefix="/api/chat",        tags=["chat"])
app.include_router(settings_router.router, prefix="/api/settings",    tags=["settings"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
