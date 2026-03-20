import { calendarEvents, macroIndicators, macroModules, playbooks } from "@/lib/data";
import { defaultRegimeSnapshot, deriveRegimeCards, deriveRegimeSnapshot } from "@/lib/regime";
import { STALE_AFTER_MINUTES, clampMinutesSinceUpdate, freshnessStatus } from "@/lib/server/data-status";
import type { DashboardPayload, MacroIndicator } from "@/types/macro";

const refreshCadence = "Auto-refresh every 10 min";
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

export function buildDashboardPayload(
  dataMode: "demo" | "live",
  indicators: MacroIndicator[] = macroIndicators,
  lastUpdated = new Date().toISOString()
): DashboardPayload {
  const minutesSinceUpdate = clampMinutesSinceUpdate(lastUpdated);
  const currentFreshnessStatus = freshnessStatus(minutesSinceUpdate);
  const resolvedIndicators = indicators.map((indicator) => {
    const indicatorFreshnessStatus = freshnessStatus(indicator.freshnessAgeMinutes);

    return {
      ...indicator,
      freshnessStatus:
        indicator.status === "fallback" || indicator.status === "error"
          ? "stale"
          : indicatorFreshnessStatus
    } as MacroIndicator;
  });
  const watchlist = homepageWatchlistSlugs
    .map((slug) => resolvedIndicators.find((indicator) => indicator.slug === slug))
    .filter((indicator): indicator is MacroIndicator => Boolean(indicator));
  const regimeCards = deriveRegimeCards(resolvedIndicators);
  const todayKey = new Date().toISOString().slice(0, 10);
  const upcomingKeyEvents = calendarEvents
    .filter((event) => event.date >= todayKey)
    .sort((left, right) => {
      const importanceRank = (value: "high" | "medium" | "low") => {
        if (value === "high") {
          return 3;
        }

        if (value === "medium") {
          return 2;
        }

        return 1;
      };

      return (
        left.date.localeCompare(right.date) ||
        importanceRank(right.importance) - importanceRank(left.importance) ||
        left.timeLabel.localeCompare(right.timeLabel)
      );
    })
    .slice(0, 5);

  return {
    dataMode,
    modules: macroModules,
    indicators: resolvedIndicators,
    regimeCards,
    regimeSnapshot:
      resolvedIndicators.length > 0 ? deriveRegimeSnapshot(resolvedIndicators, regimeCards) : defaultRegimeSnapshot,
    calendarEvents,
    playbooks,
    homepage: {
      watchlist,
      keyEvents: upcomingKeyEvents,
      freshness: {
        lastUpdated,
        refreshCadence,
        freshnessStatus: currentFreshnessStatus,
        staleAfterMinutes: STALE_AFTER_MINUTES,
        minutesSinceUpdate,
        officialCount: watchlist.filter((indicator) => indicator.source.access === "official-free").length,
        manualCount: watchlist.filter((indicator) => indicator.source.access === "licensed-manual").length,
        liveCount: watchlist.filter((indicator) => indicator.dataStatus === "live").length,
        staleLiveCount: watchlist.filter((indicator) => indicator.dataStatus === "stale-live").length,
        fallbackCount: watchlist.filter((indicator) => indicator.dataStatus === "fallback").length,
        errorCount: watchlist.filter((indicator) => indicator.dataStatus === "error").length
      }
    }
  };
}
