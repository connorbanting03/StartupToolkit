# Raw to Ready — Technical Context

> This document describes the current state of the codebase for any agent or developer picking up the project.

---

## Architecture

```
Browser ──▶ Next.js 14 (App Router, :3000)
               │
               ▼
           FastAPI (:8000)
               │
               ▼
         Supabase PostgreSQL (hosted)
         + Supabase Auth (Google OAuth)
```

**Frontend:** Next.js 14 with App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React, Aceternity UI components.

**Backend:** FastAPI (Python 3.12) with the Supabase Python client. No ORM — raw Supabase client queries. Auth via JWT forwarding from the frontend.

**Database:** Supabase PostgreSQL with Row Level Security (RLS). All tables enforce user ownership through `auth.uid()` checks.

---

## Project Structure

```
raw-to-ready/
├── backend/
│   ├── main.py                          # FastAPI app, CORS, router includes
│   ├── config.py                        # Supabase creds, affiliate links dict
│   ├── dependencies.py                  # get_supabase(), get_current_user_id()
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py                      # GET /api/auth/me
│   │   ├── projects.py                  # CRUD /api/projects, enriched responses
│   │   ├── tools.py                     # Submit/get/delete tool instances
│   │   └── recommendations.py           # GET /api/recommendations/{project_id}
│   ├── services/
│   │   ├── keyword_extractor.py         # extract_keywords(input_data) → keywords, tools
│   │   └── recommendation_engine.py     # build_recommendations(breadcrumbs) → cards
│   ├── models/
│   │   ├── project.py                   # ProjectCreate, ProjectResponse
│   │   └── recommendation.py            # RecommendedTool, RecommendationResponse
│   └── data/
│       └── keyword_tool_map.json        # 14 keyword mappings → tool recommendations
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: Syne + DM Sans, AuthProvider, dark theme
│   │   ├── page.tsx                     # Homepage: hero, feature pills, CTAs
│   │   ├── (auth)/login/page.tsx        # Google OAuth sign-in
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Project list + tool grid (two tabs)
│   │   │   └── [projectId]/page.tsx     # Project detail: tool instance cards, reorder, delete
│   │   ├── tools/
│   │   │   ├── revenue-projector/       # Form + 12-month chart output
│   │   │   ├── unit-economics/          # Form + margin/LTV output
│   │   │   ├── pricing-calculator/      # Form + price range output
│   │   │   ├── supplier-matrix/         # Form + comparison table output
│   │   │   └── cash-flow/               # Form + cash flow chart output
│   │   └── recommendations/page.tsx     # Recommendation cards with affiliate links
│   ├── components/
│   │   ├── app-nav.tsx                  # Floating navbar (R→R logo, nav links, logout)
│   │   ├── auth-provider.tsx            # Supabase auth context + Google OAuth
│   │   ├── tools/
│   │   │   ├── tool-layout.tsx          # Shared tool page wrapper (project select, instances, save)
│   │   │   └── form-fields.tsx          # FormField, SelectField, TextAreaField
│   │   └── ui/                          # Aceternity components (6 files)
│   ├── lib/
│   │   ├── api.ts                       # API client: authHeaders, apiFetch, all endpoints
│   │   ├── supabase.ts                  # Supabase client + getAccessToken()
│   │   └── utils.ts                     # cn() utility
│   └── .env.local                       # SUPABASE_URL, SUPABASE_ANON_KEY, API_URL
│
├── schema.sql                           # Full database schema (reference)
└── supabase/
    └── migrations/
        ├── 20240101000000_init.sql                    # Tables + RLS policies
        ├── 20240102000000_tool_instances.sql           # Added label column
        └── 20240103000000_tool_inputs_delete_policy.sql # DELETE RLS policy
```

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `projects` | User projects (name, description, timestamps) |
| `tool_inputs` | Saved form data per tool instance (jsonb), supports multiple per tool via `label` |
| `breadcrumbs` | Keyword extraction results per tool submission |

### RLS Policies

All tables have RLS enabled. Policies enforce:
- **projects:** SELECT/INSERT/UPDATE where `auth.uid() = user_id`
- **tool_inputs:** SELECT/INSERT/UPDATE/DELETE where project belongs to user
- **breadcrumbs:** SELECT/INSERT where project belongs to user

### Key Relationships

```
auth.users (Supabase managed)
  └── projects (user_id → auth.users.id)
        ├── tool_inputs (project_id → projects.id, ON DELETE CASCADE)
        └── breadcrumbs (project_id → projects.id, ON DELETE CASCADE)
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/me` | Current user info |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects (enriched with tool counts/breadcrumbs) |
| GET | `/api/projects/{id}` | Project detail with all tool instances + breadcrumbs |
| POST | `/api/tools/{tool_name}/submit` | Submit tool form → save + extract keywords + create breadcrumb |
| GET | `/api/tools/{tool_name}/{project_id}` | Get all instances of a tool for a project |
| DELETE | `/api/tools/{tool_name}/{instance_id}` | Delete a tool instance |
| GET | `/api/recommendations/{project_id}` | Get recommendations from breadcrumbs |

---

## Supabase Configuration

- **Project ref:** `bmqxahnbwpbagonhnnqa`
- **URL:** `https://bmqxahnbwpbagonhnnqa.supabase.co`
- **Auth:** Google OAuth enabled (client ID: `196931321915-dupl64ipq349t9cmk4t91qja84mhl1h6`)
- **Redirect URIs:** `http://localhost:3000`, `https://rawtoready.co`

---

## Running the Project

### Backend
```bash
cd raw-to-ready
source /Users/connorbanting/Documents/RawToReady/.venv/bin/activate
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd raw-to-ready/frontend
npm run dev
```

### Python venv
The virtualenv lives at `/Users/connorbanting/Documents/RawToReady/.venv/` (Python 3.12.9). Always use this when running backend commands.

---

## Key Patterns

### Auth Flow
Frontend gets Supabase access token → sends as `Authorization: Bearer <token>` → backend's `get_supabase()` creates a scoped Supabase client for RLS → `get_current_user_id()` extracts user ID from JWT.

### Tool Submission Flow
1. Frontend sends POST to `/api/tools/{tool_name}/submit` with `{ project_id, input_data, label? }`
2. Backend inserts/updates `tool_inputs` record
3. `keyword_extractor.extract_keywords(input_data)` matches against `keyword_tool_map.json`
4. Creates `breadcrumbs` record with matched keywords + recommended tools
5. Returns match results to frontend for immediate feedback

### Multiple Instances
Each tool supports multiple instances per project. The `label` field differentiates them (e.g., "Lumber supplier", "Fabric supplier"). The project detail dashboard renders each instance as its own card.

### State Management
- No global state library — React state + `useEffect` fetching
- Layout persistence via `localStorage` (card order, visibility)
- Auth state via React Context (`AuthProvider`)

---

## Known Issues

1. **Delete bug:** Tool instances reappear after deletion. The item is visually removed but shows back up. Likely cause: frontend optimistic removal followed by a data refetch, or the backend DELETE not persisting due to RLS or ID mismatch. The DELETE RLS policy was added in migration `20240103` — verify it was applied.

2. **tool-layout.tsx deep linking incomplete:** `useSearchParams` was imported but the `useEffect` to auto-select project/instance from `?project=X&instance=Y` query params was never implemented.

3. **No project DELETE:** There is no endpoint or UI to delete projects. `projects` table has no DELETE RLS policy.

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `charcoal` | `#0a0a0a` | Background |
| `cream` | `#f5f0e8` | Heading text |
| `muted` | `#a09880` | Body text |
| `amber` | `#d47c2f` | Accent, CTAs, active states |
| `font-display` | Syne | Headings, hero text |
| `font-body` | DM Sans | Body text, form labels |

---

## Dependencies

### Backend (Python)
fastapi, uvicorn, supabase (2.28.3+), pydantic, python-dotenv

### Frontend (Node)
next 14.2, react 18, @supabase/supabase-js 2.99, framer-motion 12.38, recharts 3.8, lucide-react 0.577, tailwindcss 3.4, clsx, tailwind-merge
