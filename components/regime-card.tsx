import { Gauge } from "lucide-react";

import { formatScore } from "@/lib/utils";
import type { RegimeCard as RegimeCardType } from "@/types/macro";

export function RegimeCard({ card }: { card: RegimeCardType }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">{card.title}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{card.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{card.status}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Score</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <Gauge className="h-4 w-4 text-cyan-200" />
            <span className="text-xl font-semibold text-white">{formatScore(card.score)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {card.drivers.slice(0, 3).map((driver) => (
          <span
            key={driver}
            className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300"
          >
            {driver}
          </span>
        ))}
      </div>
    </article>
  );
}
