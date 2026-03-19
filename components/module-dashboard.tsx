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
  const manual = visibleIndicators.length - official;
  const live = visibleIndicators.filter((indicator) => indicator.dataStatus === "live").length;
  const staleLive = visibleIndicators.filter((indicator) => indicator.dataStatus === "stale-live").length;
  const fallback = visibleIndicators.filter((indicator) => indicator.dataStatus === "fallback").length;
  const error = visibleIndicators.filter((indicator) => indicator.dataStatus === "error").length;

  return (
    <div className="space-y-8">
      <WorkspaceToolbar />

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">{module.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{module.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300 mode-beginner-only">{module.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              Indicators tracked
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{visibleIndicators.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="h-4 w-4" />
              Live status mix
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {live} / {staleLive} / {fallback} / {error}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {dataMode === "live"
                ? "Order: live / stale-live / fallback / error"
                : "Live storage is unavailable, so cards are showing fallback or error states"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="h-4 w-4" />
              Official / manual sources
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {official} / {manual}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Source labels and updated dates are shown on every card
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {visibleIndicators.map((indicator) => (
          <IndicatorCard key={indicator.slug} indicator={indicator} visibleSlugs={visibleIndicators.map((entry) => entry.slug)} />
        ))}
      </section>
    </div>
  );
}

