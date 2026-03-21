from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.models.project import ProjectCreate, ProjectResponse
from backend.dependencies import get_supabase, get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("projects")
        .insert({
            "user_id": user_id,
            "name": project.name,
            "description": project.description,
        })
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return result.data[0]


@router.get("")
async def list_projects(
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("projects")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    projects = result.data or []
    if not projects:
        return projects

    project_ids = [p["id"] for p in projects]

    # Fetch all tool_inputs for these projects in one query
    tools_result = (
        supabase.table("tool_inputs")
        .select("project_id, tool_name")
        .in_("project_id", project_ids)
        .execute()
    )
    # Fetch all breadcrumbs for these projects in one query
    breadcrumbs_result = (
        supabase.table("breadcrumbs")
        .select("project_id, id")
        .in_("project_id", project_ids)
        .execute()
    )

    # Group by project_id
    tools_by_project: dict[str, list[str]] = {}
    for t in (tools_result.data or []):
        tools_by_project.setdefault(t["project_id"], []).append(t["tool_name"])

    breadcrumbs_by_project: dict[str, int] = {}
    for b in (breadcrumbs_result.data or []):
        breadcrumbs_by_project[b["project_id"]] = breadcrumbs_by_project.get(b["project_id"], 0) + 1

    # Enrich each project
    for p in projects:
        tool_names = tools_by_project.get(p["id"], [])
        p["completed_tools"] = list(set(tool_names))
        p["instance_count"] = len(tool_names)
        p["breadcrumbs"] = [{"id": i} for i in range(breadcrumbs_by_project.get(p["id"], 0))]

    return projects


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    # Also fetch tool inputs and breadcrumbs
    tools_result = (
        supabase.table("tool_inputs")
        .select("id, tool_name, label, input_data, created_at, updated_at")
        .eq("project_id", project_id)
        .order("created_at")
        .execute()
    )
    breadcrumbs_result = (
        supabase.table("breadcrumbs")
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )

    project_data = result.data
    tool_items = tools_result.data or []
    project_data["completed_tools"] = list({t["tool_name"] for t in tool_items})
    project_data["tool_instances"] = tool_items
    project_data["breadcrumbs"] = breadcrumbs_result.data or []
    return project_data
