import { cache } from "react";

import { buildDashboardPayload } from "@/lib/dashboard-content";
import { macroModules } from "@/lib/data";
import {
  getRuntimeLastUpdated,
  loadLiveRuntimeSnapshot,
  mergeIndicatorsFromRuntime
} from "@/lib/server/runtime-data";
import type { DashboardPayload, MacroModuleSlug } from "@/types/macro";

export const getDashboardPayload = cache(async (): Promise<DashboardPayload> => {
  const snapshot = await loadLiveRuntimeSnapshot();
  const indicators = mergeIndicatorsFromRuntime(snapshot);
  const hasAnyLiveData = indicators.some((indicator) => indicator.status === "live" || indicator.status === "stale-live");
  const lastUpdated = getRuntimeLastUpdated(snapshot, indicators);

  return buildDashboardPayload(hasAnyLiveData || snapshot.readable ? "live" : "demo", indicators, lastUpdated);
});

export async function getModulePayload(moduleSlug: MacroModuleSlug) {
  const payload = await getDashboardPayload();
  const moduleData = macroModules.find((entry) => entry.slug === moduleSlug);

  if (!moduleData) {
    return null;
  }

  return {
    ...payload,
    module: moduleData,
    indicators: payload.indicators.filter((indicator) => indicator.module === moduleSlug)
  };
}

export async function getCalendarPayload() {
  const payload = await getDashboardPayload();
  return payload.calendarEvents;
}

export async function getPlaybookPayload() {
  const payload = await getDashboardPayload();
  return payload.playbooks;
}

export async function searchIndicators(
  query: string,
  moduleSlugFilter: MacroModuleSlug | "all" = "all"
) {
  const payload = await getDashboardPayload();
  const normalized = query.trim().toLowerCase();

  return payload.indicators.filter((indicator) => {
    const inModule = moduleSlugFilter === "all" ? true : indicator.module === moduleSlugFilter;
    const matches =
      normalized.length === 0 ||
      indicator.searchTerms.some((term) => term.toLowerCase().includes(normalized)) ||
      indicator.regimeTag.toLowerCase().includes(normalized);

    return inModule && matches;
  });
}
