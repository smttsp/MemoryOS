import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate, TodoOut

router = APIRouter()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_out(t: Todo) -> TodoOut:
    return TodoOut.model_validate(t, from_attributes=True)


@router.get("", response_model=list[TodoOut])
def list_todos(
    status: str | None = Query(None),          # pending | done | None = all
    tag: str | None = Query(None),
    priority: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Todo)
    if status:
        q = q.filter(Todo.status == status)
    if tag:
        q = q.filter(Todo.tags.contains(f'"{tag}"'))
    if priority:
        q = q.filter(Todo.priority == priority)

    todos = q.order_by(
        # Sort: pending before done, then by deadline (nulls last), then created_at desc
        Todo.status.asc(),
        Todo.deadline.asc().nullslast(),
        Todo.created_at.desc(),
    ).all()
    return [_to_out(t) for t in todos]


@router.post("", response_model=TodoOut, status_code=201)
def create_todo(data: TodoCreate, db: Session = Depends(get_db)):
    now = _now()
    t = Todo(
        id=str(uuid.uuid4()),
        title=data.title,
        notes=data.notes,
        tags=json.dumps(data.tags),
        priority=data.priority,
        start_date=data.start_date,
        deadline=data.deadline,
        status="pending",
        created_at=now,
        updated_at=now,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _to_out(t)


@router.patch("/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: str, data: TodoUpdate, db: Session = Depends(get_db)):
    t = db.get(Todo, todo_id)
    if not t:
        raise HTTPException(404, "Todo not found")

    fields = data.model_fields_set
    if 'title' in fields and data.title is not None:
        t.title = data.title
    if 'notes' in fields:
        t.notes = data.notes          # None clears it
    if 'tags' in fields and data.tags is not None:
        t.tags = json.dumps(data.tags)
    if 'priority' in fields and data.priority is not None:
        t.priority = data.priority
    if 'start_date' in fields:
        t.start_date = data.start_date  # None clears it
    if 'deadline' in fields:
        t.deadline = data.deadline      # None clears it
    if 'status' in fields and data.status is not None:
        t.status = data.status
        t.completed_at = _now() if data.status == "done" else None

    t.updated_at = _now()
    db.commit()
    db.refresh(t)
    return _to_out(t)


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: str, db: Session = Depends(get_db)):
    t = db.get(Todo, todo_id)
    if not t:
        raise HTTPException(404, "Todo not found")
    db.delete(t)
    db.commit()
