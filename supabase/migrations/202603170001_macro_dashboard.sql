create table if not exists public.indicator_definitions (
  slug text primary key,
  name text not null,
  short_name text not null,
  module text not null,
  dimension text not null,
  unit text not null,
  frequency text not null,
  source_name text not null,
  source_url text,
  source_access text not null check (source_access in ('official-free', 'licensed-manual')),
  tooltips jsonb not null,
  regime_tag text not null,
  summary text not null,
  advanced_summary text not null,
  watch_list jsonb not null default '[]'::jsonb,
  signal_score numeric not null default 0,
  tone text not null,
  overlays jsonb,
  release_cadence text not null,
  search_terms jsonb not null default '[]'::jsonb,
  provider_type text not null,
  provider_series_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.indicator_observations (
  id bigint generated always as identity primary key,
  indicator_slug text not null references public.indicator_definitions(slug) on delete cascade,
  observed_at date not null,
  current_value numeric not null,
  prior_value numeric,
  change_value numeric,
  chart_history jsonb,
  source_payload jsonb,
  inserted_at timestamptz not null default now(),
  unique (indicator_slug, observed_at)
);

create table if not exists public.calendar_events (
  id text primary key,
  module text not null,
  title text not null,
  category text not null,
  event_date date not null,
  time_label text not null,
  importance text not null,
  why_it_matters text not null,
  what_to_watch text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.refresh_runs (
  id bigint generated always as identity primary key,
  scope text not null,
  refreshed_count integer not null default 0,
  skipped_count integer not null default 0,
  status text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace view public.indicator_latest as
select
  d.slug,
  d.name,
  d.short_name,
  d.module,
  d.dimension,
  d.unit,
  d.frequency,
  d.source_name,
  d.source_url,
  d.source_access,
  d.tooltips,
  d.regime_tag,
  d.summary,
  d.advanced_summary,
  d.watch_list,
  d.signal_score,
  d.tone,
  d.overlays,
  d.release_cadence,
  d.search_terms,
  d.provider_type,
  d.provider_series_id,
  o.observed_at,
  o.current_value,
  o.prior_value,
  o.change_value,
  o.chart_history
from public.indicator_definitions d
left join lateral (
  select *
  from public.indicator_observations o
  where o.indicator_slug = d.slug
  order by o.observed_at desc
  limit 1
) o on true;

create index if not exists indicator_observations_slug_date_idx
  on public.indicator_observations (indicator_slug, observed_at desc);
