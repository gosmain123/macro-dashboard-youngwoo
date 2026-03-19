create table if not exists public.indicator_sync_status (
  slug text primary key references public.indicator_definitions(slug) on delete cascade,
  module text not null,
  provider_type text not null,
  source_name text not null,
  source_url text,
  status text not null check (status in ('live', 'stale-live', 'fallback', 'error')),
  last_attempted_fetch timestamptz,
  last_successful_fetch timestamptz,
  last_failed_fetch timestamptz,
  last_duration_ms integer,
  last_items_fetched integer,
  last_parse_status text,
  last_error text,
  fallback_usage_reason text,
  consecutive_failures integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.indicator_fetch_logs (
  id bigint generated always as identity primary key,
  indicator_slug text not null references public.indicator_definitions(slug) on delete cascade,
  module text not null,
  provider_type text not null,
  source_name text not null,
  source_url text,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_ms integer not null,
  success boolean not null,
  items_fetched integer,
  parse_status text,
  attempt_count integer not null default 1,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists indicator_sync_status_module_idx
  on public.indicator_sync_status (module, status);

create index if not exists indicator_fetch_logs_slug_started_idx
  on public.indicator_fetch_logs (indicator_slug, started_at desc);
