"use client";

import { IndicatorCard } from "@/components/indicator-card";
import { LiveMarketIndicatorCard } from "@/components/live-market-indicator-card";
import { MiniLogicMap } from "@/components/mini-logic-map";
import { WidgetErrorBoundary } from "@/components/widget-error-boundary";
import { getMiniLogicMapForModule } from "@/lib/macro-flow";
import { supportsLiveMarketQuote } from "@/lib/market-live-config";
import type { MacroIndicator, MacroModule } from "@/types/macro";

export function ModuleDashboard({
  module,
  indicators
}: {
  module: MacroModule;
  indicators: MacroIndicator[];
  dataMode: "demo" | "live";
}) {
  const visibleIndicators = Array.isArray(indicators) ? indicators : [];
  const logicMap = getMiniLogicMapForModule(module.slug);

  return (
    <div className="min-w-0 space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="min-w-0 max-w-3xl">
          <p className="section-kicker">{module.kicker}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
            {module.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">
            {module.description}
          </p>
        </div>
      </section>

      {logicMap ? <MiniLogicMap map={logicMap} /> : null}

      <section className="grid auto-rows-fr gap-4 xl:grid-cols-2">
        {visibleIndicators.map((indicator) => (
          <WidgetErrorBoundary
            key={indicator.slug}
            title={`${indicator.name} is temporarily unavailable`}
            description="One broken card should not take down the rest of the module."
          >
            {supportsLiveMarketQuote(indicator.slug) ? (
              <LiveMarketIndicatorCard indicator={indicator} />
            ) : (
              <IndicatorCard indicator={indicator} />
            )}
          </WidgetErrorBoundary>
        ))}
      </section>
    </div>
  );
}
