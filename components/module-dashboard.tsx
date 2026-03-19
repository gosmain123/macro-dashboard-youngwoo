import { BarChart3, Database } from "lucide-react";

import { IndicatorCard } from "@/components/indicator-card";
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
  const official = indicators.filter((indicator) => indicator.source.access === "official-free").length;
  const manual = indicators.length - official;
  const live = indicators.filter((indicator) => indicator.dataStatus === "live").length;
  const fallback = indicators.length - live;

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">{module.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{module.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">{module.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              Indicators tracked
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{indicators.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="h-4 w-4" />
              Live / fallback
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {live} / {fallback}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {dataMode === "live" ? "Missing syncs are explicitly marked fallback" : "All values are currently fallback"}
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
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.slug} indicator={indicator} />
        ))}
      </section>
    </div>
  );
}
