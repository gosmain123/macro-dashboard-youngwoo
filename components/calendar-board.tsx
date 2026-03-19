import Link from "next/link";
import { CalendarClock, ChevronRight, Radar } from "lucide-react";

import { MetaChip } from "@/components/meta-chip";
import { formatReleaseLabel } from "@/lib/utils";
import type { CalendarEvent } from "@/types/macro";

export function CalendarBoard({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Economic calendar</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Know what is coming, why it matters, and where to read it next</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300 mode-beginner-only">
          Each event now links directly into the relevant module and the matching Playbook logic chain so the calendar becomes part of the reasoning flow instead of a dead-end schedule.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip label="Type" value={event.category} tone="cyan" />
              <MetaChip label="Importance" value={event.importance} tone={event.importance === "high" ? "amber" : "slate"} />
              <MetaChip label="Module" value={event.moduleLabel} tone="emerald" />
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-white">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{formatReleaseLabel(event.date, event.timeLabel)}</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Why this matters today</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{event.whyItMatters}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">What to confirm next</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{event.whatToWatch}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href={event.moduleHref}
                className="rounded-2xl border border-white/8 bg-slate-950/55 p-4 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Open module</p>
                    <p className="mt-2 text-sm font-medium text-white">{event.moduleLabel}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cyan-200" />
                </div>
              </Link>
              <Link
                href={event.playbookHref}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 transition hover:border-cyan-300/35"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Open Playbook</p>
                    <p className="mt-2 text-sm font-medium text-white">{event.playbookLabel}</p>
                  </div>
                  <Radar className="h-4 w-4 text-cyan-200" />
                </div>
              </Link>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarClock className="h-4 w-4" />
                Reading path
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Calendar event to {event.moduleLabel} to {event.playbookLabel}.
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
