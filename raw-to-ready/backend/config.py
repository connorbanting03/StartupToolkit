import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# STARTUPTOOLKIT — AFFILIATE LINKS CONFIGURATION
# Defaults live here. Any link can be overridden per-deployment with an
# environment variable named AFFILIATE_<KEY>, e.g. AFFILIATE_SHOPIFY=https://...
# Leave a link empty to hide that tool from recommendations.
# ============================================================

_DEFAULT_AFFILIATE_LINKS = {

    # E-COMMERCE & SALES
    "shopify":          "https://shopify.pxf.io/m4OXk1",
    "smartli":          "https://smartli.partnerlinks.io/xlrh66cre7hl",
    "square":           "",
    "stripe":           "",
    "gumroad":          "",

    # PRODUCTIVITY & PROJECT MANAGEMENT
    "notion":           "",
    "asana":            "",
    "monday":           "",
    "clickup":          "",
    "linear":           "",

    # EMAIL & MARKETING
    "mailchimp":        "",
    "convertkit":       "",
    "klaviyo":          "",
    "hubspot":          "",

    # DESIGN & CREATIVE
    "canva":            "",
    "figma":            "",
    "adobe":            "",
    "webflow":          "",

    # ACCOUNTING & FINANCE
    "freshbooks":       "",
    "xero":             "",
    "wave":             "",
    "quickbooks":       "",

    # CRM & SALES
    "pipedrive":        "",
    "salesforce":       "",

    # HOSTING & WEB
    "railway":          "https://railway.com?referralCode=3YaO6j",
    "bluehost":         "",
    "ghost":            "",
    "framer":           "",

    # SUPPLY CHAIN & INVENTORY
    "faire":            "",
    "tradegecko":       "",
    "shipstation":      "",
    "easyship":         "https://easyship.ilbqy6.net/0GGO1J",

    # ANALYTICS & SEO
    "semrush":          "",
    "ahrefs":           "",

    # FUNDRAISING & LEGAL
    "carta":            "",
    "angellist":        "",
    "docsend":          "",
    "clerky":           "",
    "stripe_atlas":     "",
    "statista":         "",

    # BANKING
    "mercury":          "",
    "brex":             "",

}


AFFILIATE_LINKS = {
    key: os.environ.get(f"AFFILIATE_{key.upper()}", default).strip()
    for key, default in _DEFAULT_AFFILIATE_LINKS.items()
}

# ============================================================
# SUPABASE CONFIG
# Set SUPABASE_URL and SUPABASE_KEY as environment variables (Railway, .env, ...)
# ============================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# ============================================================
# APP CONFIG
# ============================================================
APP_NAME = os.environ.get("APP_NAME", "StartupToolkit")
APP_ENV = os.environ.get("APP_ENV", "production")  # "development" | "production"

# ============================================================
# AI AUTO-FILL (optional)
# With ANTHROPIC_API_KEY set, tool pages get a one-click "Auto-fill" button that
# runs the same prompt server-side. Without it, the copy / paste flow still works.
# ============================================================
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5")
AI_DAILY_LIMIT = int(os.environ.get("AI_DAILY_LIMIT", "20"))  # requests per user per UTC day
