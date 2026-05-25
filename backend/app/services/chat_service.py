from openai import OpenAI
from typing import Generator
from app.config import settings

SYSTEM_PROMPT = """You are a personal memory assistant for the user. You have access to their notes, journal entries, saved inspirations, financial records, and any other content they have stored.

When answering:
- Be specific — reference dates, entry content, and details when you have them
- If you cite something, mention the date it was saved
- If you don't have enough context from the provided entries, say so clearly
- Format your response with clear paragraphs; use bullet points only when listing items
- Speak in second person to the user (e.g., "You saved this on...", "Your entry from...")"""

def build_context(retrieved: list[dict]) -> str:
    if not retrieved:
        return "No relevant entries found."
    parts = []
    for i, r in enumerate(retrieved, 1):
        att_lines = []
        for a in r.get("attachments", []):
            if a.get("ai_caption"):
                att_lines.append(f"  [Attachment: {a['ai_caption']}]")
            if a.get("user_note"):
                att_lines.append(f"  [Your note on file: {a['user_note']}]")
        attachments_text = "\n".join(att_lines)
        body = r["body_plain"][:1000]
        parts.append(
            f"Entry {i} | Date: {r['entry_date']} | ID: {r['entry_id']}\n"
            f"{body}\n{attachments_text}".strip()
        )
    return "\n\n---\n\n".join(parts)

def stream_response(
    message: str,
    context: str,
    history: list[dict],
) -> Generator[str, None, None]:
    if not settings.openai_api_key:
        yield "OpenAI API key not configured. Please add it in Settings."
        return

    client = OpenAI(api_key=settings.openai_api_key)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"Relevant memory entries:\n\n{context}"},
    ]
    # Last 6 messages = 3 turns of context
    messages.extend(history[-6:])
    messages.append({"role": "user", "content": message})

    try:
        with client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            stream=True,
            max_tokens=1500,
            temperature=0.3,
        ) as stream:
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
    except Exception as e:
        yield f"\n\n[Error: {e}]"
