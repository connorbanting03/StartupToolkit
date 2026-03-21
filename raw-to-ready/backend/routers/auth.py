from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.dependencies import get_supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
async def get_current_user(supabase: Client = Depends(get_supabase)):
    """Return current user info from the Supabase session."""
    try:
        user = supabase.auth.get_user()
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        u = user.user
        return {
            "id": u.id,
            "email": u.email,
            "name": u.user_metadata.get("full_name", u.email),
            "avatar_url": u.user_metadata.get("avatar_url", ""),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")
