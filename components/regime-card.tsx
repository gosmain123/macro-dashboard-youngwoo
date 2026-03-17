import { ArrowUpRight, Gauge } from "lucide-react";

import { formatScore } from "@/lib/utils";
import type { RegimeCard as RegimeCardType } from "@/types/macro";

export function RegimeCard({ card }: { card: RegimeCardType }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-soft backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">{card.title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{card.label}</h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
          <Gauge className="h-5 w-5 text-cyan-200" />
        </div>
      </div>
      <p className="text-sm text-slate-200">{card.status}</p>
      <p className="mt-2 text-sm text-slate-400">{card.description}</p>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-slate-300">
          Composite score <span className="font-semibold text-white">{formatScore(card.score)}</span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {card.drivers.join(" | ")}
        </div>
      </div>
    </article>
  );
}
