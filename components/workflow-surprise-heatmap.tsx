"use client";

import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { DetailOverlayModal } from "@/components/detail-overlay-modal";
import { MetaChip } from "@/components/meta-chip";
import { cn, formatDateLabel, formatFreshnessAge, formatIndicatorValue, formatTimestamp, titleCase } from "@/lib/utils";
import type { WorkflowSurpriseItem } from "@/types/macro";

type HeatmapSignalTone = "positive" | "negative" | "neutral" | "pending";

type WorkflowSurpriseDay = {
  date: string;
  items: WorkflowSurpriseItem[];
};

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
      label: "Pending or no consensus"
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
      label: aboveIsSupportive ? "Supportive surprise" : "Cooling surprise"
    };
  }

  return {
    tone: "negative",
    label: aboveIsSupportive ? "Adverse surprise" : "Hot surprise"
  };
}

function getSignalToneClasses(tone: HeatmapSignalTone) {
  if (tone === "positive") {
    return "border-emerald-200/80 bg-emerald-50";
  }

  if (tone === "negative") {
    return "border-rose-200/80 bg-rose-50";
  }

  if (tone === "neutral") {
    return "border-slate-200 bg-slate-50";
  }

  return "border-slate-200 bg-white";
}

function getSignalBadgeTone(tone: HeatmapSignalTone) {
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

  return compact.length > 30 ? `${compact.slice(0, 30).trim()}...` : compact;
}

function formatOptionalValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  return formatIndicatorValue(value, unit);
}

function formatSurpriseValue(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "\u2014";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatIndicatorValue(value, unit)}`;
}

function getItemPriority(item: WorkflowSurpriseItem) {
  const magnitude = item.surpriseMagnitude === null || item.surpriseMagnitude === undefined ? 0 : Math.abs(item.surpriseMagnitude);
  const sourceBonus = item.sourceType === "official" ? 2 : 0;
  const statusBonus = item.status === "live" ? 1 : 0;
  const pendingPenalty = item.surpriseFlag === "pending" ? -100 : 0;
  return magnitude + sourceBonus + statusBonus + pendingPenalty;
}

function buildWeeklySurpriseDays(items: WorkflowSurpriseItem[], updatedAt: string) {
  const reference = Number.isFinite(new Date(updatedAt).getTime()) ? new Date(updatedAt).getTime() : Date.now();
  const safeItems = Array.isArray(items) ? items.filter((item) => Boolean(item?.id) && Boolean(item?.releaseDate)) : [];
  const weeklyItems = safeItems.filter((item) => {
    const releaseTime = new Date(`${item.releaseDate}T12:00:00Z`).getTime();

    if (!Number.isFinite(releaseTime)) {
      return false;
    }

    const diffDays = Math.floor((reference - releaseTime) / 86400000);
    return diffDays >= 0 && diffDays < 7;
  });
  const selectedItems = weeklyItems.length > 0 ? weeklyItems : safeItems.slice(0, 10);
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
      items: dayItems.slice().sort((left, right) => {
        return getItemPriority(right) - getItemPriority(left) || left.indicatorName.localeCompare(right.indicatorName);
      })
    }));

  return {
    days,
    selectedItems
  };
}

function countTones(items: WorkflowSurpriseItem[]) {
  return items.reduce(
    (totals, item) => {
      const tone = getHeatmapSignal(item).tone;

      if (tone === "positive") {
        totals.supportive += 1;
      } else if (tone === "negative") {
        totals.adverse += 1;
      } else {
        totals.pending += 1;
      }

      return totals;
    },
    { supportive: 0, adverse: 0, pending: 0 }
  );
}

function getDayToneClasses(day: WorkflowSurpriseDay) {
  const counts = countTones(day.items);

  if (counts.supportive > counts.adverse) {
    return "border-emerald-200/80 bg-emerald-50/80";
  }

  if (counts.adverse > counts.supportive) {
    return "border-rose-200/80 bg-rose-50/80";
  }

  return "border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]";
}

function CountPill({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "slate";
}) {
  const valueClassName =
    tone === "emerald"
      ? "text-[color:var(--positive-text)]"
      : tone === "rose"
        ? "text-[color:var(--negative-text)]"
        : "text-[color:var(--text-primary)]";

  return (
    <div className="surface-inset min-w-0 rounded-2xl px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{label}</p>
      <p className={cn("mt-1 text-base font-semibold", valueClassName)}>{value}</p>
    </div>
  );
}

function DayItemPreview({
  item,
  onOpen
}: {
  item: WorkflowSurpriseItem;
  onOpen: () => void;
}) {
  const signal = getHeatmapSignal(item);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-[20px] border p-3 text-left transition hover:border-[color:var(--border-strong)] hover:bg-white",
        getSignalToneClasses(signal.tone)
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{getCompactIndicatorLabel(item.indicatorName)}</p>
          <p className="mt-1 text-xs text-[color:var(--text-secondary)]">{signal.label}</p>
        </div>
        <MetaChip label="Status" value={item.status} tone={statusTone(item.status)} className="shrink-0" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MetaChip label="Surprise" value={item.surpriseFlag} tone={getSignalBadgeTone(signal.tone)} />
        <span className="text-sm font-medium text-[color:var(--text-primary)]">{formatSurpriseValue(item.surpriseMagnitude, item.unit)}</span>
      </div>
    </button>
  );
}

function DayDetailCard({
  item,
  highlighted
}: {
  item: WorkflowSurpriseItem;
  highlighted: boolean;
}) {
  const signal = getHeatmapSignal(item);

  return (
    <article
      className={cn(
        "surface-inset min-w-0 overflow-hidden rounded-[24px] p-4",
        highlighted ? "border-[color:var(--accent-border)] shadow-[0_14px_30px_rgba(15,23,42,0.08)]" : ""
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <MetaChip label="Surprise" value={signal.label} tone={getSignalBadgeTone(signal.tone)} />
            <MetaChip label="Status" value={item.status} tone={statusTone(item.status)} />
            <MetaChip label="Source" value={titleCase(item.sourceType)} tone="slate" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[color:var(--text-primary)]">{item.indicatorName}</h3>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{formatDateLabel(item.releaseDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Actual</p>
          <p className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{formatIndicatorValue(item.actualValue, item.unit)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Prior</p>
          <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{formatIndicatorValue(item.priorValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Consensus</p>
          <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{formatOptionalValue(item.consensusValue, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Surprise</p>
          <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{formatSurpriseValue(item.surpriseMagnitude, item.unit)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Freshness age</p>
          <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{formatFreshnessAge(item.freshnessAgeMinutes)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Why this matters today</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.whyItMatters}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">What to confirm next</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.whatToConfirmNext}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)] transition hover:opacity-80"
            >
              {item.sourceName}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <p className="text-sm font-medium text-[color:var(--text-primary)]">{item.sourceName}</p>
          )}
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">Updated {formatTimestamp(item.updatedAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={item.moduleHref} className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
            Open module
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link href={item.playbookHref} className="soft-button-accent inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
            {item.playbookLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function WorkflowSurpriseHeatmap({
  items,
  updatedAt
}: {
  items: WorkflowSurpriseItem[];
  updatedAt: string;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { days, selectedItems } = useMemo(() => buildWeeklySurpriseDays(items, updatedAt), [items, updatedAt]);
  const selectedDay = days.find((day) => day.date === selectedDate) ?? null;
  const overallCounts = countTones(selectedItems);

  function openDay(date: string, itemId?: string) {
    setSelectedDate(date);
    setSelectedItemId(itemId ?? null);
  }

  function closeDay() {
    setSelectedDate(null);
    setSelectedItemId(null);
  }

  if (days.length === 0) {
    return (
      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Weekly Tone</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Macro tone by day</h2>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Recent releases will appear here once fresh surprise data is available.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="surface-card space-y-5 rounded-[30px] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Weekly Tone</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Macro tone by day</h2>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Each day block shows the tone mix first, then the biggest releases.</p>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-3 xl:w-auto">
            <CountPill label="Supportive" value={overallCounts.supportive} tone="emerald" />
            <CountPill label="Adverse" value={overallCounts.adverse} tone="rose" />
            <CountPill label="Pending" value={overallCounts.pending} tone="slate" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {days.map((day) => {
            const counts = countTones(day.items);
            const previewItems = day.items.slice(0, 2);
            const moreCount = Math.max(day.items.length - previewItems.length, 0);

            return (
              <article
                key={day.date}
                className={cn(
                  "flex min-h-[17rem] min-w-0 flex-col overflow-hidden rounded-[24px] border p-4",
                  getDayToneClasses(day)
                )}
              >
                <button type="button" onClick={() => openDay(day.date)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">
                        {formatDateLabel(day.date)}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{day.items.length} releases</p>
                    </div>
                    <MetaChip
                      label="Tone"
                      value={counts.supportive > counts.adverse ? "Supportive" : counts.adverse > counts.supportive ? "Adverse" : "Mixed"}
                      tone={counts.supportive > counts.adverse ? "emerald" : counts.adverse > counts.supportive ? "rose" : "slate"}
                    />
                  </div>
                </button>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <CountPill label="Supportive" value={counts.supportive} tone="emerald" />
                  <CountPill label="Adverse" value={counts.adverse} tone="rose" />
                  <CountPill label="Pending" value={counts.pending} tone="slate" />
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2">
                  {previewItems.map((item) => (
                    <DayItemPreview key={item.id} item={item} onOpen={() => openDay(day.date, item.id)} />
                  ))}
                  {moreCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => openDay(day.date)}
                      className="soft-button mt-auto inline-flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-sm font-medium transition"
                    >
                      <span>+{moreCount} more releases</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="mt-auto" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DetailOverlayModal
        open={Boolean(selectedDay)}
        onClose={closeDay}
        kicker="Workflow Detail"
        title={selectedDay ? formatDateLabel(selectedDay.date) : "Release detail"}
        subtitle={
          selectedDay
            ? `${selectedDay.items.length} release${selectedDay.items.length === 1 ? "" : "s"}. Open the most important prints and follow the next checks from here.`
            : undefined
        }
        closeLabel="Close workflow day details"
      >
        {selectedDay ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <CountPill label="Supportive" value={countTones(selectedDay.items).supportive} tone="emerald" />
              <CountPill label="Adverse" value={countTones(selectedDay.items).adverse} tone="rose" />
              <CountPill label="Pending" value={countTones(selectedDay.items).pending} tone="slate" />
            </div>

            {selectedDay.items.map((item) => (
              <DayDetailCard key={item.id} item={item} highlighted={selectedItemId === item.id} />
            ))}
          </div>
        ) : null}
      </DetailOverlayModal>
    </>
  );
}
