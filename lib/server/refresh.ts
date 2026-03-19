import { subDays, subMonths, subQuarters, subWeeks } from "date-fns";

import { getChartHistoryPointTarget, getRequiredObservationLimit } from "@/lib/chart-frequency";
import { macroIndicators } from "@/lib/data";
import { getIndicatorRelease } from "@/lib/release-metadata";
import { fetchBeaIndicator } from "@/lib/server/providers/bea";
import { fetchBlsIndicator } from "@/lib/server/providers/bls";
import { fetchCensusIndicator } from "@/lib/server/providers/census";
import { fetchDolIndicator } from "@/lib/server/providers/dol";
import { fetchFedIndicator } from "@/lib/server/providers/fed";
import { fetchFredObservations, type FredObservation } from "@/lib/server/providers/fred";
import { fetchIsmIndicator } from "@/lib/server/providers/ism";
import { fetchTreasuryIndicator } from "@/lib/server/providers/treasury";
import { type ProviderObservation } from "@/lib/server/providers/shared";
import { withRetry } from "@/lib/server/retry";
import {
  getIndicatorSourceContract,
  type IndicatorSourceContract,
  type IndicatorSourceEndpointContract
} from "@/lib/server/source-contract";
import { createSupabaseAdminClient, hasSupabaseWriteEnv } from "@/lib/server/supabase";
import { seriesConfigBySlug, type SeriesConfig } from "@/lib/server/series-config";
import type { ChartPoint, Frequency, MacroIndicator, ProviderType, RefreshResult, RefreshScope } from "@/types/macro";

type ExistingLatestRow = {
  slug: string;
  observed_at: string | null;
  current_value: number | null;
  prior_value: number | null;
  source_payload: Record<string, unknown> | null;
  inserted_at: string | null;
};

type ExistingSyncStatusRow = {
  slug: string;
  last_successful_fetch: string | null;
  last_failed_fetch: string | null;
  consecutive_failures: number | null;
};

type FetchOutcome = {
  observedAt: string;
  currentValue: number;
  priorValue: number;
  sourceName: string;
  sourceUrl?: string;
  chartHistory?: ChartPoint[];
  itemsFetched: number;
  parseStatus: string;
};

type ResolvedFetchOutcome = {
  outcome: FetchOutcome;
  providerType: ProviderType;
  sourceContract: IndicatorSourceContract;
  sourceEndpoint: IndicatorSourceEndpointContract;
};

type ObservationWriteRow = {
  indicator_slug: string;
  observed_at: string;
  current_value: number;
  prior_value: number;
  change_value: number;
  chart_history: ChartPoint[] | null;
  source_payload: Record<string, unknown>;
};

type SyncStatusWriteRow = {
  slug: string;
  module: string;
  provider_type: string;
  source_name: string;
  source_url: string | null;
  status: string;
  last_attempted_fetch: string | null;
  last_successful_fetch: string | null;
  last_failed_fetch: string | null;
  last_duration_ms: number | null;
  last_items_fetched: number | null;
  last_parse_status: string | null;
  last_error: string | null;
  fallback_usage_reason: string | null;
  consecutive_failures: number;
  updated_at: string;
};

type FetchLogWriteRow = {
  indicator_slug: string;
  module: string;
  provider_type: string;
  source_name: string;
  source_url: string | null;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  success: boolean;
  items_fetched: number | null;
  parse_status: string | null;
  attempt_count: number;
  error_message: string | null;
};

type AttemptResult = {
  slug: string;
  refreshed: boolean;
  skipped: boolean;
  observationRow?: ObservationWriteRow;
  syncStatusRow: SyncStatusWriteRow;
  fetchLogRow?: FetchLogWriteRow;
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

function serializeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown refresh error.";
}

function transformObservation(observations: FredObservation[], index: number, config: SeriesConfig) {
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

function getConfigSeriesIds(config: SeriesConfig) {
  if (config.seriesId) {
    return [config.seriesId];
  }

  return (config.inputs ?? []).map((input) => input.seriesId);
}

function combineObservations(rawSeriesMap: Record<string, FredObservation[]>, config: SeriesConfig): FredObservation[] {
  if (config.seriesId) {
    return rawSeriesMap[config.seriesId] ?? [];
  }

  if (!config.inputs || config.inputs.length === 0) {
    return [];
  }

  const perDate = new Map<string, { count: number; value: number }>();

  for (const input of config.inputs) {
    const weight = input.weight ?? 1;
    const observations = rawSeriesMap[input.seriesId] ?? [];

    for (const observation of observations) {
      const existing = perDate.get(observation.date) ?? { count: 0, value: 0 };
      perDate.set(observation.date, {
        count: existing.count + 1,
        value: existing.value + observation.value * weight
      });
    }
  }

  return [...perDate.entries()]
    .filter(([, value]) => value.count === config.inputs?.length)
    .map(([date, value]) => ({
      date,
      value: value.value
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function buildSeries(observations: FredObservation[], config: SeriesConfig): ChartPoint[] {
  return observations
    .map((_, index) => transformObservation(observations, index, config))
    .filter((point): point is ChartPoint => point !== null);
}

function getPriorPointDate(observedAt: string, frequency: Frequency) {
  const reference = new Date(`${observedAt}T12:00:00Z`);

  if (frequency === "Daily" || frequency === "Live") {
    return subDays(reference, 1).toISOString().slice(0, 10);
  }

  if (frequency === "Weekly") {
    return subWeeks(reference, 1).toISOString().slice(0, 10);
  }

  if (frequency === "Monthly") {
    return subMonths(reference, 1).toISOString().slice(0, 10);
  }

  return subQuarters(reference, 1).toISOString().slice(0, 10);
}

function toMinimalChartHistory(indicator: MacroIndicator, observedAt: string, currentValue: number, priorValue: number) {
  return [
    { date: getPriorPointDate(observedAt, indicator.frequency), value: priorValue },
    { date: observedAt, value: currentValue }
  ];
}

function toProviderOutcome(
  indicator: MacroIndicator,
  observation: ProviderObservation,
  overrides?: {
    sourceName?: string;
    sourceUrl?: string;
    parseStatus?: string;
  }
): FetchOutcome {
  return {
    observedAt: observation.observedAt,
    currentValue: observation.currentValue,
    priorValue: observation.priorValue,
    sourceName: overrides?.sourceName ?? observation.sourceName,
    sourceUrl: overrides?.sourceUrl ?? observation.sourceUrl,
    chartHistory: toMinimalChartHistory(indicator, observation.observedAt, observation.currentValue, observation.priorValue),
    itemsFetched: 1,
    parseStatus: overrides?.parseStatus ?? "parsed"
  };
}

async function fetchFredOutcome(
  indicator: MacroIndicator,
  overrides?: {
    sourceName?: string;
    sourceUrl?: string;
    parseStatus?: string;
  }
): Promise<FetchOutcome> {
  if (!process.env.FRED_API_KEY) {
    throw new Error("Missing FRED_API_KEY.");
  }

  const config = seriesConfigBySlug[indicator.slug];

  if (!config) {
    throw new Error(`Missing series config for ${indicator.slug}.`);
  }

  const uniqueSeriesIds = [...new Set(getConfigSeriesIds(config))];
  const rawSeriesEntries = await Promise.all(
    uniqueSeriesIds.map(async (seriesId) => {
      const limit = Math.max(
        config.limit ?? 0,
        getRequiredObservationLimit(indicator.frequency, config.transform)
      );

      return [seriesId, await fetchFredObservations(seriesId, limit)] as const;
    })
  );
  const rawSeriesMap = Object.fromEntries(rawSeriesEntries);
  const transformed = buildSeries(combineObservations(rawSeriesMap, config), config);
  const current = transformed.at(-1);
  const prior = transformed.at(-2);

  if (!current || !prior) {
    throw new Error(`Not enough FRED data to resolve ${indicator.slug}.`);
  }

  return {
    observedAt: current.date,
    currentValue: current.value,
    priorValue: prior.value,
    sourceName: overrides?.sourceName ?? indicator.source.name,
    sourceUrl: overrides?.sourceUrl ?? indicator.source.url,
    chartHistory: transformed.slice(-getChartHistoryPointTarget(indicator.frequency)),
    itemsFetched: transformed.length,
    parseStatus: overrides?.parseStatus ?? "parsed"
  };
}

async function fetchFromEndpoint(indicator: MacroIndicator, endpoint: IndicatorSourceEndpointContract): Promise<FetchOutcome> {
  switch (endpoint.resolver) {
    case "bls":
      return toProviderOutcome(
        indicator,
        await fetchBlsIndicator(endpoint.resolverSlug as Parameters<typeof fetchBlsIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "bea":
      return toProviderOutcome(
        indicator,
        await fetchBeaIndicator((endpoint.resolverSlug ?? indicator.slug) as Parameters<typeof fetchBeaIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "census":
      return toProviderOutcome(
        indicator,
        await fetchCensusIndicator((endpoint.resolverSlug ?? indicator.slug) as Parameters<typeof fetchCensusIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "dol":
      return toProviderOutcome(indicator, await fetchDolIndicator(), {
        sourceName: endpoint.sourceName,
        sourceUrl: endpoint.sourceUrl
      });
    case "fed":
      return toProviderOutcome(
        indicator,
        await fetchFedIndicator((endpoint.resolverSlug ?? indicator.slug) as Parameters<typeof fetchFedIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "fred":
      return fetchFredOutcome(indicator, {
        sourceName: endpoint.sourceName,
        sourceUrl: endpoint.sourceUrl,
        parseStatus: endpoint.provider === "fred-backup" ? "parsed-via-fred-backup" : "parsed"
      });
    case "ism":
      return toProviderOutcome(
        indicator,
        await fetchIsmIndicator((endpoint.resolverSlug ?? indicator.slug) as Parameters<typeof fetchIsmIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "treasury":
      return toProviderOutcome(
        indicator,
        await fetchTreasuryIndicator((endpoint.resolverSlug ?? indicator.slug) as Parameters<typeof fetchTreasuryIndicator>[0]),
        {
          sourceName: endpoint.sourceName,
          sourceUrl: endpoint.sourceUrl
        }
      );
    case "manual":
      throw new Error(`Indicator ${indicator.slug} is configured as manual-only.`);
    default:
      throw new Error(`No live fetch resolver is configured for ${indicator.slug}.`);
  }
}

async function resolveFetchOutcome(indicator: MacroIndicator): Promise<ResolvedFetchOutcome> {
  const sourceContract = getIndicatorSourceContract(indicator);

  if (!sourceContract) {
    throw new Error(`No source contract is configured for ${indicator.slug}.`);
  }

  if (sourceContract.liveSupport !== "configured") {
    throw new Error(`Live source contract is ${sourceContract.liveSupport} for ${indicator.slug}.`);
  }

  try {
    return {
      outcome: await fetchFromEndpoint(indicator, sourceContract.primary),
      providerType: sourceContract.primary.provider,
      sourceContract,
      sourceEndpoint: sourceContract.primary
    };
  } catch (primaryError) {
    if (!sourceContract.backup) {
      throw primaryError;
    }

    return {
      outcome: await fetchFromEndpoint(indicator, sourceContract.backup),
      providerType: sourceContract.backup.provider,
      sourceContract,
      sourceEndpoint: sourceContract.backup
    };
  }
}

function buildDefinitionRows(indicators: MacroIndicator[]) {
  return indicators.map((indicator) => {
    const sourceContract = getIndicatorSourceContract(indicator);

    return {
      slug: indicator.slug,
      name: indicator.name,
      short_name: indicator.shortName,
      module: indicator.module,
      dimension: indicator.dimension,
      unit: indicator.unit,
      frequency: indicator.frequency,
      source_name: sourceContract?.primary.sourceName ?? indicator.source.name,
      source_url: sourceContract?.primary.sourceUrl ?? indicator.source.url ?? null,
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
      provider_type: sourceContract?.primary.provider ?? indicator.provider.type,
      provider_series_id: indicator.provider.seriesId ?? null
    };
  });
}

function logFetch(result: FetchLogWriteRow, fallbackUsageReason?: string | null) {
  console.info(
    JSON.stringify({
      event: "indicator_fetch",
      indicator_slug: result.indicator_slug,
      module: result.module,
      source: result.source_name,
      provider: result.provider_type,
      started_at: result.started_at,
      completed_at: result.completed_at,
      duration_ms: result.duration_ms,
      success: result.success,
      items_fetched: result.items_fetched,
      parse_status: result.parse_status,
      attempt_count: result.attempt_count,
      error_message: result.error_message,
      fallback_usage_reason: fallbackUsageReason ?? null
    })
  );
}

async function runAttempt(
  indicator: MacroIndicator,
  existingLatestMap: Map<string, ExistingLatestRow>,
  existingSyncMap: Map<string, ExistingSyncStatusRow>
): Promise<AttemptResult> {
  const sourceContract = getIndicatorSourceContract(indicator);

  if (!sourceContract) {
    throw new Error(`Missing source contract for ${indicator.slug}.`);
  }

  const existingLatest = existingLatestMap.get(indicator.slug);
  const existingSync = existingSyncMap.get(indicator.slug);
  const existingSuccessAt =
    existingSync?.last_successful_fetch ??
    (typeof existingLatest?.source_payload?.updated_at === "string"
      ? existingLatest.source_payload.updated_at
      : existingLatest?.inserted_at) ??
    null;
  const consecutiveFailures = existingSync?.consecutive_failures ?? 0;

  if (sourceContract?.liveSupport === "manual-only") {
    return {
      slug: indicator.slug,
      refreshed: false,
      skipped: true,
      syncStatusRow: {
        slug: indicator.slug,
        module: indicator.module,
        provider_type: sourceContract.primary.provider,
        source_name: sourceContract.primary.sourceName,
        source_url: sourceContract.primary.sourceUrl ?? null,
        status: "fallback",
        last_attempted_fetch: null,
        last_successful_fetch: existingSuccessAt,
        last_failed_fetch: existingSync?.last_failed_fetch ?? null,
        last_duration_ms: null,
        last_items_fetched: null,
        last_parse_status: "manual-fallback",
        last_error: null,
        fallback_usage_reason: "Manual seed value; no live source contract is configured for this indicator yet.",
        consecutive_failures: 0,
        updated_at: new Date().toISOString()
      }
    };
  }

  const release = getIndicatorRelease(indicator.slug, indicator.frequency, indicator.releaseCadence);
  const startedAt = new Date();

  try {
    const { attemptsUsed, value } = await withRetry(() => resolveFetchOutcome(indicator));
    const completedAt = new Date();
    const completedIso = completedAt.toISOString();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const outcome = value.outcome;
    const sourcePayload = {
      provider_type: value.providerType,
      source_name: outcome.sourceName,
      source_url: outcome.sourceUrl ?? null,
      updated_at: completedIso,
      observed_at: outcome.observedAt,
      next_release_at: release.nextReleaseDate ? `${release.nextReleaseDate}T12:00:00Z` : null,
      status: "live",
      freshness_age_minutes: 0,
      parse_status: outcome.parseStatus,
      items_fetched: outcome.itemsFetched,
      last_successful_fetch: completedIso,
      last_failed_fetch: null,
      error_message: null,
      fallback_usage_reason: null,
      source_contract: {
        primary_provider: value.sourceContract.primary.provider,
        backup_provider: value.sourceContract.backup?.provider ?? null,
        fetch_method: value.sourceEndpoint.fetchMethod,
        expected_release_cadence: value.sourceContract.expectedReleaseCadence,
        revision_detection: value.sourceContract.revisionDetection,
        failure_handling: value.sourceContract.failureHandling
      }
    } satisfies Record<string, unknown>;
    const fetchLogRow: FetchLogWriteRow = {
      indicator_slug: indicator.slug,
      module: indicator.module,
      provider_type: value.providerType,
      source_name: outcome.sourceName,
      source_url: outcome.sourceUrl ?? null,
      started_at: startedAt.toISOString(),
      completed_at: completedIso,
      duration_ms: durationMs,
      success: true,
      items_fetched: outcome.itemsFetched,
      parse_status: outcome.parseStatus,
      attempt_count: attemptsUsed,
      error_message: null
    };

    logFetch(fetchLogRow);

    return {
      slug: indicator.slug,
      refreshed: true,
      skipped: false,
      observationRow: {
        indicator_slug: indicator.slug,
        observed_at: outcome.observedAt,
        current_value: outcome.currentValue,
        prior_value: outcome.priorValue,
        change_value: round(outcome.currentValue - outcome.priorValue),
        chart_history: outcome.chartHistory ?? null,
        source_payload: sourcePayload
      },
      syncStatusRow: {
        slug: indicator.slug,
        module: indicator.module,
        provider_type: value.providerType,
        source_name: outcome.sourceName,
        source_url: outcome.sourceUrl ?? null,
        status: "live",
        last_attempted_fetch: completedIso,
        last_successful_fetch: completedIso,
        last_failed_fetch: null,
        last_duration_ms: durationMs,
        last_items_fetched: outcome.itemsFetched,
        last_parse_status: outcome.parseStatus,
        last_error: null,
        fallback_usage_reason: null,
        consecutive_failures: 0,
        updated_at: completedIso
      },
      fetchLogRow
    };
  } catch (error) {
    const completedAt = new Date();
    const completedIso = completedAt.toISOString();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const errorMessage = serializeError(error);
    const hasLiveCache =
      Boolean(existingLatest?.observed_at) &&
      existingLatest?.current_value !== null &&
      existingLatest?.current_value !== undefined &&
      existingLatest?.prior_value !== null &&
      existingLatest?.prior_value !== undefined;
    const fallbackUsageReason = hasLiveCache
      ? "Serving last good live cache because the latest fetch failed."
      : "No valid live cache exists, so the seeded fallback value is being shown.";
    const status = hasLiveCache ? "stale-live" : "error";
    const fetchLogRow: FetchLogWriteRow = {
      indicator_slug: indicator.slug,
      module: indicator.module,
      provider_type: sourceContract?.primary.provider ?? indicator.provider.type,
      source_name: sourceContract?.primary.sourceName ?? indicator.source.name,
      source_url: sourceContract?.primary.sourceUrl ?? indicator.source.url ?? null,
      started_at: startedAt.toISOString(),
      completed_at: completedIso,
      duration_ms: durationMs,
      success: false,
      items_fetched: 0,
      parse_status: "failed",
      attempt_count: 3,
      error_message: errorMessage
    };

    logFetch(fetchLogRow, fallbackUsageReason);

    return {
      slug: indicator.slug,
      refreshed: false,
      skipped: true,
      syncStatusRow: {
        slug: indicator.slug,
        module: indicator.module,
        provider_type: sourceContract?.primary.provider ?? indicator.provider.type,
        source_name: sourceContract?.primary.sourceName ?? indicator.source.name,
        source_url: sourceContract?.primary.sourceUrl ?? indicator.source.url ?? null,
        status,
        last_attempted_fetch: completedIso,
        last_successful_fetch: existingSuccessAt,
        last_failed_fetch: completedIso,
        last_duration_ms: durationMs,
        last_items_fetched: 0,
        last_parse_status: "failed",
        last_error: errorMessage,
        fallback_usage_reason: fallbackUsageReason,
        consecutive_failures: consecutiveFailures + 1,
        updated_at: completedIso
      },
      fetchLogRow
    };
  }
}

export async function refreshIndicators(scope: RefreshScope = "all"): Promise<RefreshResult> {
  const startedAt = new Date().toISOString();
  const inScopeIndicators = macroIndicators.filter((indicator) => isInScope(indicator, scope));
  const outOfScope = macroIndicators
    .filter((indicator) => !isInScope(indicator, scope))
    .map((indicator) => indicator.slug);

  if (!hasSupabaseWriteEnv()) {
    return {
      scope,
      startedAt,
      completedAt: new Date().toISOString(),
      dataMode: "demo",
      refreshed: [],
      skipped: inScopeIndicators.map((indicator) => indicator.slug)
    };
  }

  const supabase = createSupabaseAdminClient();

  await supabase.from("indicator_definitions").upsert(buildDefinitionRows(macroIndicators), {
    onConflict: "slug"
  });

  const [{ data: latestRows }, { data: syncRows }] = await Promise.all([
    supabase
      .from("indicator_latest")
      .select("slug,observed_at,current_value,prior_value,source_payload,inserted_at")
      .returns<ExistingLatestRow[]>(),
    supabase
      .from("indicator_sync_status")
      .select("slug,last_successful_fetch,last_failed_fetch,consecutive_failures")
      .returns<ExistingSyncStatusRow[]>()
  ]);
  const existingLatestMap = new Map((latestRows ?? []).map((row) => [row.slug, row]));
  const existingSyncMap = new Map((syncRows ?? []).map((row) => [row.slug, row]));
  const results = await Promise.all(
    inScopeIndicators.map((indicator) => runAttempt(indicator, existingLatestMap, existingSyncMap))
  );

  const observationRows = results
    .map((result) => result.observationRow)
    .filter((row): row is ObservationWriteRow => Boolean(row));
  const syncStatusRows = results.map((result) => result.syncStatusRow);
  const fetchLogRows = results
    .map((result) => result.fetchLogRow)
    .filter((row): row is FetchLogWriteRow => Boolean(row));
  const refreshed = results.filter((result) => result.refreshed).map((result) => result.slug);
  const skipped = [...outOfScope, ...results.filter((result) => result.skipped).map((result) => result.slug)];

  if (observationRows.length > 0) {
    await supabase.from("indicator_observations").upsert(observationRows, {
      onConflict: "indicator_slug,observed_at"
    });
  }

  if (syncStatusRows.length > 0) {
    await supabase.from("indicator_sync_status").upsert(syncStatusRows, {
      onConflict: "slug"
    });
  }

  if (fetchLogRows.length > 0) {
    await supabase.from("indicator_fetch_logs").insert(fetchLogRows);
  }

  const uniqueSkipped = [...new Set(skipped)];

  await supabase.from("refresh_runs").insert({
    scope,
    refreshed_count: refreshed.length,
    skipped_count: uniqueSkipped.length,
    status: "completed",
    payload: {
      refreshed,
      skipped: uniqueSkipped,
      liveIndicators: refreshed,
      staleIndicators: syncStatusRows.filter((row) => row.status === "stale-live").map((row) => row.slug),
      errorIndicators: syncStatusRows.filter((row) => row.status === "error").map((row) => row.slug)
    }
  });

  return {
    scope,
    startedAt,
    completedAt: new Date().toISOString(),
    dataMode: refreshed.length > 0 ? "live" : "demo",
    refreshed,
    skipped: uniqueSkipped
  };
}
