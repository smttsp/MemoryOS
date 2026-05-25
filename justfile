set dotenv-load := true

# list all recipes
default:
    just --list

# start the full app (backend + frontend)
start:
    #!/bin/bash
    set -e
    GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}No .env found — copying .env.example${NC}"
        cp .env.example .env
        echo -e "${YELLOW}→ Add your OPENAI_API_KEY to .env then restart${NC}"
    fi

    echo "Setting up backend…"
    cd backend
    uv python install
    uv sync
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..

    echo "Setting up frontend…"
    cd frontend
    [ ! -d "node_modules" ] && npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    sleep 2
    echo -e "${GREEN}✅ MemoryOS running${NC}"
    echo "   App:  http://localhost:5173"
    echo "   API:  http://localhost:8000"
    echo "   Docs: http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop"

    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
    wait $BACKEND_PID $FRONTEND_PID

# start backend only (port 8000)
backend:
    #!/bin/bash
    cd backend
    uv python install
    uv sync
    uv run uvicorn app.main:app --reload --port 8000

# start frontend only (port 5173)
frontend:
    cd frontend && npm run dev

# install all dependencies without starting
setup:
    #!/bin/bash
    cd backend && uv python install && uv sync
    cd frontend && npm install

# open API docs in browser
docs:
    open http://localhost:8000/docs

# clean python venv
clean-backend:
    rm -rf backend/.venv

# clean frontend node_modules
clean-frontend:
    rm -rf frontend/node_modules

# clean everything
clean: clean-backend clean-frontend
