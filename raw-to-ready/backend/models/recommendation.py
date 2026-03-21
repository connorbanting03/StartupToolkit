from pydantic import BaseModel
from typing import List, Optional


class RecommendedTool(BaseModel):
    tool_key: str
    tool_name: str
    category: str
    reason: str
    affiliate_link: str
    has_link: bool


class RecommendationResponse(BaseModel):
    project_id: str
    recommendations: List[RecommendedTool]
    breadcrumb_count: int
