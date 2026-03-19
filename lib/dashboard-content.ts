import { calendarEvents, macroIndicators, macroModules, playbooks } from "@/lib/data";
import { defaultRegimeSnapshot, deriveRegimeCards } from "@/lib/regime";
import type { DashboardPayload, FreshnessStatus, MacroIndicator } from "@/types/macro";

const refreshCadence = "Auto-refresh every 10 min";
const staleAfterMinutes = 20;
const homepageWatchlistSlugs = [
  "core-pce",
  "cpi-headline",
  "ism-manufacturing",
  "ism-services",
  "nonfarm-payrolls",
  "initial-claims",
  "us-2y-treasury",
  "us-10y-treasury",
  "hy-spreads",
  "dxy"
] as const;
const homepageEventIds = new Set([
  "fomc-may",
  "pce-release",
  "nfp-release",
  "cpi-release",
  "ppi-release"
]);

function clampMinutesSinceUpdate(lastUpdated: string) {
  const updatedTime = new Date(lastUpdated).getTime();

  if (Number.isNaN(updatedTime)) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - updatedTime) / 60000));
}

function freshnessStatus(minutesSinceUpdate: number): FreshnessStatus {
  return minutesSinceUpdate > staleAfterMinutes ? "stale" : "fresh";
}

export function buildDashboardPayload(
  dataMode: "demo" | "live",
  indicators: MacroIndicator[] = macroIndicators,
  lastUpdated = new Date().toISOString()
): DashboardPayload {
  const minutesSinceUpdate = clampMinutesSinceUpdate(lastUpdated);
  const currentFreshnessStatus = freshnessStatus(minutesSinceUpdate);
  const resolvedIndicators = indicators.map((indicator) => {
    const indicatorFreshnessStatus =
      indicator.dataStatus === "fallback" ? "stale" : freshnessStatus(minutesSinceUpdate);
    const status =
      indicator.dataStatus === "fallback"
        ? "fallback"
        : indicatorFreshnessStatus === "stale"
          ? "stale"
          : "live";

    return {
      ...indicator,
      freshnessStatus: indicatorFreshnessStatus,
      status
    } as MacroIndicator;
  });
  const watchlist = homepageWatchlistSlugs
    .map((slug) => resolvedIndicators.find((indicator) => indicator.slug === slug))
    .filter((indicator): indicator is MacroIndicator => Boolean(indicator));

  return {
    dataMode,
    modules: macroModules,
    indicators: resolvedIndicators,
    regimeCards: deriveRegimeCards(resolvedIndicators),
    regimeSnapshot: defaultRegimeSnapshot,
    calendarEvents,
    playbooks,
    homepage: {
      watchlist,
      keyEvents: calendarEvents
        .filter((event) => homepageEventIds.has(event.id))
        .sort((left, right) => left.date.localeCompare(right.date))
        .slice(0, 5),
      freshness: {
        lastUpdated,
        refreshCadence,
        freshnessStatus: currentFreshnessStatus,
        staleAfterMinutes,
        minutesSinceUpdate,
        officialCount: watchlist.filter((indicator) => indicator.source.access === "official-free").length,
        manualCount: watchlist.filter((indicator) => indicator.source.access === "licensed-manual").length,
        liveCount: watchlist.filter((indicator) => indicator.dataStatus === "live").length,
        fallbackCount: watchlist.filter((indicator) => indicator.dataStatus === "fallback").length
      }
    }
  };
}
