"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { IndicatorCard } from "@/components/indicator-card";
import { RegimeCard } from "@/components/regime-card";
import { cn } from "@/lib/utils";
import type { DashboardPayload, MacroModuleSlug } from "@/types/macro";

const highlightSlugs = new Set([
  "core-pce",
  "services-ex-housing",
  "gdp-nowcast",
  "ism-services",
  "nonfarm-payrolls",
  "initial-claims",
  "net-liquidity",
  "us-2y-treasury",
  "hy-spreads",
  "breadth",
  "crowding-flags",
  "china-pmi"
]);

export function DashboardHome({ payload }: { payload: DashboardPayload }) {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<MacroModuleSlug | "all">("all");

  const filtered = payload.indicators.filter((indicator) => {
    const matchesModule = moduleFilter === "all" ? true : indicator.module === moduleFilter;
    const normalized = query.trim().toLowerCase();
    const matchesSearch =
      normalized.length === 0 ||
      indicator.searchTerms.some((term) => term.toLowerCase().includes(normalized)) ||
      indicator.regimeTag.toLowerCase().includes(normalized);

    return matchesModule && matchesSearch;
  });

  const visibleIndicators =
    query.trim().length > 0 || moduleFilter !== "all"
      ? filtered
      : payload.indicators.filter((indicator) => highlightSlugs.has(indicator.slug));

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl md:p-8">
          <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
            {payload.dataMode === "live" ? "Live data mode" : "Demo dataset preview"}
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {payload.regimeSnapshot.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            {payload.regimeSnapshot.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {payload.regimeSnapshot.labels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-slate-200"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {payload.regimeSnapshot.watchItems.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Watch next</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[34px] border border-white/10 bg-slate-950/55 p-6 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Module map</p>
          <div className="mt-5 space-y-3">
            {payload.modules.map((module) => (
              <Link
                key={module.slug}
                href={`/${module.slug}`}
                className="block rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-white">{module.title}</p>
                <p className="mt-1 text-sm text-slate-400">{module.description}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Composite regime</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Where the cycle stands now</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {payload.regimeCards.map((card) => (
            <RegimeCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Signal browser</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Search indicators without the clutter</h2>
          </div>
          <div className="grid w-full gap-3 md:grid-cols-[1fr_auto] lg:max-w-3xl">
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-soft">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search CPI, payrolls, liquidity, breadth..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              {(["all", ...payload.modules.map((module) => module.slug)] as const).map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => setModuleFilter(module)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] transition",
                    moduleFilter === module ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {module === "all" ? "All modules" : module.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {query.trim().length > 0 || moduleFilter !== "all"
              ? `${filtered.length} indicators matched`
              : "Showing a curated high-signal watchlist"}
          </span>
          <Link href="/playbook" className="text-cyan-200 hover:text-cyan-100">
            Open regime playbook
          </Link>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {visibleIndicators.map((indicator) => (
            <IndicatorCard key={indicator.slug} indicator={indicator} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
