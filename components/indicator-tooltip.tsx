"use client";

import { Info, MoveUpRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { IndicatorTooltip as IndicatorTooltipType } from "@/types/macro";

const tooltipSections = [
  { key: "definition", label: "Definition" },
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
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:border-cyan-300/60 hover:text-white"
        aria-label={`Open tooltip for ${title}`}
      >
        <Info className="h-4 w-4" />
      </button>
      <div
        className={cn(
          "absolute right-0 top-12 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[26px] border border-white/12 bg-slate-950/95 p-5 shadow-soft backdrop-blur-2xl transition",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">Macro primer</p>
            <h4 className="mt-2 text-lg font-semibold text-white">{title}</h4>
          </div>
          <MoveUpRight className="h-4 w-4 text-cyan-200" />
        </div>
        <div className="space-y-4">
          {tooltipSections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {section.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{tooltip[section.key]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
