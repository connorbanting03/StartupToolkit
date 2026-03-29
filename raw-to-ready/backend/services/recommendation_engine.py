import json
from pathlib import Path
from typing import Dict, List

from backend.config import AFFILIATE_LINKS
from backend.models.recommendation import RecommendedTool


_map_path = Path(__file__).resolve().parent.parent / "data" / "keyword_tool_map.json"

TOOL_DESCRIPTIONS: Dict[str, str] = {
    "shopify":      "Start your online store free, then just $1/month to keep building. Shopify powers over 1M businesses with everything from storefronts to payments to shipping — all in one place. Plus, earn up to $13,000 in credits as you grow.",
    "smartli":      "AI-powered copywriting built for ecommerce. Smartli writes high-converting product descriptions, SEO blogs, and ads in seconds — so you can launch faster and rank higher without hiring a copywriter.",
    "railway":      "Deploy your backend, frontend, or database in minutes — no DevOps required. Railway auto-scales with your business, so you only pay for what you use. The fastest way to go from code to production.",
    "easyship":     "Simplify shipping and fulfillment for ecommerce. Easyship integrates with 300+ courier services worldwide, manages returns, and offers discounted rates — so you can scale shipping without the headaches.",
    "stripe":       "Accept payments online or in person. Stripe handles billing, subscriptions, invoicing, and fraud detection so you can focus on building.",
    "notion":       "One workspace for docs, databases, wikis, and project management. Replace five tools with one and keep your whole team aligned.",
    "hubspot":      "Free CRM to manage your leads, deals, and customer emails in one place. Scales from solo founder to full sales team without switching tools.",
    "mailchimp":    "Send beautiful email campaigns and automated sequences to grow your audience. The free plan covers up to 500 contacts — ideal for early-stage businesses.",
    "quickbooks":   "Track income, expenses, and taxes automatically. Connects to your bank accounts and generates P&L reports in seconds.",
    "mercury":      "Business banking built for startups. No fees, no minimums, and a clean dashboard that integrates with your accounting tools.",
    "canva":        "Design professional logos, social posts, pitch decks, and marketing materials — no design experience needed. Thousands of templates ready to go.",
    "webflow":      "Build fast, SEO-optimised websites visually without writing code. Includes CMS, hosting, and e-commerce out of the box.",
}

TOOL_DISPLAY_NAMES: Dict[str, str] = {
    "shopify": "Shopify",
    "smartli": "Smartli",
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
    "easyship": "Easyship",
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

    # Build final list — only include tools that have an affiliate link
    recommendations: List[RecommendedTool] = []
    for tool_key, reasons in tool_reasons.items():
        link = AFFILIATE_LINKS.get(tool_key, "")
        if not link:
            continue
        recommendations.append(RecommendedTool(
            tool_key=tool_key,
            tool_name=TOOL_DISPLAY_NAMES.get(tool_key, tool_key.title()),
            category=tool_categories.get(tool_key, "General"),
            reason=reasons[0],  # Primary reason
            description=TOOL_DESCRIPTIONS.get(tool_key, ""),
            affiliate_link=link,
            has_link=bool(link),
        ))

    return recommendations
