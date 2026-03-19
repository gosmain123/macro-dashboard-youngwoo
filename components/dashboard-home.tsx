"use client";

import { AlertTriangle, Clock3, DatabaseZap, ShieldCheck } from "lucide-react";

import { HomepageIndicatorCard } from "@/components/homepage-indicator-card";
import { RegimeCard } from "@/components/regime-card";
import { cn, formatCalendarDate, formatTimestamp } from "@/lib/utils";
import type { DashboardPayload, FreshnessStatus } from "@/types/macro";

function freshnessPill(status: FreshnessStatus) {
  if (status === "stale") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function DashboardHome({ payload }: { payload: DashboardPayload }) {
  const { freshness, keyEvents, watchlist } = payload.homepage;
  const hasFallbackCards = freshness.fallbackCount > 0;
  const hasTrustWarning = payload.dataMode === "demo" || freshness.freshnessStatus === "stale" || hasFallbackCards;
  const statusBadge =
    payload.dataMode === "demo"
      ? "Fallback"
      : hasFallbackCards
        ? "Mixed"
        : freshness.freshnessStatus;
  const statusBadgeClass =
    payload.dataMode === "demo" || hasFallbackCards
      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
      : freshnessPill(freshness.freshnessStatus);
  const topTrustLine =
    payload.dataMode === "demo"
      ? "Live backend unavailable; fallback data is showing."
      : hasFallbackCards
        ? `${freshness.liveCount} homepage cards are synced live and ${freshness.fallbackCount} are using labeled fallback data.`
      : freshness.freshnessStatus === "stale"
        ? `Refresh is outside the ${freshness.staleAfterMinutes}-minute window.`
        : `${freshness.liveCount} homepage cards are synced live with no fallback cards on the watchlist.`;
  const bottomTrustLine =
    payload.dataMode === "demo"
      ? "Reconnect the live refresh pipeline before relying on this monitor."
      : hasFallbackCards
        ? "Some cards are still showing clearly labeled reference values instead of synced live observations."
      : freshness.freshnessStatus === "stale"
        ? `Latest dashboard refresh is ${freshness.minutesSinceUpdate} minutes old.`
        : "Monitor is inside the freshness window.";
  const TrustIcon = hasTrustWarning ? AlertTriangle : ShieldCheck;

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Regime Summary</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {payload.regimeSnapshot.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{payload.regimeSnapshot.summary}</p>
          </div>

          <aside className="rounded-[34px] border border-white/10 bg-slate-950/55 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Freshness</p>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  statusBadgeClass
                )}
              >
                {statusBadge}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Last updated</p>
                <p className="mt-2 text-sm font-medium text-white">{formatTimestamp(freshness.lastUpdated)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Cadence</p>
                <p className="mt-2 text-sm font-medium text-white">{freshness.refreshCadence}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{topTrustLine}</p>
          </aside>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {payload.regimeCards.map((card) => (
            <RegimeCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Core Watchlist</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The first indicators worth checking each day</h2>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {watchlist.map((indicator) => (
            <HomepageIndicatorCard key={indicator.slug} indicator={indicator} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">This Week&apos;s Key Events</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">The scheduled releases most likely to move the tape</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {keyEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                {formatCalendarDate(event.date)} {String.fromCharCode(183)} {event.timeLabel}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">{event.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300 line-clamp-3">{event.whyItMatters}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Freshness / Last Updated
          </p>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_0.95fr_1fr_1.4fr]">
            <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock3 className="h-4 w-4" />
                Last updated
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{formatTimestamp(freshness.lastUpdated)}</p>
              <p className="mt-1 text-sm text-slate-500">
                {freshness.minutesSinceUpdate === 0 ? "just now" : `${freshness.minutesSinceUpdate} min ago`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock3 className="h-4 w-4" />
                Auto-refresh
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{freshness.refreshCadence}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <DatabaseZap className="h-4 w-4" />
                Live / fallback
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {freshness.liveCount} live / {freshness.fallbackCount} fallback
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {freshness.officialCount} official / {freshness.manualCount} manual on the watchlist
              </p>
            </div>

            <div
              className={cn(
                "rounded-2xl border p-4",
                hasTrustWarning
                  ? "border-amber-300/20 bg-amber-300/10"
                  : "border-emerald-300/20 bg-emerald-300/10"
              )}
            >
              <div className="flex items-start gap-3">
                <TrustIcon
                  className={cn("mt-0.5 h-5 w-5 shrink-0", hasTrustWarning ? "text-amber-200" : "text-emerald-200")}
                />
                <div>
                  <p className="text-sm font-medium text-white">{bottomTrustLine}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Source labels are visible on the homepage cards so trust can be checked quickly before interpretation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
