"use client";

import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  Newspaper,
  Radar,
  Sparkles,
  TrendingUp
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";

import { MetaChip } from "@/components/meta-chip";
import { WorkflowSurpriseHeatmap } from "@/components/workflow-surprise-heatmap";
import { cn, formatDateLabel, formatFreshnessAge, formatIndicatorValue, formatReleaseLabel, formatTimestamp, titleCase } from "@/lib/utils";
import type {
  HistoricalContextBand,
  IndicatorSourceType,
  ReleaseRevisionFlag,
  ReleaseSurpriseFlag,
  WorkflowChangeItem,
  WorkflowHeadlineItem,
  WorkflowPayload,
  WorkflowPreviewState,
  WorkflowReleaseRadarItem,
  WorkflowReleaseState,
  WorkflowSurpriseItem
} from "@/types/macro";

type WorkflowTabId = "release-radar" | "surprises" | "headlines" | "changes";

const tabs: Array<{ id: WorkflowTabId; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "release-radar", label: "Release Radar", icon: Radar },
  { id: "surprises", label: "Surprises & Revisions", icon: TrendingUp },
  { id: "headlines", label: "Headlines", icon: Newspaper },
  { id: "changes", label: "What Changed", icon: Sparkles }
];

function statusTone(status: WorkflowReleaseRadarItem["status"]) {
  if (status === "live") {
    return "emerald" as const;
  }

  if (status === "fallback" || status === "stale-live") {
    return "amber" as const;
  }

  return "rose" as const;
}

function sourceTypeTone(sourceType: IndicatorSourceType) {
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

function bandTone(band: HistoricalContextBand) {
  if (band === "extreme") {
    return "rose" as const;
  }

  if (band === "elevated") {
    return "amber" as const;
  }

  if (band === "low") {
    return "cyan" as const;
  }

  return "slate" as const;
}

function surpriseTone(flag: ReleaseSurpriseFlag) {
  if (flag === "above") {
    return "cyan" as const;
  }

  if (flag === "below") {
    return "rose" as const;
  }

  if (flag === "inline") {
    return "emerald" as const;
  }

  return "slate" as const;
}

function revisionTone(flag: ReleaseRevisionFlag) {
  if (flag === "revised") {
    return "amber" as const;
  }

  if (flag === "none") {
    return "emerald" as const;
  }

  return "slate" as const;
}

function previewTone(state: WorkflowPreviewState) {
  return state === "connected" ? ("emerald" as const) : ("amber" as const);
}

function releaseStateTone(state: WorkflowReleaseState) {
  return state === "pending-release" ? ("cyan" as const) : ("amber" as const);
}

function formatOptionalValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  return formatIndicatorValue(value, unit);
}

function formatOptionalSignedValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  const sign = value > 0 ? "+" : "";

  if (unit === "%" || unit === "usd" || unit === "usd/oz" || unit === "bps" || unit === "$tn" || unit === "$bn" || unit === "k") {
    return `${sign}${formatIndicatorValue(value, unit)}`;
  }

  return `${sign}${value.toFixed(1)}`;
}

function formatContextZScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function formatReleaseState(state: WorkflowReleaseState) {
  return state === "pending-release" ? "Pending release" : "Schedule pending";
}

function formatPreviewState(state: WorkflowPreviewState) {
  return state === "connected" ? "Preview connected" : "Preview missing";
}

function countNextWeek(items: WorkflowReleaseRadarItem[], updatedAt: string) {
  const reference = new Date(updatedAt).getTime();

  return items.filter((item) => {
    if (!item.nextReleaseDate) {
      return false;
    }

    const releaseTime = new Date(`${item.nextReleaseDate}T12:00:00Z`).getTime();
    const diffDays = Math.round((releaseTime - reference) / 86400000);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
}

function groupHeadlines(items: WorkflowHeadlineItem[]) {
  return items.reduce<Record<WorkflowHeadlineItem["bucket"], WorkflowHeadlineItem[]>>(
    (groups, item) => {
      groups[item.bucket].push(item);
      return groups;
    },
    {
      "Official releases": [],
      "Market interpretation": [],
      "Fed / central bank": []
    }
  );
}

function groupSurprises(items: WorkflowSurpriseItem[]) {
  return items.reduce<Record<WorkflowSurpriseItem["category"], WorkflowSurpriseItem[]>>(
    (groups, item) => {
      groups[item.category].push(item);
      return groups;
    },
    {
      inflation: [],
      growth: [],
      labor: [],
      policy: []
    }
  );
}

function groupChanges(items: WorkflowChangeItem[]) {
  return items.reduce<Record<WorkflowChangeItem["bucket"], WorkflowChangeItem[]>>(
    (groups, item) => {
      groups[item.bucket].push(item);
      return groups;
    },
    {
      "Indicator shifts": [],
      "Cross-asset moves": [],
      "New releases": [],
      "Up next": []
    }
  );
}

function ReleaseRadarCard({ item }: { item: WorkflowReleaseRadarItem }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <MetaChip label="Module" value={item.moduleTitle} tone="cyan" />
            <MetaChip label="Source" value={titleCase(item.sourceType)} tone={sourceTypeTone(item.sourceType)} />
            <MetaChip label="Status" value={item.status} tone={statusTone(item.status)} />
            <MetaChip label="Context" value={item.historicalContextLabel} tone={bandTone(item.historicalBand)} />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">{item.indicatorName}</h2>
          <p className="mt-2 text-sm text-slate-300">
            {item.nextReleaseDate ? formatReleaseLabel(item.nextReleaseDate, item.timeLabel) : "Official schedule pending"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaChip label="Release" value={formatReleaseState(item.releaseState)} tone={releaseStateTone(item.releaseState)} />
          <MetaChip label="Preview" value={formatPreviewState(item.previewState)} tone={previewTone(item.previewState)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Actual</p>
          <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.actualValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Prior</p>
          <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.priorValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Revised prior</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.revisedPriorValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Consensus</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.consensusValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Surprise</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MetaChip label="Flag" value={item.surpriseFlag} tone={surpriseTone(item.surpriseFlag)} />
            <span className="text-sm font-medium text-white">{formatOptionalSignedValue(item.surpriseMagnitude, item.unit)}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">3m avg surprise</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatOptionalSignedValue(item.threeMonthAverageSurprise, item.unit)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MetaChip label={item.historicalPercentileLabel ?? "Pct"} value={item.historicalPercentile !== null && item.historicalPercentile !== undefined ? `${item.historicalPercentile}` : "\u2014"} tone={bandTone(item.historicalBand)} />
        <MetaChip label={item.historicalZScoreLabel ?? "Z"} value={formatContextZScore(item.historicalZScore)} tone={bandTone(item.historicalBand)} />
        <MetaChip label="Revision" value={item.revisionFlag} tone={revisionTone(item.revisionFlag)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Updated</p>
          <p className="mt-2 text-sm text-slate-200">{formatTimestamp(item.updatedAt)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Freshness age</p>
          <p className="mt-2 text-sm text-slate-200">{formatFreshnessAge(item.freshnessAgeMinutes)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Next release</p>
          <p className="mt-2 text-sm text-slate-200">{item.nextReleaseAt ? formatTimestamp(item.nextReleaseAt) : "Schedule pending"}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Source name</p>
          {item.sourceUrl ? (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 text-sm text-slate-200 transition hover:text-white">
              {item.sourceName}
            </a>
          ) : (
            <p className="mt-2 text-sm text-slate-200">{item.sourceName}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Why this matters today</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{item.whyThisMattersToday}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">What to confirm next</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{item.whatToConfirmNext}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Linked checks</p>
          <p className="mt-2 text-sm text-slate-200">{item.linkedIndicators.join(" | ")}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={item.moduleHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            Open module
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={item.playbookHref}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/40"
          >
            {item.playbookLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ReleaseRadarTab({ items, updatedAt }: { items: WorkflowReleaseRadarItem[]; updatedAt: string }) {
  const nextRelease = items[0];
  const consensusCoverage = items.filter((item) => item.consensusValue !== null && item.consensusValue !== undefined).length;
  const previewConnected = items.filter((item) => item.previewState === "connected").length;
  const fallbackCount = items.filter((item) => item.status === "fallback").length;
  const staleLiveCount = items.filter((item) => item.status === "stale-live").length;
  const errorCount = items.filter((item) => item.status === "error").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Next release</p>
          <p className="mt-3 text-lg font-semibold text-white">{nextRelease?.indicatorName ?? "Schedule pending"}</p>
          <p className="mt-2 text-sm text-slate-300">
            {nextRelease ? formatReleaseLabel(nextRelease.nextReleaseDate, nextRelease.timeLabel) : "No scheduled event"}
          </p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">This week</p>
          <p className="mt-3 text-lg font-semibold text-white">{countNextWeek(items, updatedAt)} scheduled releases</p>
          <p className="mt-2 text-sm text-slate-300">Rows now separate release timing from preview-feed coverage.</p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Consensus coverage</p>
          <p className="mt-3 text-lg font-semibold text-white">{consensusCoverage} / {items.length}</p>
          <p className="mt-2 text-sm text-slate-300">{previewConnected} rows have structured preview context connected.</p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Fallback / stale / error</p>
          <p className="mt-3 text-lg font-semibold text-white">{fallbackCount} / {staleLiveCount} / {errorCount}</p>
          <p className="mt-2 text-sm text-slate-300">Trust badges stay visible so last-good live is never confused with fallback.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ReleaseRadarCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SurpriseCard({ item }: { item: WorkflowSurpriseItem }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <MetaChip label="Source" value={titleCase(item.sourceType)} tone={sourceTypeTone(item.sourceType)} />
            <MetaChip label="Status" value={item.status} tone={statusTone(item.status)} />
            <MetaChip label="Context" value={item.historicalContextLabel} tone={bandTone(item.historicalBand)} />
            <MetaChip label="Surprise" value={item.surpriseFlag} tone={surpriseTone(item.surpriseFlag)} />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">{item.indicatorName}</h2>
          <p className="mt-2 text-sm text-slate-300">{formatDateLabel(item.releaseDate)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaChip label="Revision" value={item.revisionFlag} tone={revisionTone(item.revisionFlag)} />
          <MetaChip label={item.historicalPercentileLabel ?? "Pct"} value={item.historicalPercentile !== null && item.historicalPercentile !== undefined ? `${item.historicalPercentile}` : "\u2014"} tone={bandTone(item.historicalBand)} />
          <MetaChip label={item.historicalZScoreLabel ?? "Z"} value={formatContextZScore(item.historicalZScore)} tone={bandTone(item.historicalBand)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Actual</p>
          <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.actualValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Prior</p>
          <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.priorValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Revised prior</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.revisedPriorValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Consensus</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.consensusValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Surprise</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalSignedValue(item.surpriseMagnitude, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">3m avg surprise</p>
          <p className="mt-2 text-sm font-medium text-white">{formatOptionalSignedValue(item.threeMonthAverageSurprise, item.unit)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Updated</p>
          <p className="mt-2 text-sm text-slate-200">{formatTimestamp(item.updatedAt)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Freshness age</p>
          <p className="mt-2 text-sm text-slate-200">{formatFreshnessAge(item.freshnessAgeMinutes)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Next release</p>
          <p className="mt-2 text-sm text-slate-200">{item.nextReleaseAt ? formatTimestamp(item.nextReleaseAt) : "Schedule pending"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Why this matters today</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{item.whyItMatters}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">What to confirm next</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{item.whatToConfirmNext}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Linked checks</p>
          <p className="mt-2 text-sm text-slate-200">{item.linkedIndicators.join(" | ")}</p>
          {item.sourceUrl ? (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-slate-500 transition hover:text-slate-300">
              {item.sourceName}
            </a>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{item.sourceName}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={item.moduleHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            Open module
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={item.playbookHref}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/40"
          >
            {item.playbookLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SurprisesTab({ items }: { items: WorkflowSurpriseItem[] }) {
  const grouped = groupSurprises(items);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Recent releases</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Every release card now shows actual, prior, revised prior, consensus, surprise, 3m average surprise, trust state, and the next thing to confirm.
        </p>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{category}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {categoryItems.map((item) => (
              <SurpriseCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function HeadlinesTab({ items }: { items: WorkflowHeadlineItem[] }) {
  const grouped = groupHeadlines(items);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([bucket, bucketItems]) => (
        <section key={bucket} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{bucket}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {bucketItems.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {item.sourceName} | {formatTimestamp(item.publishedAt)}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{item.title}</h2>
                  </div>
                  <MetaChip label="Bucket" value={bucket} tone="cyan" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{item.whyItMatters}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-200 transition hover:text-white">
                    Open source
                  </a>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.linkedIndicators.join(" | ")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ChangesTab({ items }: { items: WorkflowChangeItem[] }) {
  const grouped = groupChanges(items);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([bucket, bucketItems]) => (
        <section key={bucket} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{bucket}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {bucketItems.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">{item.linkedIndicators.join(" | ")}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function WorkflowBoard({ payload }: { payload: WorkflowPayload }) {
  const [activeTab, setActiveTab] = useState<WorkflowTabId>("release-radar");
  const nextRelease = payload.releaseRadar[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Workflow</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Daily macro workflow</h1>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300 mode-beginner-only">
            Read the release, compare it with prior and consensus, check whether the surprise is real, then confirm the move in the next part of the dashboard.
          </p>
        </div>

        <aside className="rounded-[34px] border border-white/10 bg-slate-950/55 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock3 className="h-4 w-4" />
            Updated
          </div>
          <p className="mt-3 text-lg font-semibold text-white">{formatTimestamp(payload.updatedAt)}</p>
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarClock className="h-4 w-4" />
              Next on deck
            </div>
            <p className="mt-3 text-base font-semibold text-white">{nextRelease?.indicatorName ?? "Schedule pending"}</p>
            <p className="mt-2 text-sm text-slate-300">
              {nextRelease ? formatReleaseLabel(nextRelease.nextReleaseDate, nextRelease.timeLabel) : "No event scheduled"}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip label="Trust" value="Visible" tone="emerald" />
            <MetaChip label="Preview gap" value="Explicit" tone="amber" />
            <MetaChip label="Follow-up" value="Linked" tone="cyan" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300 mode-beginner-only">
            Pending release timing and missing preview coverage are now shown as separate states so users can tell whether data is simply not out yet or not connected.
          </p>
        </aside>
      </section>

      <section className="space-y-5">
        <WorkflowSurpriseHeatmap items={payload.surprises} updatedAt={payload.updatedAt} />

        <nav className="flex flex-wrap gap-2" aria-label="Workflow tabs">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "border-cyan-300/70 bg-cyan-300/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "release-radar" ? <ReleaseRadarTab items={payload.releaseRadar} updatedAt={payload.updatedAt} /> : null}
        {activeTab === "surprises" ? <SurprisesTab items={payload.surprises} /> : null}
        {activeTab === "headlines" ? <HeadlinesTab items={payload.headlines} /> : null}
        {activeTab === "changes" ? <ChangesTab items={payload.changes} /> : null}
      </section>
    </div>
  );
}


