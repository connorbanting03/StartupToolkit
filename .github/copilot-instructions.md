# Raw to Ready — Workspace Instructions

You are developing **Raw to Ready**, a business planning platform with affiliate-driven recommendations. Read `PROJECT-CONTEXT.md` at the repo root for full technical context before making changes.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React, Aceternity UI
- **Backend:** FastAPI (Python 3.12), Supabase Python client, Pydantic
- **Database:** Supabase PostgreSQL with RLS — every table enforces user ownership
- **Auth:** Google OAuth via Supabase Auth — no email/password, no custom auth logic

## Commands

| Task | Command |
|------|---------|
| Start backend | `cd raw-to-ready && /Users/connorbanting/Documents/RawToReady/.venv/bin/python -m uvicorn backend.main:app --reload --port 8000` |
| Start frontend | `cd raw-to-ready/frontend && npm run dev` |
| Run migration | `cd raw-to-ready && npx supabase db push --linked` |
| Check types | `cd raw-to-ready/frontend && npx tsc --noEmit` |

## Architecture Rules

- Backend uses raw Supabase client queries — no ORM. Always use `get_supabase()` and `get_current_user_id()` from `backend/dependencies.py`.
- Use `.maybe_single()` instead of `.single()` for Supabase queries that might return no rows — `.single()` throws PGRST116 on empty results.
- Use `datetime.now(timezone.utc).isoformat()` for timestamps — never pass `"now()"` as a string literal to Supabase.
- Frontend auth: get token via `getAccessToken()` from `lib/supabase.ts`, send as `Authorization: Bearer <token>`.
- API client is in `frontend/lib/api.ts` — all backend calls go through `api.*` methods using `apiFetch()`.

## Database

- All tables have RLS enabled. When adding new tables or operations, always create corresponding RLS policies.
- Foreign keys use `ON DELETE CASCADE` from `tool_inputs` and `breadcrumbs` back to `projects`.
- New migrations go in `supabase/migrations/` with timestamp naming: `YYYYMMDDHHMMSS_description.sql`.

## Design System

- **Colors:** charcoal `#0a0a0a` (bg), cream `#f5f0e8` (headings), muted `#a09880` (body), amber `#d47c2f` (accent/CTAs)
- **Fonts:** Syne (display/headings), DM Sans (body)
- **Components:** Use Aceternity UI components from `frontend/components/ui/` — CardSpotlight, BackgroundBeams, FloatingNav, MovingBorder, AnimatedTooltip, Tabs
- **Dark theme only** — no light mode. All new UI must use the existing color tokens.

## Patterns

- Tool pages use `ToolLayout` wrapper from `components/tools/tool-layout.tsx` — it handles project selection, instance management, saving, and keyword feedback.
- Form fields use `FormField`, `SelectField`, `TextAreaField` from `components/tools/form-fields.tsx`.
- The recommendation engine is keyword-based, not AI. Keywords map to tools via `backend/data/keyword_tool_map.json`. To add recommendations, add mappings there — no code changes needed.
- Affiliate links live in `backend/config.py` as a flat dict. Empty string = no link available.

## Quality

- Validate backend changes by hitting endpoints with curl or testing in the running app.
- After frontend changes, check for TypeScript errors with `npx tsc --noEmit`.
- Never bypass RLS — all data access must go through the authenticated Supabase client.
- Handle loading and error states in frontend components.
