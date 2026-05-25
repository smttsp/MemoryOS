#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours ───────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}Starting MemoryOS...${NC}"

# ── Check .env ────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo -e "${YELLOW}No .env found — copying .env.example${NC}"
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo -e "${YELLOW}→ Add your OPENAI_API_KEY to .env then restart${NC}"
fi

# ── Backend ───────────────────────────────────────────────
echo "Starting backend (port 8000)…"
cd "$ROOT_DIR/backend"

# Install deps if needed
if [ ! -d ".venv" ]; then
  echo "  Installing Python dependencies with uv…"
  uv sync
fi

uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ── Frontend ──────────────────────────────────────────────
echo "Starting frontend (port 5173)…"
cd "$ROOT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "  Installing npm dependencies…"
  npm install
fi

npm run dev &
FRONTEND_PID=$!

# ── Ready ─────────────────────────────────────────────────
sleep 2
echo ""
echo -e "${GREEN}✅ MemoryOS is running${NC}"
echo "   App:   http://localhost:5173"
echo "   API:   http://localhost:8000"
echo "   Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop everything"

# ── Cleanup on exit ───────────────────────────────────────
trap "echo 'Stopping…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
