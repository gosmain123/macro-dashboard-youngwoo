import { subDays, subMonths, subQuarters, subWeeks } from "date-fns";

import { normalizeChartHistory } from "@/lib/chart-data";
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
  chart_history?: ChartPoint[] | null;
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

type LatestWriteRow = {
  slug: string;
  observed_at: string;
  current_value: number;
  prior_value: number;
  chart_history: ChartPoint[];
  source_name: string;
  source_url: string | null;
  provider_type: string;
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
  latestRow?: LatestWriteRow;
  syncStatusRow: SyncStatusWriteRow;
  fetchLogRow?: FetchLogWriteRow;
};

const minimumPreferredHistoryPoints = 8;

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

function throwIfSupabaseError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
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

function hasRichHistory(history: ChartPoint[]) {
  return history.length >= minimumPreferredHistoryPoints;
}

async function resolveChartHistory(
  indicator: MacroIndicator,
  sourceContract: IndicatorSourceContract,
  outcome: FetchOutcome
) {
  const normalizedPrimary = normalizeChartHistory(outcome.chartHistory);

  if (hasRichHistory(normalizedPrimary)) {
    return {
      chartHistory: normalizedPrimary,
      parseStatus: outcome.parseStatus
    };
  }

  if (sourceContract.backup?.provider === "fred-backup") {
    try {
      const backupOutcome = await fetchFredOutcome(indicator, {
        sourceName: sourceContract.backup.sourceName,
        sourceUrl: sourceContract.backup.sourceUrl,
        parseStatus: "parsed-via-fred-history-backfill"
      });
      const backupHistory = normalizeChartHistory(backupOutcome.chartHistory);

      if (backupHistory.length >= 2) {
        return {
          chartHistory: backupHistory,
          parseStatus:
            backupHistory.length >= minimumPreferredHistoryPoints
              ? `${outcome.parseStatus}|fred-history-backfill`
              : `${outcome.parseStatus}|fred-short-history`
        };
      }
    } catch (error) {
      console.warn(
        JSON.stringify({
          event: "indicator_history_backfill_failed",
          indicator_slug: indicator.slug,
          provider: sourceContract.backup.provider,
          error: serializeError(error)
        })
      );
    }
  }

  const seedHistory = normalizeChartHistory(indicator.chartHistory);

  if (seedHistory.length >= 2) {
    return {
      chartHistory: seedHistory,
      parseStatus: `${outcome.parseStatus}|seed-history-backfill`
    };
  }

  return {
    chartHistory:
      normalizedPrimary.length >= 2
        ? normalizedPrimary
        : toMinimalChartHistory(indicator, outcome.observedAt, outcome.currentValue, outcome.priorValue),
    parseStatus:
      normalizedPrimary.length >= 2
        ? `${outcome.parseStatus}|minimal-live-history`
        : `${outcome.parseStatus}|minimal-history`
  };
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
    const historyResolution = await resolveChartHistory(indicator, value.sourceContract, outcome);
    const sourcePayload = {
      provider_type: value.providerType,
      source_name: outcome.sourceName,
      source_url: outcome.sourceUrl ?? null,
      updated_at: completedIso,
      observed_at: outcome.observedAt,
      next_release_at: release.nextReleaseDate ? `${release.nextReleaseDate}T12:00:00Z` : null,
      status: "live",
      freshness_age_minutes: 0,
      parse_status: historyResolution.parseStatus,
      items_fetched: outcome.itemsFetched,
      last_successful_fetch: completedIso,
      last_failed_fetch: null,
      error_message: null,
      fallback_usage_reason: null,
      chart_history_points: historyResolution.chartHistory.length,
      source_contract: {
        source_family: value.sourceContract.sourceFamily,
        refresh_behavior: value.sourceContract.refreshBehavior,
        release_data_shape: value.sourceContract.releaseDataShape,
        source_strategy: value.sourceContract.sourceStrategy,
        release_window_policy: value.sourceContract.releaseWindowPolicy,
        live_status_rule: value.sourceContract.liveStatusRule,
        product_truth: value.sourceContract.productTruth,
        calendar_sources: value.sourceContract.calendarSources,
        supported_event_statuses: value.sourceContract.supportedEventStatuses,
        schedule_change_policy: value.sourceContract.scheduleChangePolicy,
        release_storage_policy: value.sourceContract.releaseStoragePolicy,
        workflow_storage_policy: value.sourceContract.workflowStoragePolicy,
        primary_provider: value.sourceContract.primary.provider,
        backup_provider: value.sourceContract.backup?.provider ?? null,
        fetch_method: value.sourceEndpoint.fetchMethod,
        update_cadence: value.sourceContract.updateCadence,
        expected_release_cadence: value.sourceContract.expectedReleaseCadence,
        revision_detection: value.sourceContract.revisionDetection,
        failure_handling: value.sourceContract.failureHandling,
        ui_status_labeling: value.sourceContract.uiStatusLabeling
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
      parse_status: historyResolution.parseStatus,
      attempt_count: attemptsUsed,
      error_message: null
    };

    logFetch(fetchLogRow);

    return {
      slug: indicator.slug,
      refreshed: true,
      skipped: false,
      latestRow: {
        slug: indicator.slug,
        observed_at: outcome.observedAt,
        current_value: outcome.currentValue,
        prior_value: outcome.priorValue,
        chart_history: historyResolution.chartHistory,
        source_name: outcome.sourceName,
        source_url: outcome.sourceUrl ?? null,
        provider_type: value.providerType,
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
        last_parse_status: historyResolution.parseStatus,
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

  console.info(
    JSON.stringify({
      event: "supabase_sync_start",
      scope,
      started_at: startedAt,
      indicators_in_scope: inScopeIndicators.length,
      supabase_write_env: hasSupabaseWriteEnv()
    })
  );

  if (!hasSupabaseWriteEnv()) {
    return {
      scope,
      startedAt,
      completedAt: new Date().toISOString(),
      dataMode: "demo",
      refreshed: [],
      skipped: inScopeIndicators.map((indicator) => indicator.slug),
      latestRowsWritten: 0,
      syncStatusRowsWritten: 0,
      refreshRunRowsWritten: 0,
      rowsWritten: 0
    };
  }

  const supabase = createSupabaseAdminClient();
  try {
    const [
      { data: latestRows, error: latestReadError },
      { data: syncRows, error: syncReadError }
    ] = await Promise.all([
      supabase
        .from("indicator_latest")
        .select("slug,observed_at,current_value,prior_value,chart_history,source_payload,inserted_at")
        .returns<ExistingLatestRow[]>(),
      supabase
        .from("indicator_sync_status")
        .select("slug,last_successful_fetch,last_failed_fetch,consecutive_failures")
        .returns<ExistingSyncStatusRow[]>()
    ]);
    throwIfSupabaseError(latestReadError, "Failed to read indicator_latest before refresh");
    throwIfSupabaseError(syncReadError, "Failed to read indicator_sync_status before refresh");
    const existingLatestMap = new Map((latestRows ?? []).map((row) => [row.slug, row]));
    const existingSyncMap = new Map((syncRows ?? []).map((row) => [row.slug, row]));
    const results = await Promise.all(
      inScopeIndicators.map((indicator) => runAttempt(indicator, existingLatestMap, existingSyncMap))
    );

    const latestRowsToWrite = results
      .map((result) => result.latestRow)
      .filter((row): row is LatestWriteRow => Boolean(row));
    const syncStatusRows = results.map((result) => result.syncStatusRow);
    const fetchLogRows = results
      .map((result) => result.fetchLogRow)
      .filter((row): row is FetchLogWriteRow => Boolean(row));
    const refreshed = results.filter((result) => result.refreshed).map((result) => result.slug);
    const skipped = [...outOfScope, ...results.filter((result) => result.skipped).map((result) => result.slug)];

    if (latestRowsToWrite.length > 0) {
      const { error } = await supabase.from("indicator_latest").upsert(latestRowsToWrite, {
        onConflict: "slug"
      });
      throwIfSupabaseError(error, "Failed to upsert indicator_latest rows");
    }

    if (syncStatusRows.length > 0) {
      const { error } = await supabase.from("indicator_sync_status").upsert(syncStatusRows, {
        onConflict: "slug"
      });
      throwIfSupabaseError(error, "Failed to upsert indicator_sync_status rows");
    }

    const uniqueSkipped = [...new Set(skipped)];

    const refreshRunPayload = {
      scope,
      refreshed_count: refreshed.length,
      skipped_count: uniqueSkipped.length,
      status: "completed",
      payload: {
        refreshed,
        skipped: uniqueSkipped,
        liveIndicators: refreshed,
        staleIndicators: syncStatusRows.filter((row) => row.status === "stale-live").map((row) => row.slug),
        errorIndicators: syncStatusRows.filter((row) => row.status === "error").map((row) => row.slug),
        fetchLogs: fetchLogRows
      }
    };
    const { error: refreshRunError } = await supabase.from("refresh_runs").insert(refreshRunPayload);
    throwIfSupabaseError(refreshRunError, "Failed to insert refresh_runs row");

    const latestRowsWritten = latestRowsToWrite.length;
    const syncStatusRowsWritten = syncStatusRows.length;
    const refreshRunRowsWritten = 1;
    const rowsWritten = latestRowsWritten + syncStatusRowsWritten + refreshRunRowsWritten;
    const completedAt = new Date().toISOString();

    console.info(
      JSON.stringify({
        event: "supabase_sync_complete",
        scope,
        completed_at: completedAt,
        latest_rows_written: latestRowsWritten,
        sync_status_rows_written: syncStatusRowsWritten,
        refresh_run_rows_written: refreshRunRowsWritten,
        total_rows_written: rowsWritten,
        refreshed_count: refreshed.length,
        skipped_count: uniqueSkipped.length
      })
    );

    return {
      scope,
      startedAt,
      completedAt,
      dataMode: refreshed.length > 0 ? "live" : "demo",
      refreshed,
      skipped: uniqueSkipped,
      latestRowsWritten,
      syncStatusRowsWritten,
      refreshRunRowsWritten,
      rowsWritten
    };
  } catch (error) {
    const message = serializeError(error);

    try {
      const { error: refreshRunError } = await supabase.from("refresh_runs").insert({
        scope,
        refreshed_count: 0,
        skipped_count: inScopeIndicators.length,
        status: "failed",
        payload: {
          error: message
        }
      });
      throwIfSupabaseError(refreshRunError, "Failed to insert failed refresh_runs row");
    } catch {
      // Ignore secondary logging failures so the original refresh error still surfaces.
    }

    throw error;
  }
}
