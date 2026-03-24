"use client";

import { AlertTriangle, BarChart3, Database } from "lucide-react";

import { IndicatorCard } from "@/components/indicator-card";
import { MiniLogicMap } from "@/components/mini-logic-map";
import { WidgetErrorBoundary } from "@/components/widget-error-boundary";
import { getMiniLogicMapForLayer } from "@/lib/macro-flow";
import type { LayerPagePayload } from "@/lib/layer-pages";

export function LayerDashboard({
  page,
  dataMode
}: {
  page: LayerPagePayload;
  dataMode: "demo" | "live";
}) {
  const safePage = {
    ...page,
    indicators: Array.isArray(page?.indicators) ? page.indicators : [],
    sections: Array.isArray(page?.sections) ? page.sections : [],
    workflow: Array.isArray(page?.workflow) ? page.workflow : [],
    cautions: Array.isArray(page?.cautions) ? page.cautions : []
  };
  const visibleIndicators = safePage.indicators;
  const visibleSections = safePage.sections
    .map((section) => ({
      ...section,
      indicators: Array.isArray(section.indicators) ? section.indicators : []
    }))
    .filter((section) => section.indicators.length > 0);
  const logicMap = getMiniLogicMapForLayer(page.slug);

  return (
    <div className="min-w-0 space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="section-kicker">{safePage.kicker}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
              {safePage.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">{safePage.description}</p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-[34rem] xl:flex-none">
            <div className="surface-inset rounded-[22px] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <BarChart3 className="h-4 w-4" />
                Indicators
              </div>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{visibleIndicators.length}</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <Database className="h-4 w-4" />
                Live mix
              </div>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                {safePage.liveCount} / {safePage.staleLiveCount} / {safePage.fallbackCount} / {safePage.errorCount}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">live / stale-live / fallback / error</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <Database className="h-4 w-4" />
                Sources
              </div>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                {safePage.officialCount} / {safePage.manualCount}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {dataMode === "live" ? "Official / manual" : "Fallback remains explicit"}
              </p>
            </div>
          </div>
        </div>

        <details className="surface-inset mt-5 rounded-[24px] p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[color:var(--text-primary)]">Read guide</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                Goal, workflow steps, and what not to overread
              </p>
            </div>
            <AlertTriangle className="h-4 w-4 text-[color:var(--accent-strong)]" />
          </summary>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="space-y-3">
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Goal</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{safePage.goal}</p>
              </div>
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Workflow</p>
                <div className="mt-3 space-y-2">
                  {safePage.workflow.map((step, index) => (
                    <p key={step} className="text-sm leading-6 text-[color:var(--text-secondary)]">
                      {index + 1}. {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-card rounded-[20px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Cautions</p>
              <div className="mt-3 space-y-2">
                {safePage.cautions.map((caution) => (
                  <p key={caution} className="text-sm leading-6 text-[color:var(--text-secondary)]">
                    {caution}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </details>
      </section>

      {logicMap ? <MiniLogicMap map={logicMap} /> : null}

      {visibleSections.length === 0 ? (
        <section className="surface-card rounded-[28px] p-5 md:p-6">
          <p className="section-kicker">Fallback</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">No indicators are available right now.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">
            The route stayed mounted, but this layer has no usable cards after filtering and safety checks.
          </p>
        </section>
      ) : null}

      {visibleSections.map((section) => (
        <section key={section.id} className="space-y-4">
          <div>
            <p className="section-kicker">{safePage.title}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{section.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">{section.description}</p>
          </div>

          <div className="grid auto-rows-fr gap-4 xl:grid-cols-2">
            {section.indicators.map((indicator) => (
  <WidgetErrorBoundary
    key={indicator.slug}
    title={`${indicator.name} is temporarily unavailable`}
    description="One broken card should not take down the rest of the route."
  >
    {indicator.slug === "gold" ? (
      <LiveGoldQuote />
    ) : (
      <IndicatorCard indicator={indicator} />
    )}
  </WidgetErrorBoundary>
))}
          </div>
        </section>
      ))}
    </div>
  );
}
