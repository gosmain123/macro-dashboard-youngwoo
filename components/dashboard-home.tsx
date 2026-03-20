"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Clock3, TrendingUp } from "lucide-react";

import { HomepageIndicatorCard } from "@/components/homepage-indicator-card";
import { MetaChip } from "@/components/meta-chip";
import { useWorkspace } from "@/components/workspace-provider";
import { formatCalendarDate, formatChange, formatFreshnessAge, formatIndicatorValue, formatTimestamp } from "@/lib/utils";
import type { DashboardPayload, FreshnessStatus, HomepageIndicator } from "@/types/macro";

function getStatusMeta(payload: DashboardPayload, freshnessStatus: FreshnessStatus) {
  if (payload.dataMode === "demo") {
    return { label: "Fallback", tone: "amber" as const };
  }

  if (payload.homepage.freshness.errorCount > 0) {
    return { label: "Degraded", tone: "rose" as const };
  }

  if (payload.homepage.freshness.fallbackCount > 0 || payload.homepage.freshness.staleLiveCount > 0) {
    return { label: "Mixed", tone: "amber" as const };
  }

  return { label: freshnessStatus === "fresh" ? "Live" : "Stale", tone: freshnessStatus === "fresh" ? ("emerald" as const) : ("amber" as const) };
}

function firstSentence(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/.*?[.!?](?:\s|$)/);
  const sentence = match ? match[0].trim() : trimmed;

  if (sentence.length <= 180) {
    return sentence;
  }

  return `${sentence.slice(0, 177).trim()}...`;
}

function changeTone(indicator: HomepageIndicator) {
  if (indicator.tone === "positive") {
    return "text-[color:var(--positive-text)]";
  }

  if (indicator.tone === "negative") {
    return "text-[color:var(--negative-text)]";
  }

  return "text-[color:var(--neutral-text)]";
}

export function DashboardHome({ payload }: { payload: DashboardPayload }) {
  const { freshness, keyEvents, watchlist } = payload.homepage;
  const { applyIndicatorPreferences, watchlistSlugs } = useWorkspace();
  const orderedIndicators = applyIndicatorPreferences(payload.indicators);
  const personalizedWatchlist =
    watchlistSlugs.length > 0
      ? watchlistSlugs
          .map((slug) => orderedIndicators.find((indicator) => indicator.slug === slug))
          .filter((indicator): indicator is HomepageIndicator => Boolean(indicator))
      : applyIndicatorPreferences(watchlist);
  const keySignals = (personalizedWatchlist.length > 0 ? personalizedWatchlist : applyIndicatorPreferences(watchlist)).slice(0, 4);
  const changeLeaders = orderedIndicators
    .slice()
    .sort((left, right) => Math.abs(right.change) - Math.abs(left.change))
    .slice(0, 4);
  const nextCatalyst = keyEvents[0];
  const statusMeta = getStatusMeta(payload, freshness.freshnessStatus);
  const nextSteps = [
    {
      href: "/calendar",
      title: "Check the catalyst",
      detail: nextCatalyst
        ? `${nextCatalyst.title} | ${formatCalendarDate(nextCatalyst.date)} ${nextCatalyst.timeLabel}`
        : "Open Calendar for the next scheduled release."
    },
    {
      href: "/workflow",
      title: "Read surprise and revision",
      detail: "Workflow shows what surprised, what got revised, and what to confirm next."
    },
    {
      href: "/rates-credit",
      title: "Confirm in rates and credit",
      detail: "Use the 2Y, 10Y, IG, and HY spread cards to sanity-check the move."
    },
    {
      href: "/macro-flow",
      title: "Build the view",
      detail: "Use Macro Flow before turning one print into a bigger macro call."
    }
  ] as const;

  return (
    <div className="min-w-0 space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="section-kicker">Macro summary</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
              {payload.regimeSnapshot.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">
              {firstSentence(payload.regimeSnapshot.summary)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetaChip label="Status" value={statusMeta.label} tone={statusMeta.tone} />
            <MetaChip label="Updated" value={formatFreshnessAge(freshness.minutesSinceUpdate)} tone="slate" />
            {nextCatalyst ? <MetaChip label="Next" value={nextCatalyst.title} tone="slate" className="max-w-[18rem]" /> : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">4 key signals</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">The first cards to scan</h2>
          </div>
          <p className="text-sm text-[color:var(--text-muted)]">Tap a card to open details when you need more context.</p>
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
          {keySignals.map((indicator) => (
            <HomepageIndicatorCard key={indicator.slug} indicator={indicator} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="surface-card min-w-0 overflow-hidden rounded-[28px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">What changed today</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">The fastest shifts on the board</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-[color:var(--accent-strong)]" />
          </div>

          <div className="mt-5 space-y-3">
            {changeLeaders.map((indicator) => (
              <Link
                key={indicator.slug}
                href={`/${indicator.module}#${indicator.slug}`}
                className="surface-inset flex min-h-[6.5rem] min-w-0 items-start justify-between gap-4 overflow-hidden rounded-[22px] p-4 transition hover:border-[color:var(--border-strong)]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">{indicator.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)] line-clamp-2">{indicator.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">{formatIndicatorValue(indicator.currentValue, indicator.unit)}</p>
                  <p className={`mt-1 text-sm font-medium ${changeTone(indicator)}`}>{formatChange(indicator.change, indicator.unit)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card min-w-0 overflow-hidden rounded-[28px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Where to go next</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Keep the workflow simple</h2>
            </div>
            <CalendarClock className="h-5 w-5 text-[color:var(--accent-strong)]" />
          </div>

          <div className="mt-5 space-y-3">
            {nextSteps.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="surface-inset flex min-h-[6.5rem] min-w-0 items-start justify-between gap-4 overflow-hidden rounded-[22px] p-4 transition hover:border-[color:var(--border-strong)]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{step.detail}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
              <Clock3 className="h-4 w-4" />
              Last refresh
            </div>
            <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{formatTimestamp(freshness.lastUpdated)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

