"use client";

import { ArrowDown, ArrowUp, EyeOff, Link2, Pin, Star, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useWorkspace } from "@/components/workspace-provider";

export function IndicatorWorkspaceActions({
  slug,
  name,
  visibleSlugs
}: {
  slug: string;
  name: string;
  visibleSlugs: string[];
}) {
  const pathname = usePathname();
  const { isPinned, isInWatchlist, togglePinned, toggleHidden, toggleWatchlist, moveIndicator } = useWorkspace();
  const [feedback, setFeedback] = useState<string | null>(null);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 1600);
  }

  async function copyLink() {
    const target = `${window.location.origin}${pathname}#${slug}`;
    await navigator.clipboard.writeText(target);
    flash("Link copied");
  }

  function exportChart() {
    const article = document.getElementById(slug);
    const svg = article?.querySelector("[data-chart-root='true'] svg");

    if (!(svg instanceof SVGSVGElement)) {
      flash("Chart unavailable");
      return;
    }

    const serialized = new XMLSerializer().serializeToString(svg);
    const withNs = serialized.includes("xmlns=")
      ? serialized
      : serialized.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const blob = new Blob([withNs], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-chart.svg`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Chart exported");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => togglePinned(slug)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
        >
          <Pin className="h-3.5 w-3.5" />
          {isPinned(slug) ? "Unpin" : "Pin"}
        </button>

        <button
          type="button"
          onClick={() => toggleWatchlist(slug)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/35"
        >
          <Star className="h-3.5 w-3.5" />
          {isInWatchlist(slug) ? "Unwatch" : "Watch"}
        </button>

        <button
          type="button"
          onClick={() => toggleHidden(slug)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Hide
        </button>

        <button
          type="button"
          onClick={() => moveIndicator(slug, "up", visibleSlugs)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Up
        </button>

        <button
          type="button"
          onClick={() => moveIndicator(slug, "down", visibleSlugs)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Down
        </button>

        <button
          type="button"
          onClick={() => {
            void copyLink();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
        >
          <Link2 className="h-3.5 w-3.5" />
          Copy link
        </button>

        <button
          type="button"
          onClick={exportChart}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40"
        >
          <Download className="h-3.5 w-3.5" />
          Export chart
        </button>
      </div>

      {feedback ? <p className="text-xs text-slate-500">{feedback}</p> : <p className="text-xs text-slate-500">Personalize, share, or export {name}.</p>}
    </div>
  );
}
