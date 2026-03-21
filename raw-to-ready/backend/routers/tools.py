from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.dependencies import get_supabase, get_current_user_id
from backend.services.keyword_extractor import extract_keywords

router = APIRouter(prefix="/api/tools", tags=["tools"])

VALID_TOOLS = [
    "revenue_projector",
    "unit_economics",
    "pricing_calculator",
    "supplier_matrix",
    "cash_flow",
]


@router.post("/{tool_name}/submit")
async def submit_tool(
    tool_name: str,
    payload: dict,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    if tool_name not in VALID_TOOLS:
        raise HTTPException(status_code=400, detail=f"Invalid tool: {tool_name}")

    project_id = payload.pop("project_id", None)
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    instance_id = payload.pop("instance_id", None)
    label = payload.pop("label", None)

    # Verify project belongs to user
    proj = (
        supabase.table("projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Project not found")

    if instance_id:
        # Update existing instance
        supabase.table("tool_inputs").update({
            "input_data": payload,
            "label": label,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", instance_id).eq("project_id", project_id).execute()
    else:
        # Create new instance
        supabase.table("tool_inputs").insert({
            "project_id": project_id,
            "tool_name": tool_name,
            "input_data": payload,
            "label": label,
        }).execute()

    # Extract keywords and create breadcrumbs
    matched_keywords, recommended_tools, matched_mappings = extract_keywords(payload)

    if matched_keywords:
        raw_text = " | ".join(
            f"{k}: {v}" for k, v in payload.items()
            if isinstance(v, (str, int, float))
        )[:500]

        supabase.table("breadcrumbs").insert({
            "project_id": project_id,
            "source_tool": tool_name,
            "raw_input": raw_text,
            "matched_keywords": matched_keywords,
            "recommended_tools": recommended_tools,
        }).execute()

    return {
        "status": "saved",
        "matched_keywords": matched_keywords,
        "recommended_tools": recommended_tools,
        "new_breadcrumbs": len(matched_keywords),
    }


@router.get("/{tool_name}/{project_id}")
async def get_tool_data(
    tool_name: str,
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    if tool_name not in VALID_TOOLS:
        raise HTTPException(status_code=400, detail=f"Invalid tool: {tool_name}")

    # Verify project belongs to user
    proj = (
        supabase.table("projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Project not found")

    result = (
        supabase.table("tool_inputs")
        .select("id, tool_name, label, input_data, created_at, updated_at")
        .eq("project_id", project_id)
        .eq("tool_name", tool_name)
        .order("created_at")
        .execute()
    )
    return result.data or []


@router.delete("/{tool_name}/{instance_id}")
async def delete_tool_instance(
    tool_name: str,
    instance_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    if tool_name not in VALID_TOOLS:
        raise HTTPException(status_code=400, detail=f"Invalid tool: {tool_name}")

    # Verify the instance belongs to a project owned by this user
    instance = (
        supabase.table("tool_inputs")
        .select("id, project_id")
        .eq("id", instance_id)
        .eq("tool_name", tool_name)
        .maybe_single()
        .execute()
    )
    if not instance.data:
        raise HTTPException(status_code=404, detail="Instance not found")

    proj = (
        supabase.table("projects")
        .select("id")
        .eq("id", instance.data["project_id"])
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Not authorized")

    supabase.table("tool_inputs").delete().eq("id", instance_id).execute()
    return {"status": "deleted"}
