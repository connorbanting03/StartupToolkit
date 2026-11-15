# StartupToolkit — Product Vision

> *"From raw idea to ready to launch."*

**Domain:** configured per deployment

---

## What It Is

StartupToolkit is a platform for founders, solopreneurs, and small business owners to plan their businesses using real, functional tools — not templates, not AI-generated advice. Users fill out financial calculators, supplier matrices, pricing tools, and cash flow forecasts with their own numbers. As they work, the platform silently extracts keywords from their inputs and surfaces relevant third-party tool recommendations via affiliate links.

The core insight: people reveal what they need by describing what they're building. StartupToolkit captures those signals and turns them into monetizable recommendations — no AI, just pattern matching against a keyword-to-tool mapping database.

---

## How It Works

1. User signs in with Google (no email/password, no account setup friction)
2. Creates a project (e.g., "Lumber Business", "SaaS Idea")
3. Fills out business tools — each one produces real outputs (charts, margins, comparisons)
4. Every form submission triggers the **breadcrumb engine**: keywords extracted → matched against `keyword_tool_map.json` → recommendations generated
5. Recommendations page shows affiliate-linked tools with contextual reasons ("You mentioned 'supplier sourcing' in your Supplier Matrix")

---

## The 5 Business Tools

| Tool | What It Does | Key Outputs |
|------|-------------|-------------|
| **Revenue Projector** | Monthly/annual revenue modeling with growth rates | Revenue chart, break-even month, annual projection |
| **Unit Economics Calculator** | COGS, margins, LTV analysis | Gross margin %, contribution margin, LTV estimate |
| **Pricing Strategy** | Competitor analysis + pricing model selection | Recommended price range, margin at each price point |
| **Supplier Comparison Matrix** | Side-by-side supplier evaluation (up to 4) | Comparison table with recommended supplier |
| **Cash Flow Forecast** | 12-month cash position modeling | Cash flow chart, runway months, first profitable month |

Each tool supports **multiple instances** per project — users can model different scenarios, compare suppliers, or project multiple products.

---

## Monetization

Affiliate links in `backend/config.py` — 29 tool slots across 11 categories (e-commerce, productivity, email marketing, design, accounting, CRM, hosting, supply chain, analytics). Recommendations are earned, not shown as ads — users see them because their own inputs surfaced the need.

---

## Design Language

- **Background:** Deep charcoal `#0a0a0a`
- **Text:** Warm cream `#f5f0e8` (headings), muted `#a09880` (body)
- **Accent:** Burnt amber `#d47c2f` (CTAs, highlights, active states)
- **Fonts:** Syne (display) + DM Sans (body)
- **Motif:** Raw → Ready — rough/unfinished on empty states, clean/polished once completed
- **UI Components:** Aceternity UI (CardSpotlight, BackgroundBeams, FloatingNav, MovingBorder, AnimatedTooltip, Tabs)

---

## Project Dashboard Vision

The dashboard is where users live. Each project is clickable and opens into a detail view showing:

- Only tool instances the user has actually filled out (no empty placeholders)
- Drag-to-reorder cards (Framer Motion Reorder)
- Show/hide toggles per card with layout persistence (localStorage)
- Inline data visualization on each card (charts, metrics, tables)
- Three-dot dropdown menu on each card: Edit (navigates to tool) or Delete (with confirmation)
- Real-time keyword match feedback on form submission

---

## Roadmap

### Current (MVP — In Progress)
- [x] Full backend API (FastAPI) with CRUD for projects, tools, recommendations
- [x] 5 business tools with form inputs and calculated outputs
- [x] Breadcrumb extraction engine (keyword matching)
- [x] Recommendation engine with affiliate link integration
- [x] Google OAuth (Supabase Auth)
- [x] Project dashboard with clickable project cards
- [x] Project detail view with tool instance cards
- [x] Multiple instances per tool per project
- [x] Inline delete with dropdown menus
- [ ] Delete bug fix (items reappearing after deletion)
- [ ] Tool page deep linking (`?project=X&instance=Y` auto-select)
- [ ] First-login onboarding ("What are you building?" prompt)
- [ ] Polish: microinteractions, recommendation unlock animation

### Phase 2 — Integrations
- OAuth tool connections (Shopify, Notion) — live status when tools are set up

### Phase 3 — Affiliate Tracking
- Postback webhooks from Impact.com — auto-confirm conversions

### Phase 4 — Premium
- Subscription tier: unlimited projects, PDF export, advanced recommendations, priority support

### Phase 5 — AI Layer
- AI-powered insights — premium subscribers only, implementation TBD