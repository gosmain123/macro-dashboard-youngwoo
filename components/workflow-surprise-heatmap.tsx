import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { MetaChip } from "@/components/meta-chip";
import { cn, formatDateLabel, formatIndicatorValue } from "@/lib/utils";
import type { WorkflowSurpriseItem } from "@/types/macro";

type HeatmapSignalTone = "positive" | "negative" | "neutral" | "pending";

function statusTone(status: WorkflowSurpriseItem["status"]) {
  if (status === "live") {
    return "emerald" as const;
  }

  if (status === "fallback" || status === "stale-live") {
    return "amber" as const;
  }

  return "rose" as const;
}

function getHeatmapSignal(item: WorkflowSurpriseItem): {
  tone: HeatmapSignalTone;
  label: string;
} {
  if (item.surpriseFlag === "pending" || item.consensusValue === null || item.consensusValue === undefined) {
    return {
      tone: "pending",
      label: "Pending / no consensus"
    };
  }

  if (item.surpriseFlag === "inline") {
    return {
      tone: "neutral",
      label: "Inline"
    };
  }

  const aboveIsSupportive = item.category === "growth" || item.category === "labor";
  const supportive = item.surpriseFlag === "above" ? aboveIsSupportive : !aboveIsSupportive;

  if (supportive) {
    return {
      tone: "positive",
      label: aboveIsSupportive ? "Stronger than expected" : "Cooler than expected"
    };
  }

  return {
    tone: "negative",
    label: aboveIsSupportive ? "Weaker than expected" : "Hotter than expected"
  };
}

function getHeatmapToneClasses(tone: HeatmapSignalTone) {
  if (tone === "positive") {
    return "border-emerald-300/25 bg-emerald-400/12";
  }

  if (tone === "negative") {
    return "border-rose-300/25 bg-rose-400/12";
  }

  if (tone === "neutral") {
    return "border-slate-200/15 bg-slate-300/10";
  }

  return "border-white/8 bg-white/5";
}

function getHeatmapBadgeTone(tone: HeatmapSignalTone) {
  if (tone === "positive") {
    return "emerald" as const;
  }

  if (tone === "negative") {
    return "rose" as const;
  }

  return "slate" as const;
}

function getCompactIndicatorLabel(name: string) {
  const compact = name
    .replace(/Consumer Price Index/i, "CPI")
    .replace(/Core Personal Consumption Expenditures/i, "Core PCE")
    .replace(/Personal Consumption Expenditures/i, "PCE")
    .replace(/Average Hourly Earnings/i, "Wages")
    .replace(/Initial Jobless Claims/i, "Claims")
    .replace(/Unemployment Rate/i, "Unemployment")
    .replace(/Nonfarm Payrolls/i, "Payrolls");

  return compact.length > 28 ? `${compact.slice(0, 28).trim()}...` : compact;
}

function formatSurpriseValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatIndicatorValue(value, unit)}`;
}

function buildWeeklySurpriseDays(items: WorkflowSurpriseItem[], updatedAt: string) {
  const reference = new Date(updatedAt).getTime();
  const weeklyItems = items.filter((item) => {
    const releaseTime = new Date(`${item.releaseDate}T12:00:00Z`).getTime();
    const diffDays = Math.floor((reference - releaseTime) / 86400000);
    return diffDays >= 0 && diffDays < 7;
  });
  const selectedItems = weeklyItems.length > 0 ? weeklyItems : items.slice(0, 10);
  const grouped = new Map<string, WorkflowSurpriseItem[]>();

  for (const item of selectedItems) {
    const existing = grouped.get(item.releaseDate);
    if (existing) {
      existing.push(item);
      continue;
    }

    grouped.set(item.releaseDate, [item]);
  }

  const days = Array.from(grouped.entries())
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([date, dayItems]) => ({
      date,
      items: dayItems.sort((left, right) => {
        const leftScore = left.surpriseMagnitude === null || left.surpriseMagnitude === undefined ? -1 : Math.abs(left.surpriseMagnitude);
        const rightScore = right.surpriseMagnitude === null || right.surpriseMagnitude === undefined ? -1 : Math.abs(right.surpriseMagnitude);

        return rightScore - leftScore || left.indicatorName.localeCompare(right.indicatorName);
      })
    }));

  return {
    days,
    selectedItems
  };
}

export function WorkflowSurpriseHeatmap({
  items,
  updatedAt
}: {
  items: WorkflowSurpriseItem[];
  updatedAt: string;
}) {
  const { days, selectedItems } = buildWeeklySurpriseDays(items, updatedAt);

  if (days.length === 0) {
    return null;
  }

  const supportiveCount = selectedItems.filter((item) => getHeatmapSignal(item).tone === "positive").length;
  const adverseCount = selectedItems.filter((item) => getHeatmapSignal(item).tone === "negative").length;
  const pendingCount = selectedItems.filter((item) => {
    const tone = getHeatmapSignal(item).tone;
    return tone === "pending" || tone === "neutral";
  }).length;

  return (
    <section className="space-y-5 rounded-[32px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Weekly Surprise Heatmap</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Fast read on the week&apos;s macro tone</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 mode-beginner-only">
            Green tiles flag supportive surprises, red tiles flag adverse surprises, and gray tiles flag inline or still-pending releases.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetaChip label="Supportive" value={`${supportiveCount}`} tone="emerald" />
          <MetaChip label="Adverse" value={`${adverseCount}`} tone="rose" />
          <MetaChip label="Pending" value={`${pendingCount}`} tone="slate" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaChip label="Legend" value="Green = supportive" tone="emerald" />
        <MetaChip label="Legend" value="Red = adverse" tone="rose" />
        <MetaChip label="Legend" value="Gray = inline or pending" tone="slate" />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {days.map((day) => (
          <article key={day.date} className="rounded-[26px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{formatDateLabel(day.date)}</p>
            <div className="mt-4 space-y-3">
              {day.items.map((item) => {
                const signal = getHeatmapSignal(item);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-2xl border p-3 transition",
                      getHeatmapToneClasses(signal.tone)
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{getCompactIndicatorLabel(item.indicatorName)}</p>
                        <p className="mt-1 text-xs text-slate-300">{signal.label}</p>
                      </div>
                      <MetaChip label="Status" value={item.status} tone={statusTone(item.status)} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <MetaChip label="Surprise" value={item.surpriseFlag} tone={getHeatmapBadgeTone(signal.tone)} />
                      <span className="text-sm font-medium text-white">{formatSurpriseValue(item.surpriseMagnitude, item.unit)}</span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-300">{item.whatToConfirmNext}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={item.moduleHref}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:text-white"
                      >
                        Module
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={item.playbookHref}
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40"
                      >
                        Chain
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
