-- Raw to Ready — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  description text,
  created_at timestamp default now()
);

-- Breadcrumbs (keyword hits per project)
create table breadcrumbs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  source_tool text,
  raw_input text,
  matched_keywords text[],
  recommended_tools text[],
  created_at timestamp default now()
);

-- Tool Inputs (saved form data)
create table tool_inputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  tool_name text,
  input_data jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Row Level Security
alter table projects enable row level security;
alter table breadcrumbs enable row level security;
alter table tool_inputs enable row level security;

-- Projects: users can only access their own
create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

-- Breadcrumbs: access through project ownership
create policy "Users can view own breadcrumbs"
  on breadcrumbs for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can insert own breadcrumbs"
  on breadcrumbs for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Tool Inputs: access through project ownership
create policy "Users can view own tool inputs"
  on tool_inputs for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can insert own tool inputs"
  on tool_inputs for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );
create policy "Users can update own tool inputs"
  on tool_inputs for update using (
    project_id in (select id from projects where user_id = auth.uid())
  );
