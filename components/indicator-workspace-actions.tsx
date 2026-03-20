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
  const pathname = usePathname() ?? "/";
  const { isPinned, isInWatchlist, togglePinned, toggleHidden, toggleWatchlist, moveIndicator } = useWorkspace();
  const [feedback, setFeedback] = useState<string | null>(null);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 1600);
  }

  async function copyLink() {
    try {
      const target = `${window.location.origin}${pathname}#${slug}`;
      await navigator.clipboard.writeText(target);
      flash("Link copied");
    } catch {
      flash("Copy unavailable");
    }
  }

  function exportChart() {
    try {
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
    } catch {
      flash("Export unavailable");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => togglePinned(slug)}
          className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <Pin className="h-3.5 w-3.5" />
          {isPinned(slug) ? "Unpin" : "Pin"}
        </button>

        <button
          type="button"
          onClick={() => toggleWatchlist(slug)}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(217,119,6,0.18)] bg-[rgba(217,119,6,0.11)] px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--chip-amber-text)] transition hover:border-[rgba(217,119,6,0.28)]"
        >
          <Star className="h-3.5 w-3.5" />
          {isInWatchlist(slug) ? "Unwatch" : "Watch"}
        </button>

        <button
          type="button"
          onClick={() => toggleHidden(slug)}
          className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Hide
        </button>

        <button
          type="button"
          onClick={() => moveIndicator(slug, "up", visibleSlugs)}
          className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Up
        </button>

        <button
          type="button"
          onClick={() => moveIndicator(slug, "down", visibleSlugs)}
          className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Down
        </button>

        <button
          type="button"
          onClick={() => {
            void copyLink();
          }}
          className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <Link2 className="h-3.5 w-3.5" />
          Copy link
        </button>

        <button
          type="button"
          onClick={exportChart}
          className="soft-button-accent inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition"
        >
          <Download className="h-3.5 w-3.5" />
          Export chart
        </button>
      </div>

      {feedback ? <p className="text-xs text-slate-500">{feedback}</p> : <p className="text-xs text-slate-500">Personalize, share, or export {name}.</p>}
    </div>
  );
}
