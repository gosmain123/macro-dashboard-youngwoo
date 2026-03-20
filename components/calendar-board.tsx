"use client";

import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { DetailOverlayModal } from "@/components/detail-overlay-modal";
import { MetaChip } from "@/components/meta-chip";
import { cn, formatReleaseLabel } from "@/lib/utils";
import type { CalendarEvent } from "@/types/macro";

type ViewMode = "month" | "week";

type CalendarDay = {
  key: string;
  date: Date;
  isToday: boolean;
  events: CalendarEvent[];
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDateKey(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day, 12));
}

function normalizeDate(date: Date) {
  return getUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getMonthStart(date: Date) {
  return getUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 86400000);
}

function addMonths(date: Date, amount: number) {
  return getUtcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function getWeekStart(date: Date) {
  return addDays(normalizeDate(date), -normalizeDate(date).getUTCDay());
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatWeekLabel(start: Date, end: Date) {
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-US", sameMonth ? {
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  } : {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(end);

  return `${startLabel} - ${endLabel}`;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function getImportanceRank(importance: CalendarEvent["importance"]) {
  if (importance === "high") {
    return 3;
  }

  if (importance === "medium") {
    return 2;
  }

  return 1;
}

function getImportanceTone(importance: CalendarEvent["importance"]) {
  if (importance === "high") {
    return "amber" as const;
  }

  if (importance === "medium") {
    return "cyan" as const;
  }

  return "slate" as const;
}

function getImportanceDotClassName(importance: CalendarEvent["importance"]) {
  if (importance === "high") {
    return "bg-[color:var(--chip-amber-text)]";
  }

  if (importance === "medium") {
    return "bg-[color:var(--accent-strong)]";
  }

  return "bg-[color:var(--text-muted)]";
}

function sortEvents(events: CalendarEvent[]) {
  return events.slice().sort((left, right) => {
    return (
      getImportanceRank(right.importance) - getImportanceRank(left.importance) ||
      left.timeLabel.localeCompare(right.timeLabel) ||
      left.title.localeCompare(right.title)
    );
  });
}

function buildEventsByDate(events: CalendarEvent[]) {
  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const existing = grouped.get(event.date);
    if (existing) {
      existing.push(event);
      continue;
    }

    grouped.set(event.date, [event]);
  }

  for (const [date, dayEvents] of grouped.entries()) {
    grouped.set(date, sortEvents(dayEvents));
  }

  return grouped;
}

function buildMonthDays(anchorDate: Date, eventsByDate: Map<string, CalendarEvent[]>, todayKey: string) {
  const monthStart = getMonthStart(anchorDate);
  const daysInMonth = getUtcDate(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0).getUTCDate();
  const leadingEmptyDays = monthStart.getUTCDay();
  const cells: Array<CalendarDay | null> = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = getUtcDate(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), day);
    const key = toDateKey(date);

    cells.push({
      key,
      date,
      isToday: key === todayKey,
      events: eventsByDate.get(key) ?? []
    } satisfies CalendarDay);
  }

  const trailingEmptyDays = (7 - (cells.length % 7)) % 7;

  for (let index = 0; index < trailingEmptyDays; index += 1) {
    cells.push(null);
  }

  return cells;
}

function buildWeekDays(anchorDate: Date, eventsByDate: Map<string, CalendarEvent[]>, todayKey: string) {
  const weekStart = getWeekStart(anchorDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = toDateKey(date);

    return {
      key,
      date,
      isToday: key === todayKey,
      events: eventsByDate.get(key) ?? []
    } satisfies CalendarDay;
  });
}

function getInitialAnchor(events: CalendarEvent[], initialDate: string) {
  const parsedInitial = parseDateKey(initialDate);

  if (!Number.isNaN(parsedInitial.getTime())) {
    return getMonthStart(parsedInitial);
  }

  const firstEvent = sortEvents(events).map((event) => event.date).sort()[0];

  if (firstEvent) {
    return getMonthStart(parseDateKey(firstEvent));
  }

  return getMonthStart(normalizeDate(new Date()));
}

function getDayTone(events: CalendarEvent[]) {
  if (events.some((event) => event.importance === "high")) {
    return "amber" as const;
  }

  if (events.some((event) => event.importance === "medium")) {
    return "cyan" as const;
  }

  return "slate" as const;
}

function getStatusTone(status: CalendarEvent["status"]) {
  if (status === "released") {
    return "emerald" as const;
  }

  if (status === "revised") {
    return "amber" as const;
  }

  if (status === "delayed" || status === "canceled") {
    return "rose" as const;
  }

  return "slate" as const;
}

function formatStatusLabel(status: CalendarEvent["status"]) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function EventPreview({
  event,
  onOpen
}: {
  event: CalendarEvent;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface-inset flex w-full min-w-0 items-start gap-2 rounded-[16px] px-2.5 py-2 text-left transition hover:border-[color:var(--border-strong)] hover:bg-white"
    >
      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", getImportanceDotClassName(event.importance))} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{event.title}</p>
        <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
          {event.timeLabel} | {event.importance}
        </p>
      </div>
    </button>
  );
}

function DayEventDetail({
  event,
  highlighted
}: {
  event: CalendarEvent;
  highlighted: boolean;
}) {
  const detailRows = [
    { label: "Actual", value: event.actual },
    { label: "Forecast", value: event.forecast },
    { label: "Previous", value: event.previous },
    { label: "Revised prior", value: event.revisedPrevious }
  ].filter((entry) => Boolean(entry.value));

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
            <MetaChip label="Importance" value={event.importance} tone={getImportanceTone(event.importance)} />
            <MetaChip label="Type" value={event.category} tone="slate" />
            <MetaChip label="Status" value={formatStatusLabel(event.status)} tone={getStatusTone(event.status)} />
            <MetaChip label="Module" value={event.moduleLabel} tone="emerald" />
          </div>
          <h3 className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">{event.title}</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {formatReleaseLabel(event.date, event.timeLabel)} | {event.timezone}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
          <CalendarClock className="h-4 w-4" />
          {formatDayLabel(parseDateKey(event.date))}
        </div>
      </div>

      {detailRows.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {detailRows.map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-[color:var(--border-soft)] bg-white/85 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{entry.label}</p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--text-primary)]">{entry.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">Why this matters</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{event.whyItMatters}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">What to confirm next</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{event.whatToConfirmNext}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Link
          href={event.moduleHref}
          className="soft-button flex items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition"
        >
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Related module</span>
            <span className="mt-1 block text-[color:var(--text-primary)]">{event.moduleLabel}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
        </Link>
        <Link
          href={event.playbookHref}
          className="soft-button-accent flex items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition"
        >
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Related macro flow</span>
            <span className="mt-1 block text-[color:var(--text-primary)]">{event.playbookLabel}</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
        </Link>
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="soft-button flex items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition"
        >
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Source</span>
            <span className="mt-1 block text-[color:var(--text-primary)]">{event.sourceName}</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
        </a>
      </div>
    </article>
  );
}

export function CalendarBoard({
  events,
  initialDate
}: {
  events: CalendarEvent[];
  initialDate: string;
}) {
  const safeEvents = useMemo(
    () =>
      Array.isArray(events)
        ? sortEvents(
            events.filter(
              (event): event is CalendarEvent =>
                Boolean(event?.id) && Boolean(event?.date) && Boolean(event?.title)
            )
          )
        : [],
    [events]
  );
  const eventsByDate = useMemo(() => buildEventsByDate(safeEvents), [safeEvents]);
  const todayKey = useMemo(() => {
    const parsed = parseDateKey(initialDate);
    return Number.isNaN(parsed.getTime()) ? toDateKey(normalizeDate(new Date())) : toDateKey(parsed);
  }, [initialDate]);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => getInitialAnchor(safeEvents, initialDate));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const days = useMemo(
    () => (viewMode === "month" ? buildMonthDays(anchorDate, eventsByDate, todayKey) : buildWeekDays(anchorDate, eventsByDate, todayKey)),
    [anchorDate, eventsByDate, todayKey, viewMode]
  );

  const selectedDay = useMemo(
    () =>
      selectedDateKey
        ? {
            key: selectedDateKey,
            date: parseDateKey(selectedDateKey),
            events: eventsByDate.get(selectedDateKey) ?? []
          }
        : null,
    [eventsByDate, selectedDateKey]
  );

  function shiftPeriod(direction: -1 | 1) {
    setAnchorDate((current) => (viewMode === "month" ? addMonths(current, direction) : addDays(current, direction * 7)));
  }

  function openDay(dateKey: string, eventId?: string) {
    setSelectedDateKey(dateKey);
    setSelectedEventId(eventId ?? null);
  }

  function closeDetail() {
    setSelectedDateKey(null);
    setSelectedEventId(null);
  }

  const currentLabel =
    viewMode === "month"
      ? formatMonthLabel(anchorDate)
      : formatWeekLabel(getWeekStart(anchorDate), addDays(getWeekStart(anchorDate), 6));

  return (
    <>
      <div className="space-y-6">
        <section className="surface-card rounded-[34px] p-6 md:p-8">
          <p className="section-kicker">Economic Calendar</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[color:var(--text-primary)]">
            Read one month of macro risk in a single pass
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--text-secondary)]">
            The main grid stays compact: date, event count, and the 1-2 releases that matter most. Open a day only when you need the full release context.
          </p>
        </section>

        <section className="surface-card rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => shiftPeriod(-1)}
                className="soft-button inline-flex h-10 w-10 items-center justify-center rounded-full transition"
                aria-label={viewMode === "month" ? "Previous month" : "Previous week"}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  {viewMode === "month" ? "Month view" : "Week view"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{currentLabel}</h2>
              </div>
              <button
                type="button"
                onClick={() => shiftPeriod(1)}
                className="soft-button inline-flex h-10 w-10 items-center justify-center rounded-full transition"
                aria-label={viewMode === "month" ? "Next month" : "Next week"}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    viewMode === "month" ? "bg-white text-[color:var(--text-primary)] shadow-sm" : "text-[color:var(--text-secondary)]"
                  )}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    viewMode === "week" ? "bg-white text-[color:var(--text-primary)] shadow-sm" : "text-[color:var(--text-secondary)]"
                  )}
                >
                  Week
                </button>
              </div>
              <MetaChip label="High" value="Amber" tone="amber" />
              <MetaChip label="Medium" value="Teal" tone="cyan" />
              <MetaChip label="Low" value="Muted" tone="slate" />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto pb-1">
            <div className="min-w-[58rem]">
              <div className="grid grid-cols-7 gap-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="min-h-[10.5rem] rounded-[22px] bg-transparent" aria-hidden="true" />;
                  }

                  const previewEvents = day.events.slice(0, 2);
                  const moreCount = Math.max(day.events.length - previewEvents.length, 0);
                  const tone = getDayTone(day.events);

                  return (
                    <article
                      key={day.key}
                      className={cn(
                        "flex min-h-[11rem] min-w-0 flex-col overflow-hidden rounded-[22px] border p-3",
                        "bg-white",
                        day.isToday ? "border-[color:var(--accent-border)]" : "border-[color:var(--border-soft)]"
                      )}
                    >
                      <button type="button" onClick={() => openDay(day.key)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[color:var(--text-primary)]">{day.date.getUTCDate()}</p>
                            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                              {day.events.length > 0 ? `${day.events.length} event${day.events.length === 1 ? "" : "s"}` : "No key events"}
                            </p>
                          </div>
                          {day.events.length > 0 ? <MetaChip label="Events" value={`${day.events.length}`} tone={tone} /> : null}
                        </div>
                      </button>

                      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                        {previewEvents.map((event) => (
                          <EventPreview key={event.id} event={event} onOpen={() => openDay(day.key, event.id)} />
                        ))}

                        {moreCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => openDay(day.key)}
                            className="mt-auto text-left text-sm font-medium text-[color:var(--accent-strong)] transition hover:opacity-80"
                          >
                            +{moreCount} more
                          </button>
                        ) : (
                          <div className="mt-auto" />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <DetailOverlayModal
        open={Boolean(selectedDay)}
        onClose={closeDetail}
        kicker="Calendar Detail"
        title={selectedDay ? formatDayLabel(selectedDay.date) : "Event detail"}
        subtitle={
          selectedDay
            ? `${selectedDay.events.length} event${selectedDay.events.length === 1 ? "" : "s"} on this day. Open the most important release and route into the next module or chain from here.`
            : undefined
        }
        closeLabel="Close calendar detail"
      >
        {selectedDay && selectedDay.events.length > 0 ? (
          <div className="space-y-4">
            {selectedDay.events.map((event) => (
              <DayEventDetail key={event.id} event={event} highlighted={selectedEventId === event.id} />
            ))}
          </div>
        ) : (
          <div className="surface-inset rounded-[24px] p-5 text-sm text-[color:var(--text-secondary)]">
            No scheduled events are attached to this day yet.
          </div>
        )}
      </DetailOverlayModal>
    </>
  );
}
