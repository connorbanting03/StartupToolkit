"""Optional AI auto-fill: runs a tool page's prompt against the Anthropic API.

Disabled (503 / enabled=false) unless ANTHROPIC_API_KEY is set. Requires a signed-in user and is
rate limited per user per UTC day, since every call is billed to the deployment's API key.
"""
from datetime import datetime, timezone

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL, AI_DAILY_LIMIT
from backend.dependencies import get_current_user_id

router = APIRouter(prefix="/api/ai", tags=["ai"])

# user_id -> (UTC date, calls today). In-memory: fine for one instance, resets on restart.
_usage: dict[str, tuple[str, int]] = {}


class AutofillRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=6000)


class AutofillResponse(BaseModel):
    text: str
    remaining_today: int


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _consume(user_id: str) -> int:
    """Count one call for the user; raise 429 when over the daily limit. Returns calls left."""
    day, used = _usage.get(user_id, (_today(), 0))
    if day != _today():
        day, used = _today(), 0
    if used >= AI_DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Daily auto-fill limit reached. Try again tomorrow.")
    _usage[user_id] = (day, used + 1)
    return AI_DAILY_LIMIT - used - 1


@router.get("/status")
async def status():
    return {"enabled": bool(ANTHROPIC_API_KEY), "daily_limit": AI_DAILY_LIMIT}


@router.post("/autofill", response_model=AutofillResponse)
async def autofill(body: AutofillRequest, user_id: str = Depends(get_current_user_id)):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI auto-fill is not configured on this server.")

    remaining = _consume(user_id)
    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    try:
        message = await client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": body.prompt}],
        )
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="The AI provider is rate limiting requests. Try again shortly.")
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="The AI provider returned an error.")

    text = "".join(block.text for block in message.content if block.type == "text").strip()
    if not text:
        raise HTTPException(status_code=502, detail="The AI provider returned an empty response.")
    return AutofillResponse(text=text, remaining_today=remaining)
