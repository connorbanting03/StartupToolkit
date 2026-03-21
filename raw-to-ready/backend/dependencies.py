from fastapi import Header, HTTPException
from supabase import create_client, Client

from backend.config import SUPABASE_URL, SUPABASE_KEY


def get_supabase(authorization: str = Header(default="")) -> Client:
    """Create a Supabase client, optionally scoped to the user's token."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=503,
            detail="Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY in config.py",
        )
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # If we have a bearer token, set it on the client for RLS
    if authorization.startswith("Bearer "):
        token = authorization[7:]
        client.postgrest.auth(token)
    return client


async def get_current_user_id(authorization: str = Header(default="")) -> str:
    """Extract user ID from the Supabase JWT. Requires a valid token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    token = authorization[7:]

    try:
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
