"use client";

import { ExternalLink } from "lucide-react";

import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { MetaChip } from "@/components/meta-chip";
import { getHistoricalContext, getIndicatorSourceType } from "@/lib/indicator-insight";
import {
  cn,
  formatChange,
  formatFreshnessAge,
  formatIndicatorValue,
  formatReleaseLabel,
  formatTimestamp,
  titleCase
} from "@/lib/utils";
import type { HomepageIndicator } from "@/types/macro";

function statusTone(status: HomepageIndicator["status"]) {
  if (status === "live") {
    return "emerald" as const;
  }

  if (status === "fallback" || status === "stale-live") {
    return "amber" as const;
  }

  return "rose" as const;
}

function sourceTone(sourceType: ReturnType<typeof getIndicatorSourceType>) {
  if (sourceType === "official") {
    return "emerald" as const;
  }

  if (sourceType === "market-implied") {
    return "cyan" as const;
  }

  if (sourceType === "derived") {
    return "amber" as const;
  }

  return "slate" as const;
}

function contextTone(context: ReturnType<typeof getHistoricalContext>) {
  if (context.band === "extreme") {
    return "rose" as const;
  }

  if (context.band === "elevated") {
    return "amber" as const;
  }

  if (context.band === "low") {
    return "cyan" as const;
  }

  return "slate" as const;
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
  const sourceType = getIndicatorSourceType(indicator);
  const context = getHistoricalContext(indicator);

  return (
    <article id={indicator.slug} className="scroll-mt-28 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{indicator.unitLabel}</p>
          <h3 className="text-lg font-semibold text-white">{indicator.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <MetaChip label="Status" value={indicator.status} tone={statusTone(indicator.status)} />
          <IndicatorTooltip indicator={indicator} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MetaChip label="Source" value={titleCase(sourceType)} tone={sourceTone(sourceType)} />
        <MetaChip label="Context" value={context.contextLabel} tone={contextTone(context)} />
        <MetaChip label={context.percentileLabel} value={context.percentile !== null ? `${context.percentile}` : "\u2014"} tone={contextTone(context)} />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current</p>
          <p className="mt-2 text-4xl font-semibold text-white">
            {formatIndicatorValue(indicator.currentValue, indicator.unit)}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Today&apos;s read</p>
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
        <div className="rounded-[20px] border border-white/8 bg-slate-950/55 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Why this matters today</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{indicator.tooltips.whyItMatters}</p>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What to check next</p>
          <div className="mt-3">
            <IndicatorActionLinks indicator={indicator} />
          </div>
        </div>

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
            <p className="mt-2 text-sm text-slate-200">{formatTimestamp(indicator.updatedAt)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {indicator.release.type === "scheduled"
                ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                : `${indicator.release.detail} | ${formatFreshnessAge(indicator.freshnessAgeMinutes)}`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <MetaChip label="Age" value={formatFreshnessAge(indicator.freshnessAgeMinutes)} tone={statusTone(indicator.status)} />
          <MetaChip
            label="Next"
            value={
              indicator.nextReleaseAt
                ? formatTimestamp(indicator.nextReleaseAt)
                : indicator.release.type === "scheduled"
                  ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                  : indicator.release.detail
            }
            tone="slate"
            className="max-w-full"
          />
        </div>

        {indicator.errorMessage || indicator.fallbackUsageReason ? (
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {indicator.errorMessage ?? indicator.fallbackUsageReason}
          </p>
        ) : null}
      </div>
    </article>
  );
}
