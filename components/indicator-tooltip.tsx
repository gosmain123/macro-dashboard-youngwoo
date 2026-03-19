"use client";

import { Info, MoveUpRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { IndicatorTooltip as IndicatorTooltipType } from "@/types/macro";

const closeDelayMs = 180;

const detailSections = [
  { key: "whyItMatters", label: "Why it matters" },
  { key: "howToUse", label: "How to use it" },
  { key: "whatToWatch", label: "What to watch next" }
] as const;

export function IndicatorTooltip({
  title,
  tooltip
}: {
  title: string;
  tooltip: IndicatorTooltipType;
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
      <div
        className="relative"
        onMouseEnter={openPreview}
        onMouseLeave={schedulePreviewClose}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Open information for ${title}`}
          aria-expanded={previewOpen || drawerOpen}
          aria-controls={previewId}
          onClick={openDrawer}
          onFocus={openPreview}
          onBlur={schedulePreviewClose}
          className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:border-cyan-300/60 hover:text-white focus-visible:border-cyan-300/60 focus-visible:text-white focus-visible:outline-none"
        >
          <Info className="h-4 w-4" />
        </button>

        <div
          id={previewId}
          role="tooltip"
          className={cn(
            "absolute right-0 top-12 z-30 w-[min(18rem,calc(100vw-2rem))] rounded-[24px] border border-white/12 bg-slate-950/96 p-4 shadow-soft backdrop-blur-2xl transition",
            previewOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Definition</p>
              <h4 className="mt-2 text-base font-semibold text-white">{title}</h4>
            </div>
            <MoveUpRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{tooltip.definition}</p>
          <button
            type="button"
            onClick={openDrawer}
            className="mt-4 text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
          >
            Open full context
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
          aria-label={`Close ${title} details`}
          onClick={closeDrawer}
          className={cn(
            "absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition",
            drawerOpen ? "opacity-100" : "opacity-0"
          )}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-white/10 bg-slate-950/97 p-6 shadow-soft transition duration-200 sm:p-7",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">Indicator context</p>
              <h3 id={drawerTitleId} className="mt-2 text-2xl font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={`Close ${title} details`}
              onClick={closeDrawer}
              className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:border-white/20 hover:text-white focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Definition</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{tooltip.definition}</p>
            </section>

            {detailSections.map((section) => (
              <section key={section.key} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {section.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{tooltip[section.key]}</p>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
