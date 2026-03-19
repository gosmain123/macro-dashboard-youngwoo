import { macroIndicators, macroModules } from "@/lib/data";
import { getIndicatorRelease } from "@/lib/release-metadata";
import {
  clampMinutesSinceUpdate,
  freshnessStatus,
  resolveIndicatorStatus,
  toNextReleaseAt
} from "@/lib/server/data-status";
import { getIndicatorSourceContract } from "@/lib/server/source-contract";
import { createSupabaseReadClient, hasSupabaseReadEnv, hasSupabaseWriteEnv } from "@/lib/server/supabase";
import type { DataHealthPayload, IndicatorHealth, MacroIndicator, ModuleHealth } from "@/types/macro";

export interface IndicatorLatestRow {
  slug: string;
  observed_at: string | null;
  current_value: number | null;
  prior_value: number | null;
  chart_history: Array<{ date: string; value: number }> | null;
  source_name?: string | null;
  source_url?: string | null;
  provider_type?: string | null;
  source_payload?: Record<string, unknown> | null;
  inserted_at?: string | null;
}

export interface IndicatorSyncStatusRow {
  slug: string;
  status?: string | null;
  last_attempted_fetch?: string | null;
  last_successful_fetch?: string | null;
  last_failed_fetch?: string | null;
  last_error?: string | null;
  fallback_usage_reason?: string | null;
}

interface RefreshRunRow {
  created_at: string;
}

export interface LiveRuntimeSnapshot {
  configured: boolean;
  readable: boolean;
  writable: boolean;
  lastRefreshAt?: string;
  latestRows: IndicatorLatestRow[];
  syncRows: IndicatorSyncStatusRow[];
  errorMessage?: string;
}

function getSourcePayloadString(payload: Record<string, unknown> | null | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "string" ? value : undefined;
}

function getLatestIso(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
}

function buildFallbackIndicators(reason: string, now = new Date()) {
  return macroIndicators.map((indicator) => {
    const release = getIndicatorRelease(indicator.slug, indicator.frequency, indicator.releaseCadence, now);
    const updatedAt = indicator.updatedAt;
    const freshnessAgeMinutes = clampMinutesSinceUpdate(updatedAt, now);
    const status: MacroIndicator["status"] = indicator.provider.type === "manual" ? "fallback" : "error";

    return {
      ...indicator,
      release,
      updatedAt,
      lastUpdated: updatedAt,
      nextReleaseAt: toNextReleaseAt(release),
      freshnessAgeMinutes,
      freshnessStatus: freshnessStatus(freshnessAgeMinutes),
      dataStatus: status,
      status,
      fallbackUsageReason: indicator.provider.type === "manual" ? "Seed/manual fallback value." : reason,
      errorMessage: indicator.provider.type === "manual" ? undefined : reason
    };
  });
}

export async function loadLiveRuntimeSnapshot(): Promise<LiveRuntimeSnapshot> {
  if (!hasSupabaseReadEnv()) {
    return {
      configured: false,
      readable: false,
      writable: hasSupabaseWriteEnv(),
      latestRows: [],
      syncRows: [],
      errorMessage: "Supabase read environment variables are missing."
    };
  }

  try {
    const supabase = createSupabaseReadClient();
    const [
      { data: latestRows, error: latestError },
      { data: syncRows, error: syncError },
      { data: refreshRuns, error: refreshError }
    ] = await Promise.all([
      supabase
        .from("indicator_latest")
        .select("slug,observed_at,current_value,prior_value,chart_history,source_name,source_url,provider_type,source_payload,inserted_at")
        .returns<IndicatorLatestRow[]>(),
      supabase
        .from("indicator_sync_status")
        .select("slug,status,last_attempted_fetch,last_successful_fetch,last_failed_fetch,last_error,fallback_usage_reason")
        .returns<IndicatorSyncStatusRow[]>(),
      supabase
        .from("refresh_runs")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .returns<RefreshRunRow[]>()
    ]);

    if (latestError) {
      throw latestError;
    }

    return {
      configured: true,
      readable: true,
      writable: hasSupabaseWriteEnv(),
      lastRefreshAt: refreshError || !refreshRuns || refreshRuns.length === 0 ? undefined : refreshRuns[0].created_at,
      latestRows: latestRows ?? [],
      syncRows: syncError ? [] : (syncRows ?? []),
      errorMessage: syncError ? "Live sync-status table is unavailable; using cached observations only." : undefined
    };
  } catch (error) {
    return {
      configured: true,
      readable: false,
      writable: hasSupabaseWriteEnv(),
      latestRows: [],
      syncRows: [],
      errorMessage: error instanceof Error ? error.message : "Failed to read live indicator state."
    };
  }
}

export function mergeIndicatorsFromRuntime(snapshot: LiveRuntimeSnapshot, now = new Date()): MacroIndicator[] {
  if (!snapshot.readable) {
    return buildFallbackIndicators(snapshot.errorMessage ?? "Live storage is unavailable.", now);
  }

  const latestMap = new Map(snapshot.latestRows.map((row) => [row.slug, row]));
  const syncMap = new Map(snapshot.syncRows.map((row) => [row.slug, row]));

  return macroIndicators.map((indicator) => {
    const latest = latestMap.get(indicator.slug);
    const sync = syncMap.get(indicator.slug);
    const release = getIndicatorRelease(indicator.slug, indicator.frequency, indicator.releaseCadence, now);
    const payload = latest?.source_payload;
    const hasLiveCache =
      Boolean(latest?.observed_at) &&
      latest?.current_value !== null &&
      latest?.current_value !== undefined &&
      latest?.prior_value !== null &&
      latest?.prior_value !== undefined;
    const updatedAt =
      getSourcePayloadString(payload, "updated_at") ??
      sync?.last_successful_fetch ??
      sync?.last_attempted_fetch ??
      latest?.inserted_at ??
      indicator.updatedAt;
    const lastSuccessfulFetch = sync?.last_successful_fetch ?? getSourcePayloadString(payload, "last_successful_fetch");
    const lastFailedFetch = sync?.last_failed_fetch ?? getSourcePayloadString(payload, "last_failed_fetch");
    const errorMessage = sync?.last_error ?? getSourcePayloadString(payload, "error_message");
    const fallbackUsageReason =
      sync?.fallback_usage_reason ??
      getSourcePayloadString(payload, "fallback_usage_reason") ??
      (indicator.provider.type === "manual" ? "Seed/manual fallback value." : undefined);
    const freshnessAgeMinutes = clampMinutesSinceUpdate(updatedAt, now);
    const status = resolveIndicatorStatus({
      hasLiveCache,
      freshnessAgeMinutes,
      lastSuccessfulFetch: lastSuccessfulFetch ?? undefined,
      lastFailedFetch: lastFailedFetch ?? undefined,
      errorMessage: errorMessage ?? undefined
    });
    const sourceName =
      getSourcePayloadString(payload, "source_name") ??
      latest?.source_name ??
      indicator.source.name;
    const sourceUrl =
      getSourcePayloadString(payload, "source_url") ??
      latest?.source_url ??
      indicator.source.url;
    const currentValue = hasLiveCache ? Number(latest?.current_value) : indicator.currentValue;
    const priorValue = hasLiveCache ? Number(latest?.prior_value) : indicator.priorValue;

    return {
      ...indicator,
      currentValue,
      priorValue,
      change: Number((currentValue - priorValue).toFixed(2)),
      chartHistory:
        latest?.chart_history && latest.chart_history.length > 1
          ? latest.chart_history
          : indicator.chartHistory,
      source: {
        ...indicator.source,
        name: sourceName,
        url: sourceUrl ?? undefined
      },
      release,
      updatedAt,
      lastUpdated: updatedAt,
      nextReleaseAt: toNextReleaseAt(release),
      freshnessAgeMinutes,
      freshnessStatus: freshnessStatus(freshnessAgeMinutes),
      dataStatus: status,
      status,
      lastSuccessfulFetch: lastSuccessfulFetch ?? undefined,
      lastFailedFetch: lastFailedFetch ?? undefined,
      fallbackUsageReason,
      errorMessage: errorMessage ?? undefined
    };
  });
}

export function getRuntimeLastUpdated(snapshot: LiveRuntimeSnapshot, indicators: MacroIndicator[]) {
  return (
    getLatestIso([
      snapshot.lastRefreshAt,
      ...indicators.map((indicator) => indicator.lastSuccessfulFetch ?? indicator.updatedAt)
    ]) ?? new Date().toISOString()
  );
}

export function buildDataHealthPayload(
  snapshot: LiveRuntimeSnapshot,
  indicators: MacroIndicator[],
  generatedAt = new Date().toISOString()
): DataHealthPayload {
  const indicatorHealth: IndicatorHealth[] = indicators.map((indicator) => {
    const sourceContract = getIndicatorSourceContract(indicator);

    return {
      slug: indicator.slug,
      name: indicator.name,
      module: indicator.module,
      provider: indicator.provider.type,
      primaryProvider: sourceContract?.primary.provider,
      backupProvider: sourceContract?.backup?.provider,
      fetchMethod: sourceContract?.primary.fetchMethod,
      expectedReleaseCadence: sourceContract?.expectedReleaseCadence,
      revisionDetection: sourceContract?.revisionDetection,
      failureHandling: sourceContract?.failureHandling,
      sourceName: indicator.source.name,
      sourceUrl: indicator.source.url,
      value: indicator.currentValue,
      priorValue: indicator.priorValue,
      delta: indicator.change,
      updatedAt: indicator.updatedAt,
      nextReleaseAt: indicator.nextReleaseAt,
      status: indicator.status,
      freshnessAgeMinutes: indicator.freshnessAgeMinutes,
      lastSuccessfulFetch: indicator.lastSuccessfulFetch,
      lastFailedFetch: indicator.lastFailedFetch,
      errorMessage: indicator.errorMessage,
      fallbackUsageReason: indicator.fallbackUsageReason
    };
  });

  const modules: ModuleHealth[] = macroModules.map((module) => {
    const moduleIndicators = indicatorHealth.filter((indicator) => indicator.module === module.slug);
    const liveCount = moduleIndicators.filter((indicator) => indicator.status === "live").length;
    const staleLiveCount = moduleIndicators.filter((indicator) => indicator.status === "stale-live").length;
    const fallbackCount = moduleIndicators.filter((indicator) => indicator.status === "fallback").length;
    const errorCount = moduleIndicators.filter((indicator) => indicator.status === "error").length;
    const status =
      liveCount > 0 && staleLiveCount === 0 && fallbackCount === 0 && errorCount === 0
        ? "healthy"
        : liveCount + staleLiveCount > 0
          ? "degraded"
          : "down";

    return {
      module: module.slug,
      title: module.title,
      status,
      indicatorCount: moduleIndicators.length,
      liveCount,
      staleLiveCount,
      fallbackCount,
      errorCount,
      lastSuccessfulFetch: getLatestIso(moduleIndicators.map((indicator) => indicator.lastSuccessfulFetch)),
      lastFailedFetch: getLatestIso(moduleIndicators.map((indicator) => indicator.lastFailedFetch))
    };
  });

  const backendStatus =
    !snapshot.configured || !snapshot.readable
      ? "down"
      : modules.every((module) => module.status === "healthy") && snapshot.writable
        ? "healthy"
        : "degraded";

  return {
    generatedAt,
    backend: {
      configured: snapshot.configured,
      readable: snapshot.readable,
      writable: snapshot.writable,
      status: backendStatus,
      message:
        snapshot.errorMessage ??
        (backendStatus === "healthy"
          ? "Live storage and refresh writes are healthy."
          : "Live storage is reachable, but some indicators are stale, fallback, or error.")
    },
    modules,
    indicators: indicatorHealth
  };
}
