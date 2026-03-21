import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


_map_path = Path(__file__).resolve().parent.parent / "data" / "keyword_tool_map.json"
_keyword_map: Dict | None = None


def _load_map() -> Dict:
    global _keyword_map
    if _keyword_map is None:
        with open(_map_path, "r") as f:
            _keyword_map = json.load(f)
    return _keyword_map


def extract_keywords(input_data: dict) -> Tuple[List[str], List[str], List[dict]]:
    """
    Given a dict of form field values, extract matching keywords
    and return (matched_keywords, recommended_tool_keys, matched_mappings).
    """
    mapping_data = _load_map()
    text_blob = " ".join(
        str(v) for v in input_data.values() if isinstance(v, (str, int, float))
    ).lower()

    # Also flatten nested dicts/lists (e.g. supplier entries)
    def flatten_values(obj):
        parts = []
        if isinstance(obj, dict):
            for v in obj.values():
                parts.extend(flatten_values(v))
        elif isinstance(obj, list):
            for item in obj:
                parts.extend(flatten_values(item))
        elif isinstance(obj, (str, int, float)):
            parts.append(str(obj).lower())
        return parts

    text_blob = " ".join(flatten_values(input_data))

    # Strip punctuation for matching
    cleaned = re.sub(r"[^\w\s]", " ", text_blob)

    matched_keywords: List[str] = []
    recommended_tools: set = set()
    matched_mappings: List[dict] = []

    for mapping in mapping_data.get("mappings", []):
        for keyword in mapping["keywords"]:
            kw_lower = keyword.lower()
            if kw_lower in cleaned:
                matched_keywords.append(keyword)
                recommended_tools.update(mapping["tools"])
                matched_mappings.append({
                    "mapping_id": mapping["id"],
                    "keyword": keyword,
                    "tools": mapping["tools"],
                    "category": mapping["category"],
                })
                break  # Only need one keyword match per mapping

    return (
        list(set(matched_keywords)),
        list(recommended_tools),
        matched_mappings,
    )
