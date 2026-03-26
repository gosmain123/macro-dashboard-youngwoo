"use client";

import { BarChart3, Database } from "lucide-react";

import { IndicatorCard } from "@/components/indicator-card";
import { LiveGoldIndicatorCard } from "@/components/live-gold-indicator-card";
import { MiniLogicMap } from "@/components/mini-logic-map";
import { WidgetErrorBoundary } from "@/components/widget-error-boundary";
import { getMiniLogicMapForModule } from "@/lib/macro-flow";
import type { MacroIndicator, MacroModule } from "@/types/macro";

export function ModuleDashboard({
  module,
  indicators,
  dataMode
}: {
  module: MacroModule;
  indicators: MacroIndicator[];
  dataMode: "demo" | "live";
}) {
  const visibleIndicators = Array.isArray(indicators) ? indicators : [];
  const official = visibleIndicators.filter((indicator) => indicator.source.access === "official-free").length;
  const live = visibleIndicators.filter((indicator) => indicator.dataStatus === "live").length;
  const staleLive = visibleIndicators.filter((indicator) => indicator.dataStatus === "stale-live").length;
  const fallback = visibleIndicators.filter((indicator) => indicator.dataStatus === "fallback").length;
  const error = visibleIndicators.filter((indicator) => indicator.dataStatus === "error").length;
  const logicMap = getMiniLogicMapForModule(module.slug);

  return (
    <div className="min-w-0 space-y-6">
      {/* ...header stays same... */}

      {logicMap ? <MiniLogicMap map={logicMap} /> : null}

      <section className="grid auto-rows-fr gap-4 xl:grid-cols-2">
        {visibleIndicators.map((indicator) => (
          <WidgetErrorBoundary
            key={indicator.slug}
            title={`${indicator.name} is temporarily unavailable`}
            description="One broken card should not take down the rest of the module."
          >
            {indicator.slug === "gold" ? (
              <LiveGoldIndicatorCard indicator={indicator} />
            ) : (
              <IndicatorCard indicator={indicator} />
            )}
          </WidgetErrorBoundary>
        ))}
      </section>
    </div>
  );
}
