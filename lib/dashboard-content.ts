import { calendarEvents, macroIndicators, macroModules, playbooks } from "@/lib/data";
import { defaultRegimeSnapshot, deriveRegimeCards } from "@/lib/regime";
import type { DashboardPayload, MacroIndicator } from "@/types/macro";

export function buildDashboardPayload(
  dataMode: "demo" | "live",
  indicators: MacroIndicator[] = macroIndicators
): DashboardPayload {
  return {
    dataMode,
    modules: macroModules,
    indicators,
    regimeCards: deriveRegimeCards(indicators),
    regimeSnapshot: defaultRegimeSnapshot,
    calendarEvents,
    playbooks
  };
}
