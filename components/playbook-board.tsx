import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  GitBranch,
  Radar,
  ShieldAlert,
  TrendingUp,
  Waypoints
} from "lucide-react";

import {
  indicatorMeaningMap,
  logicChains,
  playbookCautions,
  viewBuilderScenarios
} from "@/lib/playbook-guide";
import { formatReleaseLabel } from "@/lib/utils";
import type { DashboardPayload } from "@/types/macro";

function getNextCatalyst(payload: DashboardPayload) {
  const today = new Date().toISOString().slice(0, 10);

  return payload.calendarEvents
    .filter((event) => event.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))[0];
}

function buildReadingOrder(payload: DashboardPayload) {
  const nextCatalyst = getNextCatalyst(payload);
  const watchlistNames = payload.homepage.watchlist.slice(0, 3).map((indicator) => indicator.shortName).join(" · ");

  return [
    {
      step: "Step 1",
      title: "Read Regime Summary",
      href: "/",
      detail: payload.regimeSnapshot.title,
      note: "Start with the big picture so one noisy print does not hijack the whole day."
    },
    {
      step: "Step 2",
      title: "Check Calendar For Today's Catalyst",
      href: "/calendar",
      detail: nextCatalyst
        ? `${nextCatalyst.title} · ${formatReleaseLabel(nextCatalyst.date, nextCatalyst.timeLabel)}`
        : "No immediate catalyst is scheduled.",
      note: "Know what can move the tape before you read the data."
    },
    {
      step: "Step 3",
      title: "Check Core Watchlist",
      href: "/",
      detail: watchlistNames || "Core Watchlist",
      note: "Use the watchlist to find the few indicators that matter most right now."
    },
    {
      step: "Step 4",
      title: "Check Workflow For Surprise / Revision",
      href: "/workflow",
      detail: "Look for what actually changed, not just what was scheduled.",
      note: "Surprises and revisions usually matter more than the headline template."
    },
    {
      step: "Step 5",
      title: "Confirm In Rates & Credit",
      href: "/rates-credit",
      detail: "2Y, 10Y, curve, IG, and HY tell you whether markets believe the story.",
      note: "If rates and credit disagree, confidence should stay lower."
    },
    {
      step: "Step 6",
      title: "Build A Tentative Macro View",
      href: "/playbook",
      detail: "Write the likely regime, then write what would prove you wrong.",
      note: "Make the view conditional. That is how you avoid overreacting."
    }
  ] as const;
}

export function PlaybookBoard({ payload }: { payload: DashboardPayload }) {
  const readingOrder = buildReadingOrder(payload);

  return (
    <div className="min-w-0 space-y-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Playbook</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Turn the dashboard into a reasoning flow</h1>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">
            Start with the regime, check the catalyst, read the core prints, then confirm the story in rates and credit before you make the call bigger than it deserves.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {playbookCautions.map((caution) => (
              <span
                key={caution}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {caution}
              </span>
            ))}
          </div>
        </div>

        <aside className="min-w-0 overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/55 p-6 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Start Here</p>
          <div className="mt-5 rounded-[26px] border border-white/8 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current regime summary</p>
            <p className="mt-3 text-lg font-semibold text-white">{payload.regimeSnapshot.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{payload.regimeSnapshot.summary}</p>
          </div>
          <div className="mt-4 rounded-[26px] border border-white/8 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Why this page exists</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The goal is not to guess faster. It is to follow the same order every day so one print does not become a whole regime call by accident.
            </p>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Daily Reading Order</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">A top-down sequence for reading the dashboard</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {readingOrder.map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{item.step}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium text-slate-200">{item.detail}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.note}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Indicator Meaning Map</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">What the main prints are actually trying to tell you</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {indicatorMeaningMap.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-white">{item.meaning}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.whyItMatters}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Logic Chains</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Trigger, meaning, next check, confirmation, mistake to avoid</h2>
        </div>

        <div className="space-y-4">
          {logicChains.map((chain, index) => (
            <details
              key={chain.id}
              id={chain.id}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <GitBranch className="h-4 w-4" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">{chain.title}</p>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{chain.trigger}</h3>
                </div>
                <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
              </summary>

              <div className="mt-5 grid gap-3 xl:grid-cols-5">
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Radar className="h-4 w-4" />
                    Trigger
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{chain.trigger}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpenText className="h-4 w-4" />
                    What it may mean
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{chain.meaning}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Waypoints className="h-4 w-4" />
                    What to check next
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{chain.nextCheck}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    Market confirmation
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{chain.marketConfirmation}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldAlert className="h-4 w-4" />
                    Common mistake to avoid
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{chain.commonMistake}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {chain.cautions.map((caution) => (
                  <span
                    key={caution}
                    className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100"
                  >
                    {caution}
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Regime Builder</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">The data combinations that usually point toward each regime</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {payload.playbooks.map((playbook) => (
            <article
              key={playbook.slug}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
            >
              <h3 className="text-2xl font-semibold text-white">{playbook.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{playbook.summary}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Data combination</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{playbook.marketPlaybook}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">What keeps you honest</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{playbook.riskWatch}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {playbook.dashboardFocus.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">View Builder</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Possible interpretations, not hard investment advice</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {viewBuilderScenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-soft backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold text-white">{scenario.title}</h3>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Data setup</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{scenario.setup}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Tentative interpretation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{scenario.interpretation}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Confirm with</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{scenario.confirmWith}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Do not do this</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{scenario.avoid}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
