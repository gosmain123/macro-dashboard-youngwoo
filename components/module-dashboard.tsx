"use client";

import { BarChart3, Database } from "lucide-react";

import { IndicatorCard } from "@/components/indicator-card";
import { WorkspaceToolbar } from "@/components/workspace-toolbar";
import { useWorkspace } from "@/components/workspace-provider";
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
  const { applyIndicatorPreferences } = useWorkspace();
  const visibleIndicators = applyIndicatorPreferences(indicators);
  const official = visibleIndicators.filter((indicator) => indicator.source.access === "official-free").length;
  const live = visibleIndicators.filter((indicator) => indicator.dataStatus === "live").length;
  const staleLive = visibleIndicators.filter((indicator) => indicator.dataStatus === "stale-live").length;
  const fallback = visibleIndicators.filter((indicator) => indicator.dataStatus === "fallback").length;
  const error = visibleIndicators.filter((indicator) => indicator.dataStatus === "error").length;

  return (
    <div className="min-w-0 space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="section-kicker">{module.kicker}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
              {module.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">{module.description}</p>
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
                {live} / {staleLive} / {fallback} / {error}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">live / stale-live / fallback / error</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <Database className="h-4 w-4" />
                Sources
              </div>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{official} official</p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {dataMode === "live" ? "Trust badges stay on-card." : "Fallback remains clearly labeled."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <WorkspaceToolbar />

      <section className="grid auto-rows-fr gap-4 xl:grid-cols-2">
        {visibleIndicators.map((indicator) => (
          <IndicatorCard key={indicator.slug} indicator={indicator} visibleSlugs={visibleIndicators.map((entry) => entry.slug)} />
        ))}
      </section>
    </div>
  );
}
