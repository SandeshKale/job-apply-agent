-- job-apply-agent persistence tables.
-- Prefixed with job_apply_ because this Supabase project is shared with other apps.

create table if not exists job_apply_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists job_apply_applied (
  id text primary key,
  platform text not null,
  title text not null,
  company text not null,
  url text not null,
  "timestamp" timestamptz not null,
  status text not null,
  reason text,
  score numeric
);

create index if not exists job_apply_applied_timestamp_idx
  on job_apply_applied ("timestamp" desc);

create table if not exists job_apply_run_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS enabled with no policies: only the service_role key (used server-side by
-- the Next.js API routes) can read/write, since service_role bypasses RLS.
-- The anon/public key has no access.
alter table job_apply_config enable row level security;
alter table job_apply_applied enable row level security;
alter table job_apply_run_state enable row level security;
