from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.dependencies import get_supabase, get_current_user_id
from backend.services.recommendation_engine import build_recommendations
from backend.models.recommendation import RecommendationResponse

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/{project_id}", response_model=RecommendationResponse)
async def get_recommendations(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    # Verify project belongs to user
    proj = (
        supabase.table("projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch all breadcrumbs for this project
    breadcrumbs_result = (
        supabase.table("breadcrumbs")
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )
    breadcrumbs = breadcrumbs_result.data or []

    recommendations = build_recommendations(breadcrumbs)

    return RecommendationResponse(
        project_id=project_id,
        recommendations=recommendations,
        breadcrumb_count=len(breadcrumbs),
    )
