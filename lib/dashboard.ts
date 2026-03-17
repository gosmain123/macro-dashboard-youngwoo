import { cache } from "react";

import { buildDashboardPayload } from "@/lib/dashboard-content";
import { macroIndicators, macroModules } from "@/lib/data";
import { createSupabaseAdminClient, hasSupabaseEnv } from "@/lib/server/supabase";
import type { DashboardPayload, MacroIndicator, MacroModuleSlug } from "@/types/macro";

interface LiveIndicatorRow {
  slug: string;
  current_value: number;
  prior_value: number | null;
  chart_history: Array<{ date: string; value: number }> | null;
}

function mergeLiveRows(rows: LiveIndicatorRow[]) {
  const liveMap = new Map(rows.map((row) => [row.slug, row]));

  return macroIndicators.map((indicator) => {
    const live = liveMap.get(indicator.slug);

    if (!live || live.current_value === null || live.prior_value === null) {
      return indicator;
    }

    return {
      ...indicator,
      currentValue: live.current_value,
      priorValue: live.prior_value,
      change: Number((live.current_value - live.prior_value).toFixed(2)),
      chartHistory: live.chart_history && live.chart_history.length > 1 ? live.chart_history : indicator.chartHistory
    };
  });
}

export const getDashboardPayload = cache(async (): Promise<DashboardPayload> => {
  if (!hasSupabaseEnv()) {
    return buildDashboardPayload("demo");
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("indicator_latest")
      .select("slug,current_value,prior_value,chart_history")
      .returns<LiveIndicatorRow[]>();

    if (error || !data || data.length === 0) {
      return buildDashboardPayload("demo");
    }

    const liveIndicators = mergeLiveRows(data);
    return buildDashboardPayload("live", liveIndicators);
  } catch {
    return buildDashboardPayload("demo");
  }
});

export async function getModulePayload(moduleSlug: MacroModuleSlug) {
  const payload = await getDashboardPayload();
  const module = macroModules.find((entry) => entry.slug === moduleSlug);

  if (!module) {
    return null;
  }

  return {
    ...payload,
    module,
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

export async function searchIndicators(query: string, module: MacroModuleSlug | "all" = "all") {
  const payload = await getDashboardPayload();
  const normalized = query.trim().toLowerCase();

  return payload.indicators.filter((indicator) => {
    const inModule = module === "all" ? true : indicator.module === module;
    const matches =
      normalized.length === 0 ||
      indicator.searchTerms.some((term) => term.toLowerCase().includes(normalized)) ||
      indicator.regimeTag.toLowerCase().includes(normalized);

    return inModule && matches;
  });
}
