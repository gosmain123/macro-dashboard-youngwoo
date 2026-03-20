import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarClock, ListChecks, Orbit, ShieldAlert } from "lucide-react";

import {
  macroFlowCommonMistakes,
  macroFlowDailyRoutine,
  macroFlowJumpLinks,
  macroFlowOperatingSystem,
  macroFlowSections,
  type FlowTone
} from "@/lib/macro-flow";
import { cn, formatCalendarDate } from "@/lib/utils";
import type { DashboardPayload } from "@/types/macro";

function getNextCatalyst(payload: DashboardPayload) {
  const calendarEvents = Array.isArray(payload?.calendarEvents) ? payload.calendarEvents : [];
  const today = new Date().toISOString().slice(0, 10);

  return calendarEvents
    .filter((event) => event.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))[0];
}

function toneStyles(tone: FlowTone) {
  if (tone === "amber") {
    return "border-amber-200/80 bg-amber-50";
  }

  if (tone === "cyan") {
    return "border-cyan-200/80 bg-cyan-50";
  }

  if (tone === "emerald") {
    return "border-emerald-200/80 bg-emerald-50";
  }

  if (tone === "rose") {
    return "border-rose-200/80 bg-rose-50";
  }

  return "border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]";
}

function focusLine(payload: DashboardPayload) {
  const watchlist = Array.isArray(payload.homepage?.watchlist) ? payload.homepage.watchlist : [];
  const summary = watchlist
    .slice(0, 3)
    .map((indicator) => indicator.shortName)
    .join(" / ");

  return summary || "Use the jump keys to start with inflation, labor, growth, or rates.";
}

export function MacroFlowBoard({ payload }: { payload: DashboardPayload }) {
  const nextCatalyst = getNextCatalyst(payload);

  return (
    <div className="min-w-0 space-y-8">
      <section className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="section-kicker">Macro Flow</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
              The market logic manual
            </h1>
            <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">
              Dashboard is the quick read. Workflow is the daily execution board. Macro Flow is where the market logic gets explained step by step, so you can see why one indicator leads to the next and how it travels into rates, USD, spreads, volatility, and assets.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-[38rem] xl:flex-none">
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">Next catalyst</p>
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">
                {nextCatalyst ? nextCatalyst.title : "Open Calendar"}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {nextCatalyst ? `${formatCalendarDate(nextCatalyst.date)} ${nextCatalyst.timeLabel}` : "No scheduled catalyst found."}
              </p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">Current focus</p>
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{focusLine(payload)}</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">Use this tab when</p>
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">
                You want the why, not just the number.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <div className="surface-card rounded-[30px] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <Orbit className="mt-1 h-5 w-5 text-[color:var(--accent-strong)]" />
            <div className="min-w-0">
              <p className="section-kicker">Jump Keys</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Start from the concept you need</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                These links jump you straight to the core market logic sections.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {macroFlowJumpLinks.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className="surface-inset rounded-[22px] border border-[color:var(--border-soft)] px-4 py-4 transition hover:border-[color:var(--border-strong)]"
              >
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[30px] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-1 h-5 w-5 text-[color:var(--accent-strong)]" />
            <div className="min-w-0">
              <p className="section-kicker">Role Split</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">Know where to go</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">Dashboard</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">Quick read. One-line regime summary, key signals, what changed, and where to go next.</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">Workflow</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">Daily execution. Today’s releases, surprises, revisions, and the next confirmation check.</p>
            </div>
            <div className="surface-inset rounded-[22px] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">Macro Flow</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">Deep logic. Why the signal matters, how markets react, what different outcomes mean, and how the view maps into assets.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/workflow" className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition">
              Open Workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/calendar" className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition">
              Open Calendar
              <CalendarClock className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div>
          <p className="section-kicker">Big-Picture Logic Map</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">How the market operating system works</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
            Every major macro read should travel through this same sequence: catalyst, decomposition, rates, trust markets, assets, then the tentative regime view.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-stretch xl:gap-2">
          {macroFlowOperatingSystem.map((node, index) => (
            <div key={`${node.label}-${index}`} className="flex min-w-0 flex-col gap-3 xl:flex-1 xl:flex-row xl:items-stretch xl:gap-2">
              <Link
                href={node.href ?? "#"}
                className={cn(
                  "block min-w-0 flex-1 rounded-[24px] border px-4 py-4 transition hover:border-[color:var(--border-strong)]",
                  toneStyles(node.tone)
                )}
              >
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{node.label}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{node.detail}</p>
              </Link>
              {index < macroFlowOperatingSystem.length - 1 ? (
                <div className="surface-inset flex h-8 w-8 items-center justify-center self-center rounded-full text-[color:var(--text-muted)] xl:self-auto">
                  <ArrowRight className="hidden h-4 w-4 xl:block" />
                  <ArrowRight className="h-4 w-4 rotate-90 xl:hidden" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="flex items-start gap-3">
          <ListChecks className="mt-1 h-5 w-5 text-[color:var(--accent-strong)]" />
          <div className="min-w-0">
            <p className="section-kicker">Daily Routine / Scorecard</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">The default daily sequence</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              Use this when you want a repeatable process instead of reacting to the loudest print.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {macroFlowDailyRoutine.map((item) => (
            <article key={item.title} className="surface-inset rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.action}</p>
              <div className="mt-4 rounded-[18px] border border-[color:var(--border-soft)] bg-white/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Output</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-primary)]">{item.output}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {macroFlowSections.map((section) => (
        <section key={section.id} id={section.id} className="surface-card scroll-mt-28 rounded-[30px] p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 max-w-4xl">
              <p className="section-kicker">{section.kicker}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)] md:text-[2rem]">{section.title}</h2>
              <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">{section.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {section.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="space-y-4">
              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">First principle</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{section.firstPrinciple}</p>
              </article>

              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Why this matters</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{section.whyItMatters}</p>
              </article>

              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">How it travels into markets</p>
                <div className="mt-4 space-y-3">
                  {section.marketPath.map((item) => (
                    <div key={item} className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/80 px-3 py-3 text-sm leading-6 text-[color:var(--text-primary)]">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="space-y-4">
              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Step-by-step market reasoning</p>
                <div className="mt-4 space-y-3">
                  {section.steps.map((step, index) => (
                    <div key={step.title} className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/80 p-4">
                      <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                        {index + 1}. {step.title}
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Check</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{step.check}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Why</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{step.why}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--positive-text)]">If it runs hot / strong</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{step.ifHotOrStrong}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--negative-text)]">If it cools / weakens</p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{step.ifCoolOrWeak}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-[18px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">What to check next</p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--text-primary)]">{step.thenCheck}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Case examples</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {section.cases.map((item) => (
                    <div key={item.title} className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/80 p-4">
                      <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</p>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]"><span className="font-semibold text-[color:var(--text-primary)]">Setup:</span> {item.setup}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]"><span className="font-semibold text-[color:var(--text-primary)]">Interpretation:</span> {item.interpretation}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]"><span className="font-semibold text-[color:var(--text-primary)]">Confirm:</span> {item.confirm}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]"><span className="font-semibold text-[color:var(--text-primary)]">Assets:</span> {item.assets}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="surface-inset rounded-[24px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Daily scorecard</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.dailyScorecard.map((item) => (
                    <div key={item} className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/80 px-3 py-3 text-sm leading-6 text-[color:var(--text-primary)]">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      ))}

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 text-[color:var(--accent-strong)]" />
          <div>
            <p className="section-kicker">Common Mistakes</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">The traps to avoid</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {macroFlowCommonMistakes.map((item) => (
            <article key={item.mistake} className="surface-inset rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.mistake}</p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.cleanerPath}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
