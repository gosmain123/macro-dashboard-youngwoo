"use client";

import { CalendarClock, Radar, TrendingUp } from "lucide-react";

import { LayerDashboard } from "@/components/layer-dashboard";
import { MetaChip } from "@/components/meta-chip";
import { WidgetErrorBoundary } from "@/components/widget-error-boundary";
import { formatDateLabel, formatIndicatorValue } from "@/lib/utils";
import type { PolicyExpectationsPayload } from "@/lib/policy-expectations";

function ProbabilityBar({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "rose";
}) {
  const barClass =
    tone === "emerald"
      ? "bg-emerald-300"
      : tone === "rose"
        ? "bg-rose-300"
        : "bg-cyan-300";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function PolicyExpectationsBoard({
  payload,
  dataMode
}: {
  payload: PolicyExpectationsPayload;
  dataMode: "demo" | "live";
}) {
  const safePayload = {
    ...payload,
    meetings: Array.isArray(payload?.meetings) ? payload.meetings : [],
    decomposition: Array.isArray(payload?.decomposition) ? payload.decomposition : []
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Policy Expectations</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">FedWatch-style rate path, without losing the macro context</h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">{safePayload.headline}</p>
            <div className="mt-6 rounded-[26px] border border-white/8 bg-slate-950/55 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Today&apos;s read</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">{safePayload.takeaway}</p>
            </div>
          </div>

          <aside className="min-w-0 space-y-4">
            <div className="rounded-[26px] border border-white/8 bg-slate-950/55 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Radar className="h-4 w-4" />
                Aggregate policy probabilities
              </div>
              <div className="mt-4 space-y-3">
                <ProbabilityBar label="Hold" value={safePayload.aggregate.hold} tone="cyan" />
                <ProbabilityBar label="Cut" value={safePayload.aggregate.cut} tone="emerald" />
                <ProbabilityBar label="Hike" value={safePayload.aggregate.hike} tone="rose" />
              </div>
            </div>

            <div className="rounded-[26px] border border-white/8 bg-slate-950/55 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4" />
                Why this page exists
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                The goal is to separate rate relief driven by Fed repricing from rate relief driven by growth fear, then confirm it in the curve and credit.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <MetaChip label="Mode" value={dataMode} tone={dataMode === "live" ? "emerald" : "amber"} />
                <MetaChip label="Style" value="FedWatch-inspired" tone="cyan" />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <WidgetErrorBoundary title="Meeting probabilities unavailable" description="The rest of the page is still available even if the probability view fails.">
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Next 3 Meetings</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Probability-style meeting path</h2>
          </div>

          {safePayload.meetings.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {safePayload.meetings.map((meeting) => (
                <article key={`${meeting.label}-${meeting.date}`} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{meeting.label}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{formatDateLabel(meeting.date)}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Implied upper bound {formatIndicatorValue(meeting.impliedUpperBound, "%")}
                      </p>
                    </div>
                    <CalendarClock className="h-5 w-5 text-cyan-200" />
                  </div>

                  <div className="mt-5 space-y-3">
                    <ProbabilityBar label="Hold" value={meeting.hold} tone="cyan" />
                    <ProbabilityBar label="Cut" value={meeting.cut} tone="emerald" />
                    <ProbabilityBar label="Hike" value={meeting.hike} tone="rose" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-inset rounded-[24px] p-5 text-sm text-[color:var(--text-secondary)]">
              Meeting probabilities are unavailable right now.
            </div>
          )}
        </section>
      </WidgetErrorBoundary>

      <WidgetErrorBoundary title="Yield decomposition unavailable" description="The layer cards below still render even if this summary block fails.">
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Yield Decomposition</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Nominal vs real vs breakeven</h2>
          </div>

          {safePayload.decomposition.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-4">
              {safePayload.decomposition.map((item) => (
                <article key={item.label} className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{formatIndicatorValue(item.value, item.unit)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-inset rounded-[24px] p-5 text-sm text-[color:var(--text-secondary)]">
              Yield decomposition is unavailable right now.
            </div>
          )}
        </section>
      </WidgetErrorBoundary>

      <WidgetErrorBoundary title="Policy layer unavailable" description="The route stayed mounted even though the lower dashboard section failed.">
        <LayerDashboard page={safePayload.page} dataMode={dataMode} />
      </WidgetErrorBoundary>
    </div>
  );
}
