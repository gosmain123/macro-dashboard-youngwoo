import type { CalendarEvent } from "@/types/macro";

export function CalendarBoard({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Economic calendar</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Know why the next release matters</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">
          This board highlights the events most likely to move rates, macro narratives, and cross-asset leadership.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">
                {event.category}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                {event.importance} importance
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{`${event.date} | ${event.timeLabel}`}</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Why markets care</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{event.whyItMatters}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">What to watch</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{event.whatToWatch}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
