import { macroIndicators } from "@/lib/data";
import { fetchFredObservations, type FredObservation } from "@/lib/server/providers/fred";
import { seriesConfigBySlug, type SeriesConfig } from "@/lib/server/series-config";
import { createSupabaseAdminClient, hasSupabaseEnv } from "@/lib/server/supabase";
import type { MacroIndicator, RefreshResult, RefreshScope } from "@/types/macro";

type ChartPoint = {
  date: string;
  value: number;
};

function isInScope(indicator: MacroIndicator, scope: RefreshScope) {
  if (scope === "all") {
    return true;
  }

  if (scope === "market") {
    return ["rates-credit", "market-internals", "policy-liquidity", "flows-positioning", "global"].includes(
      indicator.module
    );
  }

  return ["inflation", "growth", "labor", "policy-liquidity", "global"].includes(indicator.module);
}

function round(value: number) {
  return Number(value.toFixed(4));
}

function transformObservation(
  observations: FredObservation[],
  index: number,
  config: SeriesConfig
) {
  const scale = config.scale ?? 1;
  const current = observations[index];

  if (!current) {
    return null;
  }

  if (config.transform === "level") {
    return {
      date: current.date,
      value: round(current.value * scale)
    };
  }

  if (config.transform === "yoy") {
    const prior = observations[index - 12];

    if (!prior || prior.value === 0) {
      return null;
    }

    return {
      date: current.date,
      value: round((((current.value / prior.value) - 1) * 100) * scale)
    };
  }

  if (config.transform === "mom_pct") {
    const prior = observations[index - 1];

    if (!prior || prior.value === 0) {
      return null;
    }

    return {
      date: current.date,
      value: round((((current.value / prior.value) - 1) * 100) * scale)
    };
  }

  const prior = observations[index - 1];

  if (!prior) {
    return null;
  }

  return {
    date: current.date,
    value: round((current.value - prior.value) * scale)
  };
}

function buildSeries(observations: FredObservation[], config: SeriesConfig): ChartPoint[] {
  return observations
    .map((_, index) => transformObservation(observations, index, config))
    .filter((point): point is ChartPoint => point !== null);
}

export async function refreshIndicators(scope: RefreshScope = "all"): Promise<RefreshResult> {
  const startedAt = new Date().toISOString();
  const eligible = macroIndicators.filter((indicator) => {
    const config = seriesConfigBySlug[indicator.slug];
    return Boolean(config) && isInScope(indicator, scope);
  });
  const skipped = macroIndicators
    .filter((indicator) => !eligible.some((candidate) => candidate.slug === indicator.slug) && isInScope(indicator, scope))
    .map((indicator) => indicator.slug);

  if (!hasSupabaseEnv() || !process.env.FRED_API_KEY) {
    return {
      scope,
      startedAt,
      completedAt: new Date().toISOString(),
      dataMode: "demo",
      refreshed: [],
      skipped
    };
  }

  const supabase = createSupabaseAdminClient();
  const refreshed: string[] = [];
  const uniqueSeriesIds = [
    ...new Set(eligible.map((indicator) => seriesConfigBySlug[indicator.slug]?.seriesId).filter(Boolean))
  ] as string[];
  const rawSeriesEntries = await Promise.all(
    uniqueSeriesIds.map(async (seriesId) => {
      const limit = Math.max(
        ...eligible
          .filter((indicator) => seriesConfigBySlug[indicator.slug]?.seriesId === seriesId)
          .map((indicator) => seriesConfigBySlug[indicator.slug]?.limit ?? 48)
      );

      return [seriesId, await fetchFredObservations(seriesId, limit)] as const;
    })
  );
  const rawSeriesMap = Object.fromEntries(rawSeriesEntries);

  for (const indicator of eligible) {
    const config = seriesConfigBySlug[indicator.slug];

    if (!config) {
      continue;
    }

    const transformed = buildSeries(rawSeriesMap[config.seriesId] ?? [], config);

    if (transformed.length < 2) {
      skipped.push(indicator.slug);
      continue;
    }

    const current = transformed.at(-1);
    const prior = transformed.at(-2);

    if (!current || !prior) {
      skipped.push(indicator.slug);
      continue;
    }

    await supabase.from("indicator_definitions").upsert(
      {
        slug: indicator.slug,
        name: indicator.name,
        short_name: indicator.shortName,
        module: indicator.module,
        dimension: indicator.dimension,
        unit: indicator.unit,
        frequency: indicator.frequency,
        source_name: indicator.source.name,
        source_url: indicator.source.url ?? null,
        source_access: indicator.source.access,
        tooltips: indicator.tooltips,
        regime_tag: indicator.regimeTag,
        summary: indicator.summary,
        advanced_summary: indicator.advancedSummary,
        watch_list: indicator.watchList,
        signal_score: indicator.signalScore,
        tone: indicator.tone,
        overlays: indicator.overlays ?? [],
        release_cadence: indicator.releaseCadence,
        search_terms: indicator.searchTerms,
        provider_type: indicator.provider.type,
        provider_series_id: indicator.provider.seriesId ?? null
      },
      { onConflict: "slug" }
    );

    await supabase.from("indicator_observations").upsert(
      {
        indicator_slug: indicator.slug,
        observed_at: current.date,
        current_value: current.value,
        prior_value: prior.value,
        change_value: round(current.value - prior.value),
        chart_history: transformed.slice(-24)
      },
      { onConflict: "indicator_slug,observed_at" }
    );

    refreshed.push(indicator.slug);
  }

  const uniqueSkipped = [...new Set(skipped)];

  await supabase.from("refresh_runs").insert({
    scope,
    refreshed_count: refreshed.length,
    skipped_count: uniqueSkipped.length,
    status: "completed",
    payload: {
      refreshed,
      skipped: uniqueSkipped
    }
  });

  return {
    scope,
    startedAt,
    completedAt: new Date().toISOString(),
    dataMode: "live",
    refreshed,
    skipped: uniqueSkipped
  };
}
