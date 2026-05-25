import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatRequest, ChatMessageOut
from app.services.rag_service import retrieve
from app.services.chat_service import stream_response, build_context

router = APIRouter()

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get("/history", response_model=list[ChatMessageOut])
def get_history(db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).order_by(ChatMessage.created_at).all()
    result = []
    for m in messages:
        out = ChatMessageOut.model_validate(m)
        if m.sources:
            out.sources = json.loads(m.sources)
        result.append(out)
    return result

@router.delete("/history", status_code=204)
def clear_history(db: Session = Depends(get_db)):
    db.query(ChatMessage).delete()
    db.commit()

@router.post("/message")
def send_message(req: ChatRequest, db: Session = Depends(get_db)):
    # Save user message
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        role="user",
        content=req.message,
        created_at=_now(),
    )
    db.add(user_msg)
    db.commit()

    # Retrieve context
    retrieved = retrieve(
        query=req.message,
        db=db,
        collection_ids=req.collection_ids,
        date_from=req.date_from,
        date_to=req.date_to,
    )
    context = build_context(retrieved)

    # Build history for LLM
    history_rows = db.query(ChatMessage).order_by(ChatMessage.created_at.desc()).limit(8).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(history_rows[1:])]

    sources_json = json.dumps([
        {"entry_id": r["entry_id"], "title": r.get("title"), "entry_date": r["entry_date"],
         "score": r["score"], "chunk_text": r["chunk_text"][:200]}
        for r in retrieved
    ])

    full_response = []

    def generate():
        for token in stream_response(req.message, context, history):
            full_response.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"

        # Save assistant message after streaming completes
        from sqlalchemy.orm import sessionmaker
        from app.database import engine
        Session = sessionmaker(bind=engine)
        s = Session()
        try:
            assistant_msg = ChatMessage(
                id=str(uuid.uuid4()),
                role="assistant",
                content="".join(full_response),
                sources=sources_json,
                created_at=_now(),
            )
            s.add(assistant_msg)
            s.commit()
        finally:
            s.close()

        # Send sources at the end
        yield f"data: {json.dumps({'sources': json.loads(sources_json), 'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
