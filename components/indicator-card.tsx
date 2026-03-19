"use client";

import { CalendarClock, Clock3, DatabaseZap } from "lucide-react";

import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { SparklineChart } from "@/components/sparkline-chart";
import { cn, formatChange, formatIndicatorValue, formatReleaseLabel, formatTimestamp } from "@/lib/utils";
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

function statusStyles(status: MacroIndicator["status"]) {
  if (status === "fallback") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "stale") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function IndicatorCard({ indicator }: { indicator: MacroIndicator }) {
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
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                statusStyles(indicator.status)
              )}
            >
              {indicator.status}
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{indicator.unitLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{indicator.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{indicator.summary}</p>
        </div>
        <IndicatorTooltip title={indicator.name} tooltip={indicator.tooltips} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current</p>
          <div className="mt-2 text-4xl font-semibold text-white">
            {formatIndicatorValue(indicator.currentValue, indicator.unit)}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {`Prior ${formatIndicatorValue(indicator.priorValue, indicator.unit)} | Change ${formatChange(indicator.change, indicator.unit)}`}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock3 className="h-4 w-4" />
              Units
            </div>
            <p className="mt-2 text-sm text-slate-200">{indicator.unitLabel}</p>
            <p className="mt-1 text-xs text-slate-500">{indicator.releaseCadence}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <DatabaseZap className="h-4 w-4" />
              Source
            </div>
            <p className="mt-2 text-sm text-slate-200">{indicator.source.name}</p>
            <p className="mt-1 text-xs text-slate-500">{formatTimestamp(indicator.lastUpdated)}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarClock className="h-4 w-4" />
              {indicator.release.label}
            </div>
            <p className="mt-2 text-sm text-slate-200">
              {indicator.release.type === "scheduled"
                ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                : formatTimestamp(indicator.lastUpdated)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {indicator.release.sourceName ?? indicator.release.detail}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-white/8 bg-slate-950/55 p-3">
        <SparklineChart
          data={indicator.chartHistory}
          frequency={indicator.frequency}
          unit={indicator.unit}
          showOverlay={Boolean(indicator.overlays?.length)}
        />
      </div>
    </article>
  );
}
