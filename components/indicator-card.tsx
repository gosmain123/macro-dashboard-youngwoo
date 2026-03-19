"use client";

import { CalendarClock, ChevronDown, Clock3, DatabaseZap, ExternalLink, TriangleAlert } from "lucide-react";

import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { FollowUpLogicCard } from "@/components/follow-up-logic-card";
import { IndicatorWorkspaceActions } from "@/components/indicator-workspace-actions";
import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { MetaChip } from "@/components/meta-chip";
import { SparklineChart } from "@/components/sparkline-chart";
import { getHistoricalContext, getIndicatorSourceType } from "@/lib/indicator-insight";
import { getFollowUpLogic } from "@/lib/playbook-guide";
import {
  cn,
  formatChange,
  formatFreshnessAge,
  formatIndicatorValue,
  formatReleaseLabel,
  formatTimestamp,
  titleCase
} from "@/lib/utils";
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

function statusTone(status: MacroIndicator["status"]) {
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

export function IndicatorCard({
  indicator,
  visibleSlugs = [indicator.slug]
}: {
  indicator: MacroIndicator;
  visibleSlugs?: string[];
}) {
  const followUpLogic = getFollowUpLogic(indicator.slug);
  const sourceType = getIndicatorSourceType(indicator);
  const context = getHistoricalContext(indicator);

  return (
    <article id={indicator.slug} className="scroll-mt-28 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
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
            <MetaChip label="Status" value={indicator.status} tone={statusTone(indicator.status)} />
            <MetaChip label="Source" value={titleCase(sourceType)} tone={sourceTone(sourceType)} />
            <MetaChip label="Context" value={context.contextLabel} tone={contextTone(context)} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{indicator.unitLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{indicator.name}</h3>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Today&apos;s read
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{indicator.summary}</p>
        </div>
        <IndicatorTooltip indicator={indicator} />
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
            <p className="mt-1 text-xs text-slate-500">{formatTimestamp(indicator.updatedAt)}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarClock className="h-4 w-4" />
              {indicator.release.label}
            </div>
            <p className="mt-2 text-sm text-slate-200">
              {indicator.release.type === "scheduled"
                ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                : formatTimestamp(indicator.updatedAt)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {indicator.release.sourceName ?? indicator.release.detail}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MetaChip label={context.percentileLabel} value={context.percentile !== null ? `${context.percentile}` : "\u2014"} tone={contextTone(context)} />
        <MetaChip label={context.zScoreLabel} value={context.zScore !== null ? `${context.zScore > 0 ? "+" : ""}${context.zScore}` : "\u2014"} tone={contextTone(context)} />
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

      <div className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/55 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Why this matters today</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{indicator.tooltips.whyItMatters}</p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What to check next</p>
        <div className="mt-3">
          <IndicatorActionLinks indicator={indicator} />
        </div>
      </div>

      <div className="mt-4 mode-pro-only">
        <IndicatorWorkspaceActions slug={indicator.slug} name={indicator.name} visibleSlugs={visibleSlugs} />
      </div>

      {followUpLogic ? (
        <div className="mt-4 mode-beginner-only">
          <FollowUpLogicCard logic={followUpLogic} />
        </div>
      ) : null}

      <details className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/55 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-100">More context, source, and history</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
              Open if you need source detail, fetch state, and the trend line
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </summary>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Updated / Age</p>
            <p className="mt-2 text-sm text-slate-200">{formatTimestamp(indicator.updatedAt)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatFreshnessAge(indicator.freshnessAgeMinutes)}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Fetch state</p>
            <p className="mt-2 text-sm text-slate-200">{indicator.status}</p>
            <p className="mt-1 text-xs text-slate-500">
              {indicator.lastFailedFetch
                ? `Last failed fetch ${formatTimestamp(indicator.lastFailedFetch)}`
                : indicator.lastSuccessfulFetch
                  ? `Last successful fetch ${formatTimestamp(indicator.lastSuccessfulFetch)}`
                  : "No live fetch recorded yet"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock3 className="h-4 w-4" />
              Units
            </div>
            <p className="mt-2 text-sm text-slate-200">{indicator.unitLabel}</p>
            <p className="mt-1 text-xs text-slate-500">{indicator.releaseCadence}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <DatabaseZap className="h-4 w-4" />
              Source
            </div>
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
            <p className="mt-1 text-xs text-slate-500">{formatTimestamp(indicator.updatedAt)}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarClock className="h-4 w-4" />
              {indicator.release.label}
            </div>
            <p className="mt-2 text-sm text-slate-200">
              {indicator.release.type === "scheduled"
                ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
                : formatTimestamp(indicator.updatedAt)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{indicator.release.sourceName ?? indicator.release.detail}</p>
          </div>
        </div>

        {indicator.errorMessage || indicator.fallbackUsageReason ? (
          <div className="mt-4 rounded-2xl border border-white/8 bg-slate-900 p-3">
            <div className="flex items-start gap-2 text-slate-300">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
              <p className="text-sm leading-6">{indicator.errorMessage ?? indicator.fallbackUsageReason}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 mode-beginner-only">
          <IndicatorWorkspaceActions slug={indicator.slug} name={indicator.name} visibleSlugs={visibleSlugs} />
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/8 bg-slate-900 p-3">
          <SparklineChart
            data={indicator.chartHistory}
            frequency={indicator.frequency}
            unit={indicator.unit}
            showOverlay={Boolean(indicator.overlays?.length)}
          />
        </div>
      </details>
    </article>
  );
}
