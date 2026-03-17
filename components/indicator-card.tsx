"use client";

import Link from "next/link";
import { ArrowRight, Clock3, DatabaseZap } from "lucide-react";

import { useExperienceMode } from "@/app/providers";
import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { SparklineChart } from "@/components/sparkline-chart";
import { cn, formatChange, formatIndicatorValue } from "@/lib/utils";
import type { MacroIndicator } from "@/types/macro";

function toneStyles(tone: MacroIndicator["tone"]) {
  if (tone === "positive") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "negative") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-slate-300/20 bg-white/6 text-slate-100";
}

export function IndicatorCard({
  indicator,
  compact = false
}: {
  indicator: MacroIndicator;
  compact?: boolean;
}) {
  const { mode } = useExperienceMode();
  const isAdvanced = mode === "advanced";

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                toneStyles(indicator.tone)
              )}
            >
              {indicator.regimeTag}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              {indicator.source.access === "official-free" ? "official/free" : "licensed/manual"}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{indicator.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{indicator.summary}</p>
        </div>
        <IndicatorTooltip title={indicator.name} tooltip={indicator.tooltips} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Current</p>
          <div className="text-4xl font-semibold text-white">{formatIndicatorValue(indicator.currentValue, indicator.unit)}</div>
          <div className="text-sm text-slate-400">
            {`Prior ${formatIndicatorValue(indicator.priorValue, indicator.unit)} | Change ${formatChange(indicator.change, indicator.unit)}`}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Frequency</p>
          <p className="mt-1 text-sm font-medium text-slate-200">{indicator.frequency}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-white/8 bg-slate-950/55 p-3">
        <SparklineChart data={indicator.chartHistory} showOverlay={isAdvanced && Boolean(indicator.overlays?.length)} />
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm leading-6 text-slate-200">
          {isAdvanced ? indicator.advancedSummary : indicator.summary}
        </p>

        {isAdvanced ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock3 className="h-4 w-4" />
                Release cadence
              </div>
              <p className="mt-2">{indicator.releaseCadence}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-slate-400">
                <DatabaseZap className="h-4 w-4" />
                Source
              </div>
              <p className="mt-2">{indicator.source.name}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {indicator.watchList.slice(0, compact ? 2 : 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{indicator.module.replace("-", " ")}</div>
        <Link href={`/${indicator.module}`} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100">
          Open module
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
