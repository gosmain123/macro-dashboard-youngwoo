"use client";

import { AlertTriangle, BarChart3, Database } from "lucide-react";

import { IndicatorCard } from "@/components/indicator-card";
import { WorkspaceToolbar } from "@/components/workspace-toolbar";
import { useWorkspace } from "@/components/workspace-provider";
import type { LayerPagePayload } from "@/lib/layer-pages";

export function LayerDashboard({
  page,
  dataMode
}: {
  page: LayerPagePayload;
  dataMode: "demo" | "live";
}) {
  const { applyIndicatorPreferences } = useWorkspace();
  const visibleIndicators = applyIndicatorPreferences(page.indicators);
  const visibleSections = page.sections
    .map((section) => ({
      ...section,
      indicators: applyIndicatorPreferences(section.indicators)
    }))
    .filter((section) => section.indicators.length > 0);

  return (
    <div className="space-y-8">
      <WorkspaceToolbar />

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">{page.kicker}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{page.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300 mode-beginner-only">{page.description}</p>

            <div className="mt-6 rounded-[26px] border border-white/8 bg-slate-950/45 p-5 mode-beginner-only">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Goal</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">{page.goal}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3 mode-beginner-only">
              {page.workflow.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Step {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
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
                <p className="mt-3 text-2xl font-semibold text-white">
                  {page.liveCount} / {page.staleLiveCount} / {page.fallbackCount} / {page.errorCount}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {dataMode === "live"
                    ? "Order: live / stale-live / fallback / error"
                    : "Live storage is unavailable, so this layer is still leaning on fallback cards"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Database className="h-4 w-4" />
                  Official / manual
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {page.officialCount} / {page.manualCount}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Source names, URLs, status, and updated timestamps stay visible on every card.
                </p>
              </div>
            </div>

            <div className="rounded-[26px] border border-amber-300/20 bg-amber-300/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">What not to overread</p>
                  <div className="space-y-2">
                    {page.cautions.map((caution) => (
                      <p key={caution} className="text-sm leading-6 text-slate-300">
                        {caution}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {visibleSections.map((section) => (
        <section key={section.id} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">{page.title}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{section.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{section.description}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {section.indicators.map((indicator) => (
              <IndicatorCard key={indicator.slug} indicator={indicator} visibleSlugs={section.indicators.map((entry) => entry.slug)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

