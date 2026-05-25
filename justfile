set dotenv-load := true

# list all recipes
default:
    just --list

# install all dependencies (backend + frontend)
setup:
    cd backend && uv sync
    cd frontend && npm install

# start the full app (backend + frontend)
dev:
    ./start.sh

# start backend only (port 8000)
backend:
    cd backend && uv run uvicorn app.main:app --reload --port 8000

# start frontend only (port 5173)
frontend:
    cd frontend && npm run dev

# install uv if not present
install-uv:
    curl -LsSf https://astral.sh/uv/install.sh | sh

# clean python venv
clean-backend:
    rm -rf backend/.venv

# clean frontend node_modules
clean-frontend:
    rm -rf frontend/node_modules

# clean everything
clean: clean-backend clean-frontend

# open API docs in browser
docs:
    open http://localhost:8000/docs
