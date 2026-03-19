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
  o.chart_history,
  o.source_payload,
  o.inserted_at
from public.indicator_definitions d
left join lateral (
  select *
  from public.indicator_observations o
  where o.indicator_slug = d.slug
  order by o.observed_at desc, o.inserted_at desc
  limit 1
) o on true;
