# 🧠 MemoryOS

A local-first personal memory app. Store notes, inspirations, screenshots, files, and daily journal entries — all on your machine. Ask questions and get AI-powered answers drawn from everything you've saved.

---

## Quick Start

### Prerequisites
- [uv](https://docs.astral.sh/uv/getting-started/installation/) for Python
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Run

```bash
# 1. Clone / move this folder wherever you want it
cd memoryos

# 2. Copy env and add your key
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...

# 3. Start everything
chmod +x start.sh
./start.sh
```

Open http://localhost:5173 — that's it.

---

## What it does

| Feature | Description |
|---|---|
| **Collections** | Create named folders (Inspiration, Finance, Home…) with custom icons and colors |
| **Entries** | Rich text notes with tags, dates, and file attachments |
| **Media** | Upload images, screenshots, videos, PDFs, any file |
| **AI captions** | Screenshots and images are automatically described by GPT-4V |
| **Timeline** | Browse any day in calendar view to see everything you saved |
| **AI Chat** | Ask natural language questions across all your content |
| **Semantic search** | Find entries by meaning, not just keywords |

---

## Project Structure

```
memoryos/
├── backend/           # FastAPI + SQLite + LanceDB
│   ├── app/
│   │   ├── models/    # SQLAlchemy ORM
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── routers/   # API routes
│   │   ├── services/  # File, embedding, vision, RAG, chat
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   └── pyproject.toml
├── frontend/          # React + Vite + Tailwind + TipTap
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── api/
├── data/              # SQLite DB + LanceDB vectors (created at runtime)
├── uploads/           # Your files (created at runtime)
├── .env               # Your config (create from .env.example)
└── start.sh
```

---

## Configuration (`.env`)

| Key | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required** for AI features |
| `OPENAI_MODEL` | `gpt-4o` | Chat model |
| `EMBED_MODEL` | `text-embedding-3-small` | Embedding model |

You can also set these in the app's **Settings** page at runtime.

---

## How the AI works

1. When you save an entry, its text is embedded (converted to a vector) and stored in LanceDB.
2. When you upload an image or screenshot, GPT-4V reads it and writes a description — that description is also embedded.
3. Videos store only your written notes, which get embedded.
4. When you ask a question in Chat, the app finds the most relevant entries via vector similarity, injects them as context, and GPT-4o answers.

Everything except OpenAI API calls is 100% local.

---

## Data & Privacy

- Your database: `data/app.db` (SQLite)
- Your vectors: `data/vectors/` (LanceDB)
- Your uploads: `uploads/`

Nothing is sent to any server except OpenAI API calls. Those calls send only the text/image you're querying — no account info, no metadata.

---

## Development

```bash
# Backend only
cd backend && uv run uvicorn app.main:app --reload --port 8000

# Frontend only
cd frontend && npm run dev

# API docs (auto-generated)
open http://localhost:8000/docs
```

---

## Future: Mobile Sync

The schema is designed with sync in mind (`updated_at` on every table). When you're ready for mobile:
1. Spin up a PocketBase instance as your sync server
2. Build a React Native / Expo client
3. Add a sync service that pushes/pulls deltas

Your laptop stays the source of truth.
