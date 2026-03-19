"use client";

import Link from "next/link";
import { CalendarClock, Clock3, Newspaper, Radar, Sparkles, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";

import { cn, formatDateLabel, formatIndicatorValue, formatReleaseLabel, formatTimestamp } from "@/lib/utils";
import type {
  ReleaseRevisionFlag,
  ReleaseSurpriseFlag,
  WorkflowChangeItem,
  WorkflowHeadlineItem,
  WorkflowPayload,
  WorkflowReleaseRadarItem,
  WorkflowSurpriseItem
} from "@/types/macro";

type WorkflowTabId = "release-radar" | "surprises" | "headlines" | "changes";

const tabs: Array<{ id: WorkflowTabId; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "release-radar", label: "Release Radar", icon: Radar },
  { id: "surprises", label: "Surprises & Revisions", icon: TrendingUp },
  { id: "headlines", label: "Headlines", icon: Newspaper },
  { id: "changes", label: "What Changed", icon: Sparkles }
];

function statusStyles(status: WorkflowReleaseRadarItem["status"]) {
  if (status === "fallback" || status === "stale") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

function surpriseStyles(flag: ReleaseSurpriseFlag) {
  if (flag === "above") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (flag === "below") {
    return "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100";
  }

  if (flag === "inline") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

function revisionStyles(flag: ReleaseRevisionFlag) {
  if (flag === "revised") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (flag === "none") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

function formatOptionalValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  return formatIndicatorValue(value, unit);
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

function ReleaseRadarTab({ items, updatedAt }: { items: WorkflowReleaseRadarItem[]; updatedAt: string }) {
  const nextRelease = items[0];
  const consensusCoverage = items.filter((item) => item.consensusValue !== null && item.consensusValue !== undefined).length;
  const fallbackCount = items.filter((item) => item.status === "fallback").length;

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
          <p className="mt-2 text-sm text-slate-300">Based on tracked official release calendars.</p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Consensus coverage</p>
          <p className="mt-3 text-lg font-semibold text-white">{consensusCoverage} / {items.length}</p>
          <p className="mt-2 text-sm text-slate-300">Blank consensus fields stay explicit until a preview feed is connected.</p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Fallback rows</p>
          <p className="mt-3 text-lg font-semibold text-white">{fallbackCount}</p>
          <p className="mt-2 text-sm text-slate-300">Rows still show source and status so trust checks stay quick.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">
                    {item.moduleTitle}
                  </span>
                  <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", statusStyles(item.status))}>
                    {item.status}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{item.indicatorName}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {item.nextReleaseDate ? formatReleaseLabel(item.nextReleaseDate, item.timeLabel) : "Official schedule pending"}
                </p>
              </div>
              <Link
                href={`/${item.module}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:text-white"
              >
                Open module
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Latest actual</p>
                <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.latestActualValue, item.unit)}</p>
                <p className="mt-1 text-xs text-slate-500">{item.unitLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Prior</p>
                <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.priorValue, item.unit)}</p>
                <p className="mt-1 text-xs text-slate-500">Last published comparison</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Consensus</p>
                <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.consensusValue, item.unit)}</p>
                <p className="mt-1 text-xs text-slate-500">If available from tracked previews</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", surpriseStyles(item.surpriseFlag))}>
                Surprise: {item.surpriseFlag}
              </span>
              <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", revisionStyles(item.revisionFlag))}>
                Revision: {item.revisionFlag}
              </span>
              {item.surpriseMagnitude !== null && item.surpriseMagnitude !== undefined ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  Magnitude {formatOptionalValue(item.surpriseMagnitude, item.unit)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Source</p>
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 text-sm text-slate-200 transition hover:text-white">
                    {item.sourceName}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-200">{item.sourceName}</p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Linked workflow</p>
                <p className="mt-2 text-sm text-slate-200">{item.linkedIndicators.join(" · ")}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SurprisesTab({ items }: { items: WorkflowSurpriseItem[] }) {
  const grouped = groupSurprises(items);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Recent releases</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Actuals come from the current indicator feed. Consensus and revision fields stay visibly blank or pending when a structured release snapshot is not yet connected.
        </p>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{category}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {categoryItems.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", statusStyles(item.status))}>
                        {item.status}
                      </span>
                      <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", surpriseStyles(item.surpriseFlag))}>
                        Surprise: {item.surpriseFlag}
                      </span>
                      <span className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", revisionStyles(item.revisionFlag))}>
                        Revision: {item.revisionFlag}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-white">{item.indicatorName}</h2>
                    <p className="mt-2 text-sm text-slate-300">{formatDateLabel(item.releaseDate)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Actual</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.actualValue, item.unit)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Consensus</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatOptionalValue(item.consensusValue, item.unit)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Prior</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatIndicatorValue(item.priorValue, item.unit)}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">{item.whyItMatters}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-200 transition hover:text-white">
                    {item.sourceName}
                  </a>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.linkedIndicators.join(" · ")}</p>
                </div>
              </article>
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {item.sourceName} · {formatTimestamp(item.publishedAt)}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{item.title}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{item.whyItMatters}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-200 transition hover:text-white">
                    Open source
                  </a>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.linkedIndicators.join(" · ")}</p>
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
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">{item.linkedIndicators.join(" · ")}</p>
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
          <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">
            Move from what matters next, to what surprised, to what credible desks and official sources are saying, without leaving the dashboard.
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
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Headlines stay curated and low-noise. Release rows keep source, status, and missing-consensus states visible.
          </p>
        </aside>
      </section>

      <section className="space-y-5">
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
