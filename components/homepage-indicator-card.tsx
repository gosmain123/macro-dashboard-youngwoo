"use client";

import { ExternalLink } from "lucide-react";

import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { cn, formatChange, formatIndicatorValue, formatReleaseLabel, formatTimestamp } from "@/lib/utils";
import type { HomepageIndicator } from "@/types/macro";

function statusStyles(status: HomepageIndicator["status"]) {
  if (status === "fallback") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "stale") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

function changeStyles(indicator: HomepageIndicator) {
  if (indicator.tone === "positive") {
    return "text-emerald-200";
  }

  if (indicator.tone === "negative") {
    return "text-rose-200";
  }

  return "text-slate-200";
}

export function HomepageIndicatorCard({ indicator }: { indicator: HomepageIndicator }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{indicator.unitLabel}</p>
          <h3 className="text-lg font-semibold text-white">{indicator.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              statusStyles(indicator.status)
            )}
          >
            {indicator.status}
          </span>
          <IndicatorTooltip title={indicator.name} tooltip={indicator.tooltips} />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current</p>
          <p className="mt-2 text-4xl font-semibold text-white">
            {formatIndicatorValue(indicator.currentValue, indicator.unit)}
          </p>
          <p className="mt-2 text-sm text-slate-300 line-clamp-2">{indicator.summary}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Prior / Delta</p>
          <p className="mt-2 text-sm text-slate-200">
            {formatIndicatorValue(indicator.priorValue, indicator.unit)}
          </p>
          <p className={cn("mt-1 text-sm font-medium", changeStyles(indicator))}>
            {formatChange(indicator.change, indicator.unit)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-white/8 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Source</p>
            {indicator.source.url ? (
              <a
                href={indicator.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-slate-200 transition hover:text-white"
              >
                {indicator.source.name}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-200">{indicator.source.name}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {indicator.release.sourceName ?? indicator.release.detail}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Updated</p>
            <p className="mt-2 text-sm text-slate-200">{formatTimestamp(indicator.lastUpdated)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {indicator.release.type === "scheduled"
                ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                : indicator.release.detail}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
