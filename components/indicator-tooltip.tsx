"use client";

import { CalendarClock, ExternalLink, Info, MoveUpRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FollowUpLogicCard } from "@/components/follow-up-logic-card";
import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { MetaChip } from "@/components/meta-chip";
import { SparklineChart } from "@/components/sparkline-chart";
import { getHistoricalContext, getIndicatorSourceType } from "@/lib/indicator-insight";
import { getFollowUpLogic } from "@/lib/playbook-guide";
import { cn, formatFreshnessAge, formatIndicatorValue, formatReleaseLabel, formatTimestamp, titleCase } from "@/lib/utils";
import type { MacroIndicator } from "@/types/macro";

const closeDelayMs = 180;

const detailSections = [
  { key: "definition", label: "Definition" },
  { key: "whyItMatters", label: "Why this matters" },
  { key: "howToUse", label: "How to read it" },
  { key: "whatToWatch", label: "What to watch next" }
] as const;

function statusTone(status: MacroIndicator["status"]) {
  if (status === "live") {
    return "emerald" as const;
  }

  if (status === "fallback" || status === "stale-live") {
    return "amber" as const;
  }

  return "rose" as const;
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

export function IndicatorTooltip({
  indicator,
  trigger = "icon"
}: {
  indicator: MacroIndicator;
  trigger?: "icon" | "button";
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewId = useId();
  const drawerTitleId = useId();
  const safeTooltips = {
    definition: indicator.tooltips?.definition?.trim() || "Definition unavailable.",
    whyItMatters: indicator.tooltips?.whyItMatters?.trim() || "Why it matters is unavailable.",
    howToUse: indicator.tooltips?.howToUse?.trim() || "Usage notes are unavailable.",
    whatToWatch: indicator.tooltips?.whatToWatch?.trim() || "Follow-up checks are unavailable."
  };
  const safeChartHistory = Array.isArray(indicator.chartHistory) ? indicator.chartHistory : [];
  const followUpLogic = getFollowUpLogic(indicator.slug);
  const sourceType = getIndicatorSourceType(indicator);
  const context = getHistoricalContext({
    chartHistory: safeChartHistory,
    currentValue: Number.isFinite(indicator.currentValue) ? indicator.currentValue : 0
  });
  const nextLabel =
    indicator.nextReleaseAt
      ? formatTimestamp(indicator.nextReleaseAt)
      : indicator.release?.type === "scheduled"
        ? formatReleaseLabel(indicator.release.nextReleaseDate, indicator.release.timeLabel)
        : indicator.release?.detail ?? "Schedule pending";

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverSupport = () => setSupportsHover(mediaQuery.matches);

    updateHoverSupport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateHoverSupport);
      return () => mediaQuery.removeEventListener("change", updateHoverSupport);
    }

    mediaQuery.addListener(updateHoverSupport);
    return () => mediaQuery.removeListener(updateHoverSupport);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!previewOpen && !drawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setPreviewOpen(false);
      setDrawerOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, previewOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!drawerOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function clearCloseTimer() {
    if (!closeTimerRef.current) {
      return;
    }

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function openPreview() {
    if (!supportsHover || drawerOpen) {
      return;
    }

    clearCloseTimer();
    setPreviewOpen(true);
  }

  function schedulePreviewClose() {
    if (!supportsHover || drawerOpen) {
      return;
    }

    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setPreviewOpen(false);
    }, closeDelayMs);
  }

  function openDrawer() {
    clearCloseTimer();
    setPreviewOpen(false);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setPreviewOpen(false);
    triggerRef.current?.focus();
  }

  const triggerClassName =
    trigger === "button"
      ? "soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
      : "rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--text-muted)] shadow-sm transition hover:border-[color:var(--accent-border)] hover:text-[color:var(--text-primary)] focus-visible:border-[color:var(--accent-border)] focus-visible:text-[color:var(--text-primary)] focus-visible:outline-none";

  return (
    <>
      <div className="relative" onMouseEnter={openPreview} onMouseLeave={schedulePreviewClose}>
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Open information for ${indicator.name}`}
          aria-expanded={previewOpen || drawerOpen}
          aria-controls={previewId}
          onClick={openDrawer}
          onFocus={openPreview}
          onBlur={schedulePreviewClose}
          className={triggerClassName}
        >
          <Info className="h-4 w-4" />
          {trigger === "button" ? "Expand details" : null}
        </button>

        <div
          id={previewId}
          role="tooltip"
          className={cn(
            "surface-strong absolute right-0 top-12 z-30 w-[min(19rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[22px] p-4 transition",
            previewOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Definition</p>
              <h4 className="mt-2 text-base font-semibold text-[color:var(--text-primary)]">{indicator.name}</h4>
            </div>
            <MoveUpRight className="mt-1 h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{safeTooltips.definition}</p>
          <button type="button" onClick={openDrawer} className="soft-button-accent mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
            Open full view
            <MoveUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {portalReady
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[120] transition",
                drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              )}
              aria-hidden={!drawerOpen}
            >
              <button
                type="button"
                aria-label={`Close ${indicator.name} details`}
                onClick={closeDrawer}
                className={cn(
                  "absolute inset-0 bg-[color:var(--overlay)] backdrop-blur-md transition",
                  drawerOpen ? "opacity-100" : "opacity-0"
                )}
              />

              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
                <aside
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={drawerTitleId}
                  className={cn(
                    "surface-strong relative z-10 flex max-h-[min(92vh,62rem)] w-full max-w-[72rem] min-w-0 flex-col overflow-hidden rounded-[30px] border border-[color:var(--border-soft)] shadow-[0_28px_80px_rgba(15,23,42,0.18)] transition duration-200",
                    drawerOpen ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.98]"
                  )}
                >
            <div className="border-b border-[color:var(--border-soft)] px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <MetaChip label="Status" value={indicator.status} tone={statusTone(indicator.status)} />
                    <MetaChip label="Source" value={titleCase(sourceType)} tone="slate" />
                    <MetaChip label="Context" value={context.contextLabel} tone={contextTone(context)} />
                  </div>
                  <h3 id={drawerTitleId} className="mt-3 max-w-2xl text-2xl font-semibold text-[color:var(--text-primary)] sm:text-3xl">
                    {indicator.name}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
                    {indicator.summary?.trim() || indicator.advancedSummary?.trim() || "Summary unavailable."}
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label={`Close ${indicator.name} details`}
                  onClick={closeDrawer}
                  className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] focus-visible:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-6rem)] overflow-y-auto px-6 py-6 sm:px-7">
              <div className="space-y-[18px]">
                <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <div className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Current value</p>
                    <p className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)]">
                      {formatIndicatorValue(indicator.currentValue, indicator.unit)}
                    </p>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Updated</p>
                        <p className="mt-1 text-sm text-[color:var(--text-primary)]">{formatTimestamp(indicator.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Next release</p>
                        <p className="mt-1 text-sm text-[color:var(--text-primary)]">{nextLabel}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <MetaChip label="Age" value={formatFreshnessAge(indicator.freshnessAgeMinutes)} tone={statusTone(indicator.status)} />
                        <MetaChip
                          label={context.percentileLabel}
                          value={context.percentile !== null ? `${context.percentile}` : "\u2014"}
                          tone={contextTone(context)}
                        />
                        <MetaChip
                          label={context.zScoreLabel}
                          value={context.zScore !== null ? `${context.zScore > 0 ? "+" : ""}${context.zScore}` : "\u2014"}
                          tone={contextTone(context)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                    <SparklineChart
                      data={safeChartHistory}
                      frequency={indicator.frequency}
                      unit={indicator.unit}
                      showOverlay={Boolean(indicator.overlays?.length)}
                    />
                  </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                  {detailSections.map((section) => (
                    <section key={section.key} className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">
                        {section.label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{safeTooltips[section.key]}</p>
                    </section>
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <section className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Source</p>
                    {indicator.source.url ? (
                      <a
                        href={indicator.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)] transition hover:opacity-80"
                      >
                        {indicator.source.name}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="mt-3 text-sm font-medium text-[color:var(--text-primary)]">{indicator.source.name}</p>
                    )}
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {indicator.release?.sourceName ?? indicator.release?.detail ?? "Release metadata unavailable."}
                    </p>
                  </section>

                  <section className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Release timing</p>
                    <div className="mt-3 flex items-center gap-2 text-[color:var(--text-muted)]">
                      <CalendarClock className="h-4 w-4" />
                      {indicator.release?.label ?? "Schedule"}
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--text-primary)]">{nextLabel}</p>
                    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{indicator.releaseCadence || "Cadence unavailable"}</p>
                  </section>

                  <section className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Trust and fetch</p>
                    <p className="mt-3 text-sm text-[color:var(--text-primary)]">
                      {indicator.lastFailedFetch
                        ? `Last failed fetch ${formatTimestamp(indicator.lastFailedFetch)}`
                        : indicator.lastSuccessfulFetch
                          ? `Last successful fetch ${formatTimestamp(indicator.lastSuccessfulFetch)}`
                          : "No live fetch recorded yet"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {indicator.errorMessage ?? indicator.fallbackUsageReason ?? "This card is using the latest available value and status badge."}
                    </p>
                  </section>
                </div>

                {followUpLogic ? <FollowUpLogicCard logic={followUpLogic} /> : null}

                <section className="surface-card min-w-0 overflow-hidden rounded-[22px] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Check next</p>
                  <div className="mt-4">
                    <IndicatorActionLinks indicator={indicator} layout="panel" />
                  </div>
                </section>
              </div>
            </div>
                </aside>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
