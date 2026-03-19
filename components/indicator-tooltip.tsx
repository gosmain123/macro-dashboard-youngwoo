"use client";

import { Info, MoveUpRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { cn } from "@/lib/utils";
import type { MacroIndicator } from "@/types/macro";

const closeDelayMs = 180;

const detailSections = [
  { key: "definition", label: "Definition" },
  { key: "whyItMatters", label: "Why this matters today" },
  { key: "howToUse", label: "How to read it" },
  { key: "whatToWatch", label: "What to watch next" }
] as const;

export function IndicatorTooltip({
  indicator
}: {
  indicator: Pick<MacroIndicator, "slug" | "module" | "name" | "tooltips">;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewId = useId();
  const drawerTitleId = useId();

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
          className="rounded-full border border-white/10 bg-slate-900 p-2 text-slate-300 shadow-[0_10px_25px_rgba(2,6,23,0.35)] transition hover:border-cyan-300/60 hover:text-white focus-visible:border-cyan-300/60 focus-visible:text-white focus-visible:outline-none"
        >
          <Info className="h-4 w-4" />
        </button>

        <div
          id={previewId}
          role="tooltip"
          className={cn(
            "absolute right-0 top-12 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-[24px] border border-slate-700 bg-[#081221] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] transition",
            previewOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Definition</p>
              <h4 className="mt-2 text-base font-semibold text-white">{indicator.name}</h4>
            </div>
            <MoveUpRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-100">{indicator.tooltips.definition}</p>
          <button
            type="button"
            onClick={openDrawer}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40"
          >
            Open full context
            <MoveUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label={`Close ${indicator.name} details`}
          onClick={closeDrawer}
          className={cn(
            "absolute inset-0 bg-slate-950/85 backdrop-blur-md transition",
            drawerOpen ? "opacity-100" : "opacity-0"
          )}
        />

        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            className={cn(
              "relative z-10 flex max-h-[min(88vh,56rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-slate-700 bg-[#081221] shadow-[0_36px_100px_rgba(2,6,23,0.72)] transition duration-200",
              drawerOpen ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.98]"
            )}
          >
            <div className="border-b border-slate-800 bg-slate-950 px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">Indicator context</p>
                  <h3 id={drawerTitleId} className="mt-2 max-w-2xl text-2xl font-semibold text-white sm:text-3xl">
                    {indicator.name}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Definition, reading cues, and guided next steps in one place.
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label={`Close ${indicator.name} details`}
                  onClick={closeDrawer}
                  className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(88vh-6rem)] overflow-y-auto px-6 py-6 sm:px-7">
              <div className="space-y-4">
                {detailSections.map((section) => (
                  <section key={section.key} className="rounded-[24px] border border-slate-800 bg-slate-900 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {section.label}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">{indicator.tooltips[section.key]}</p>
                  </section>
                ))}

                <section className="rounded-[24px] border border-slate-800 bg-slate-900 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Keep going</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Use these jumps to keep the interpretation flow connected instead of bouncing back to the main grid and guessing where to go next.
                  </p>
                  <div className="mt-4">
                    <IndicatorActionLinks indicator={indicator} layout="panel" />
                  </div>
                </section>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
