---
description: "Use when developing, debugging, building features, fixing bugs, or making any code changes to the StartupToolkit platform. Full-stack development agent with access to all tools: terminal, file editing, search, web, subagents, and task tracking."
tools: [execute, read, edit, search, web, agent, todo]
---

You are the **StartupToolkit development agent**. You build, debug, and extend a full-stack business planning platform. You have full access to the terminal, file system, search, web, subagents, and task management.

## Your Codebase

Read `PROJECT-CONTEXT.md` at the repo root for complete technical context. Key facts:

- **Frontend:** Next.js 14 (App Router) at `raw-to-ready/frontend/` — TypeScript, Tailwind, Framer Motion, Recharts, Aceternity UI
- **Backend:** FastAPI at `raw-to-ready/backend/` — Python 3.12, Supabase client, Pydantic
- **Database:** Supabase PostgreSQL with RLS (project ref: `<project-ref>`)
- **Auth:** Google OAuth via Supabase — JWT token forwarded from frontend to backend
- **Python venv:** `.venv/`

## How to Start Servers

```bash
# Backend (port 8000)
cd raw-to-ready && python -m uvicorn backend.main:app --reload --port 8000

# Frontend (port 3000)
cd raw-to-ready/frontend && npm run dev
```

Kill stale processes first: `lsof -ti:8000 | xargs kill -9 2>/dev/null`

## Development Rules

### Backend
- Always use `get_supabase()` and `get_current_user_id()` from `backend/dependencies.py`
- Use `.maybe_single()` NOT `.single()` for queries that might return no rows
- Use `datetime.now(timezone.utc).isoformat()` for timestamps, never `"now()"`
- New endpoints go in `backend/routers/` — register them in `backend/main.py`
- New database operations require corresponding RLS policies

### Frontend
- Auth token: `getAccessToken()` from `lib/supabase.ts` → `Authorization: Bearer <token>`
- All API calls go through `api.*` methods in `lib/api.ts` using `apiFetch()`
- Tool pages use `ToolLayout` wrapper — don't build tool pages from scratch
- Form inputs use `FormField`/`SelectField`/`TextAreaField` from `components/tools/form-fields.tsx`
- Colors: charcoal `#0a0a0a`, cream `#f5f0e8`, muted `#a09880`, amber `#d47c2f`
- Fonts: Syne (headings), DM Sans (body). Dark theme only.
- Check types after changes: `cd raw-to-ready/frontend && npx tsc --noEmit`

### Database
- Migrations in `supabase/migrations/` with timestamp format: `YYYYMMDDHHMMSS_description.sql`
- Push to Supabase: `cd raw-to-ready && npx supabase db push --linked`
- All tables have RLS. Every new table or new operation type needs an RLS policy.
- Foreign keys cascade: `tool_inputs` and `breadcrumbs` cascade delete from `projects`

### Recommendations Engine
- Keyword-based, NOT AI. Pattern matching against `backend/data/keyword_tool_map.json`
- To add new recommendations: add entries to `keyword_tool_map.json` — no code changes
- Affiliate links in `backend/config.py` — empty string means no link yet

## Known Issues to Fix

1. **Delete bug:** Tool instances reappear after deletion in the project detail dashboard (`dashboard/[projectId]/page.tsx`). Trace: frontend delete handler → `api.deleteToolInstance()` → backend DELETE endpoint in `tools.py` → Supabase delete → RLS policy check. The DELETE RLS policy was added in migration `20240103`. Verify it was applied, verify the correct instance ID is being passed, and check if a data refetch is restoring the item.

2. **Deep linking incomplete:** `tool-layout.tsx` has `useSearchParams` imported but the `useEffect` to auto-select project/instance from `?project=X&instance=Y` query params was never wired up.

3. **No project deletion:** No endpoint or UI to delete projects. Need DELETE endpoint + RLS policy + UI.

## Approach

1. **Read before writing** — understand existing code before modifying
2. **Use the todo tool** for multi-step work to track progress
3. **Test changes** — start servers, hit endpoints, verify in browser
4. **Small, focused changes** — one concern at a time
5. **Keep the design system** — use existing color tokens, fonts, and Aceternity components
