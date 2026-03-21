# Raw to Ready

**From raw idea to ready to launch.**

A platform where founders, solopreneurs, and small business owners use functional business tools and get matched with the right software through keyword-driven recommendations.

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `schema.sql` in the Supabase SQL Editor
3. Enable Google OAuth in Authentication → Providers → Google
4. Copy your project URL and anon key

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Edit `config.py`:
- Add your `SUPABASE_URL` and `SUPABASE_KEY`
- Add affiliate links as you acquire them

```bash
uvicorn backend.main:app --reload
```

API docs available at http://localhost:8000/api/docs

### 3. Frontend

```bash
cd frontend
npm install
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open http://localhost:3000

## Architecture

```
frontend/     → Next.js 14 (App Router) + Tailwind + Framer Motion
backend/      → FastAPI + Supabase client
schema.sql    → Supabase PostgreSQL schema with RLS policies
```

### Tools (5 modules)
- **Revenue Projector** — monthly/annual projections with growth modeling
- **Unit Economics Calculator** — margins, LTV, cost breakdown
- **Pricing Strategy Tool** — competitor analysis, price point margins
- **Supplier Comparison Matrix** — side-by-side supplier comparison
- **Cash Flow Forecast** — 12-month cash flow, runway, profitability

### How Recommendations Work
1. User fills out a business tool form
2. Backend extracts keywords from all text inputs
3. Keywords are matched against `keyword_tool_map.json`
4. Matched tools become recommendations with affiliate CTAs
5. No AI — just pattern matching against a curated keyword database

### Adding New Keywords
Edit `backend/data/keyword_tool_map.json` — no code changes needed.

## Tech Stack
- Next.js 14, Tailwind CSS, Framer Motion
- FastAPI, Supabase (PostgreSQL + Auth)
- Google OAuth only
- Fonts: Syne (display) + DM Sans (body)
- Theme: Dark charcoal (#0a0a0a) + cream (#f5f0e8) + burnt amber (#d47c2f)
