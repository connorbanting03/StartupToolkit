# ============================================================
# RAW TO READY — AFFILIATE LINKS CONFIGURATION
# Paste your affiliate links below. Leave empty if not yet set.
# ============================================================

AFFILIATE_LINKS = {

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

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# SUPABASE CONFIG
# Set SUPABASE_URL and SUPABASE_KEY as Railway environment variables
# ============================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# ============================================================
# APP CONFIG
# ============================================================
APP_NAME = os.environ.get("APP_NAME", "Startup Blueprint Kit")
APP_ENV = os.environ.get("APP_ENV", "production")  # "development" | "production"
