import base64
from pathlib import Path
from openai import OpenAI
from app.config import settings

VISION_PROMPT = (
    "Please do two things for this image:\n"
    "1. Write a concise description (2-4 sentences) of what you see — content, style, context.\n"
    "2. Extract ALL text visible in the image verbatim (great for screenshots).\n\n"
    "Respond in EXACTLY this format:\n"
    "DESCRIPTION: <your description here>\n"
    "TEXT: <all visible text, or 'none' if there is none>"
)

MIME_MAP = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp",
    ".gif": "image/gif", ".bmp": "image/bmp",
}

def caption_image(image_path: Path) -> tuple[str, str]:
    """
    Returns (caption, ocr_text).
    Falls back to ("", "") on any error.
    """
    if not settings.openai_api_key:
        return "", ""
    try:
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()

        mime = MIME_MAP.get(image_path.suffix.lower(), "image/jpeg")
        client = OpenAI(api_key=settings.openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_PROMPT},
                    {"type": "image_url", "image_url": {
                        "url": f"data:{mime};base64,{b64}",
                        "detail": "high"
                    }},
                ],
            }],
            max_tokens=600,
        )
        raw = resp.choices[0].message.content or ""
        caption, ocr = "", ""
        for line in raw.splitlines():
            if line.startswith("DESCRIPTION:"):
                caption = line.removeprefix("DESCRIPTION:").strip()
            elif line.startswith("TEXT:"):
                ocr = line.removeprefix("TEXT:").strip()
                if ocr.lower() in ("none", "none.", ""):
                    ocr = ""
        return caption, ocr
    except Exception as e:
        print(f"[vision] Error captioning {image_path}: {e}")
        return "", ""
