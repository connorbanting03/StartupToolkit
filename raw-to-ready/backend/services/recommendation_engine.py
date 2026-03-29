import json
from pathlib import Path
from typing import Dict, List

from backend.config import AFFILIATE_LINKS
from backend.models.recommendation import RecommendedTool


_map_path = Path(__file__).resolve().parent.parent / "data" / "keyword_tool_map.json"

TOOL_DISPLAY_NAMES: Dict[str, str] = {
    "shopify": "Shopify",
    "square": "Square",
    "stripe": "Stripe",
    "gumroad": "Gumroad",
    "notion": "Notion",
    "asana": "Asana",
    "monday": "Monday.com",
    "clickup": "ClickUp",
    "linear": "Linear",
    "mailchimp": "Mailchimp",
    "convertkit": "ConvertKit",
    "klaviyo": "Klaviyo",
    "hubspot": "HubSpot",
    "canva": "Canva",
    "figma": "Figma",
    "adobe": "Adobe Creative Cloud",
    "webflow": "Webflow",
    "freshbooks": "FreshBooks",
    "xero": "Xero",
    "wave": "Wave",
    "quickbooks": "QuickBooks",
    "pipedrive": "Pipedrive",
    "salesforce": "Salesforce",
    "bluehost": "Bluehost",
    "ghost": "Ghost",
    "framer": "Framer",
    "railway": "Railway",
    "faire": "Faire",
    "tradegecko": "TradeGecko",
    "shipstation": "ShipStation",
    "semrush": "Semrush",
    "ahrefs": "Ahrefs",
}


def _load_map():
    with open(_map_path, "r") as f:
        return json.load(f)


def build_recommendations(breadcrumbs: List[dict]) -> List[RecommendedTool]:
    """
    Given a list of breadcrumb records from the DB, build deduplicated
    recommendation cards with reasons.
    """
    mapping_data = _load_map()

    # Build a reverse map: tool_key -> list of reasons
    tool_reasons: Dict[str, List[str]] = {}
    tool_categories: Dict[str, str] = {}

    for bc in breadcrumbs:
        source_tool = bc.get("source_tool", "a tool")
        matched_keywords = bc.get("matched_keywords", [])
        recommended_tools = bc.get("recommended_tools", [])

        # Find which mapping produced this
        for mapping in mapping_data.get("mappings", []):
            mapping_tools_set = set(mapping["tools"])
            overlap = set(recommended_tools) & mapping_tools_set
            if overlap and any(kw in matched_keywords for kw in mapping["keywords"]):
                for tool_key in overlap:
                    keyword_match = next(
                        (kw for kw in mapping["keywords"] if kw in matched_keywords),
                        matched_keywords[0] if matched_keywords else "your input",
                    )
                    reason = f'You mentioned "{keyword_match}" in your {source_tool.replace("_", " ").title()}'
                    tool_reasons.setdefault(tool_key, []).append(reason)
                    tool_categories[tool_key] = mapping["category"]

    # Build final list
    recommendations: List[RecommendedTool] = []
    for tool_key, reasons in tool_reasons.items():
        link = AFFILIATE_LINKS.get(tool_key, "")
        recommendations.append(RecommendedTool(
            tool_key=tool_key,
            tool_name=TOOL_DISPLAY_NAMES.get(tool_key, tool_key.title()),
            category=tool_categories.get(tool_key, "General"),
            reason=reasons[0],  # Primary reason
            affiliate_link=link,
            has_link=bool(link),
        ))

    return recommendations
