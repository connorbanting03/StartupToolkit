# StartupToolkit

**From raw idea to ready to launch.**

StartupToolkit is a planning workspace for founders and small-business owners. Instead of templates
or generic advice, you fill in real tools with your own numbers (financial models, supplier
matrices, pricing calculators) and the platform quietly surfaces software that fits what you're
building, through affiliate-linked recommendations.

## What it does

- **15 working business tools**: revenue projector, cash flow, break-even, unit economics, P&L,
  expense tracker, scenario planner, pricing strategy, market sizing, competitor scorecard,
  supplier matrix, fundraising, launch checklist, business model canvas and acquisition planner.
  Each produces real outputs (charts, margins, comparisons) from the numbers you enter.
- **Projects**: group tool runs per business idea, reorder them and come back later.
- **Breadcrumb engine**: every submission is scanned for keywords and matched against a
  keyword → tool map to build contextual recommendations ("You mentioned *supplier sourcing* in
  your Supplier Matrix"). Plain pattern matching, no model in the loop.
- **Auto-fill with Claude**: seven tools can pre-fill their fields from a short description.
  By default it's a copy-prompt / paste-response flow that needs no API key. Set
  `ANTHROPIC_API_KEY` and it becomes one click, run server-side.
- **Google sign-in** via Supabase Auth, with Row Level Security on every table.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | FastAPI (Python 3.12), Pydantic, Supabase client |
| Data & auth | Supabase PostgreSQL + Google OAuth, RLS policies |
| AI (optional) | Anthropic API for one-click auto-fill |
| Deploy | Docker, Railway |

```
Browser ──▶ Next.js (:3000) ──▶ FastAPI (:8000) ──▶ Supabase (Postgres + Auth)
                                     └──▶ Anthropic API (optional)
```

## Getting started

The app lives in [`raw-to-ready/`](raw-to-ready/) (folder name kept so existing deploy settings keep working).

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: run `raw-to-ready/schema.sql` in the SQL editor (or `npx supabase db push --linked`).
3. Enable Google in **Authentication → Providers**.
4. Copy the project URL and anon key.

### 2. Backend

```bash
cd raw-to-ready
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env          # fill in SUPABASE_URL and SUPABASE_KEY
APP_ENV=development uvicorn backend.main:app --reload
```

API docs at http://localhost:8000/api/docs in development mode.

### 3. Frontend

```bash
cd raw-to-ready/frontend
cp .env.example .env.local    # Supabase URL + anon key, NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open http://localhost:3000.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | backend | Database and auth (required) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | Browser auth client (required) |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL |
| `ALLOWED_ORIGINS` | backend | Extra CORS origins, comma-separated |
| `ANTHROPIC_API_KEY` | backend | Enables one-click auto-fill (optional) |
| `ANTHROPIC_MODEL` | backend | Model for auto-fill, default `claude-haiku-5-5` |
| `AI_DAILY_LIMIT` | backend | Auto-fill calls per user per day, default 20 |
| `AFFILIATE_<TOOL>` | backend | Override a tool's affiliate link, e.g. `AFFILIATE_SHOPIFY` |

Auto-fill requires a signed-in user, is rate limited per user, and fails closed (the button
simply doesn't appear) when no key is configured.

## Tests

```bash
cd raw-to-ready
pip install pytest httpx
SUPABASE_URL=https://x.supabase.co SUPABASE_KEY=dummy python -m pytest tests
cd frontend && npx tsc --noEmit
```

## More docs

- [`docs/product-vision.md`](docs/product-vision.md): what the product is and why
- [`raw-to-ready/PROJECT-CONTEXT.md`](raw-to-ready/PROJECT-CONTEXT.md): technical walkthrough of the codebase
