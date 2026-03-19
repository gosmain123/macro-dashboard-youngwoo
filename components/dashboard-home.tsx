"use client";

import Link from "next/link";
import { AlertTriangle, Clock3, DatabaseZap, ShieldCheck } from "lucide-react";

import { HomepageIndicatorCard } from "@/components/homepage-indicator-card";
import { RegimeCard } from "@/components/regime-card";
import { WorkspaceToolbar } from "@/components/workspace-toolbar";
import { useWorkspace } from "@/components/workspace-provider";
import { getLayerHomeCards, type LayerHomeCard } from "@/lib/layer-pages";
import { cn, formatCalendarDate, formatTimestamp } from "@/lib/utils";
import type { DashboardPayload, FreshnessStatus } from "@/types/macro";

function freshnessPill(status: FreshnessStatus) {
  if (status === "stale") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

function layerPill(card: LayerHomeCard) {
  if (card.errorCount > 0) {
    return {
      label: "Degraded",
      className: "border-rose-300/30 bg-rose-300/10 text-rose-100"
    };
  }

  if (card.fallbackCount > 0 || card.staleLiveCount > 0) {
    return {
      label: "Mixed",
      className: "border-amber-300/30 bg-amber-300/10 text-amber-100"
    };
  }

  return {
    label: "Live",
    className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
  };
}

export function DashboardHome({ payload }: { payload: DashboardPayload }) {
  const { freshness, keyEvents, watchlist } = payload.homepage;
  const { applyIndicatorPreferences, watchlistSlugs } = useWorkspace();
  const homeIndicators = applyIndicatorPreferences(payload.indicators);
  const personalizedWatchlist =
    watchlistSlugs.length > 0
      ? watchlistSlugs
          .map((slug) => homeIndicators.find((indicator) => indicator.slug === slug))
          .filter((indicator): indicator is (typeof payload.indicators)[number] => Boolean(indicator))
      : applyIndicatorPreferences(watchlist);
  const visibleWatchlist = personalizedWatchlist.length > 0 ? personalizedWatchlist : applyIndicatorPreferences(watchlist);
  const nextCatalyst = keyEvents[0];
  const startHereSteps = [
    {
      label: "Step 1",
      title: "Read the regime summary",
      href: "#regime-summary",
      detail: payload.regimeSnapshot.title
    },
    {
      label: "Step 2",
      title: "Check today's catalyst",
      href: "/calendar",
      detail: nextCatalyst ? nextCatalyst.title : "Open Calendar"
    },
    {
      label: "Step 3",
      title: "Read the core watchlist",
      href: "#core-watchlist",
      detail: "Use the homepage cards first"
    },
    {
      label: "Step 4",
      title: "Check surprise and revision",
      href: "/workflow",
      detail: "Workflow shows what changed"
    },
    {
      label: "Step 5",
      title: "Confirm in rates and credit",
      href: "/rates-credit",
      detail: "2Y, 10Y, IG, and HY keep you honest"
    }
  ] as const;
  const layerCards = getLayerHomeCards(payload);
  const hasFallbackCards = freshness.fallbackCount > 0 || freshness.errorCount > 0;
  const hasTrustWarning =
    payload.dataMode === "demo" ||
    freshness.freshnessStatus === "stale" ||
    freshness.staleLiveCount > 0 ||
    hasFallbackCards;
  const statusBadge =
    payload.dataMode === "demo"
      ? "Unavailable"
      : freshness.errorCount > 0
        ? "Degraded"
        : hasFallbackCards || freshness.staleLiveCount > 0
        ? "Mixed"
        : freshness.freshnessStatus;
  const statusBadgeClass =
    payload.dataMode === "demo" || hasFallbackCards || freshness.staleLiveCount > 0
      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
      : freshnessPill(freshness.freshnessStatus);
  const topTrustLine =
    payload.dataMode === "demo"
      ? "Live storage is unavailable, so seeded fallback data is showing."
      : freshness.errorCount > 0 || hasFallbackCards || freshness.staleLiveCount > 0
        ? `${freshness.liveCount} live, ${freshness.staleLiveCount} stale-live, ${freshness.fallbackCount} fallback, ${freshness.errorCount} error on the homepage watchlist.`
      : freshness.freshnessStatus === "stale"
        ? `Refresh is outside the ${freshness.staleAfterMinutes}-minute window.`
        : `${freshness.liveCount} homepage cards are synced live with no fallback cards on the watchlist.`;
  const bottomTrustLine =
    payload.dataMode === "demo"
      ? "Reconnect live storage or refresh writes before relying on this monitor."
      : freshness.errorCount > 0
        ? "Some live providers failed and are now explicitly marked error or stale-live instead of silently dropping to demo mode."
        : hasFallbackCards
          ? "Fallback remains enabled as a last resort and is explicitly labeled on each card."
        : freshness.staleLiveCount > 0
          ? "Last-good live values are being served for some cards because the latest refresh attempt failed or aged out."
        : freshness.freshnessStatus === "stale"
          ? `Latest dashboard refresh is ${freshness.minutesSinceUpdate} minutes old.`
          : "Monitor is inside the freshness window.";
  const TrustIcon = hasTrustWarning ? AlertTriangle : ShieldCheck;

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Start Here</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A guided read for first-time users
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Start with the regime, check today&apos;s catalyst, read the core watchlist, then confirm the story in
              Workflow and Rates &amp; Credit before making a strong call.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-400 mode-beginner-only">
              The dashboard is designed to work top-down. You do not need to read every card to get a usable macro
              view.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {startHereSteps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className="rounded-[24px] border border-white/8 bg-slate-950/55 p-4 transition hover:border-white/20 hover:bg-slate-950/70"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{step.label}</p>
                <h2 className="mt-3 text-sm font-semibold text-white">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WorkspaceToolbar />

      <section id="regime-summary" className="scroll-mt-28 space-y-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Regime Summary</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {payload.regimeSnapshot.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{payload.regimeSnapshot.summary}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 mode-beginner-only">
              Cross-check this read with Liquidity, FX &amp; Commodities, Policy Expectations, and Positioning before
              calling a regime turn.
            </p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Macro Layers</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Connect domestic macro, liquidity, and cross-asset confirmation in one workflow
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              These pages extend the regime summary into the missing layers that explain resilience, fragility, and
              spillover.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {layerCards.map((card) => {
            const pill = layerPill(card);

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl transition hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                      {card.kicker}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{card.summary}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      pill.className
                    )}
                  >
                    {pill.label}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Key read</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{card.driverLine}</p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <p className="text-sm leading-6 text-slate-400">{card.prompt}</p>
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Live mix</p>
                    <p className="mt-2 text-sm text-slate-200">
                      {card.liveCount} / {card.staleLiveCount} / {card.fallbackCount} / {card.errorCount}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">live / stale-live / fallback / error</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="core-watchlist" className="scroll-mt-28 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Core Watchlist</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The first indicators worth checking each day</h2>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {visibleWatchlist.map((indicator) => (
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={event.moduleHref}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
                >
                  {event.moduleLabel}
                </Link>
                <Link
                  href={event.playbookHref}
                  className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40"
                >
                  {event.playbookLabel}
                </Link>
              </div>
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
                Live status mix
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {freshness.liveCount} live / {freshness.staleLiveCount} stale-live / {freshness.fallbackCount} fallback / {freshness.errorCount} error
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

