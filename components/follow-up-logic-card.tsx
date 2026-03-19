import { ChevronDown, GitBranch, ShieldAlert } from "lucide-react";

import type { FollowUpLogic } from "@/lib/playbook-guide";

export function FollowUpLogicCard({
  logic,
  defaultOpen = false
}: {
  logic: FollowUpLogic;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="rounded-[22px] border border-white/8 bg-slate-950 p-3"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200">
          <GitBranch className="h-4 w-4 text-cyan-200" />
          <span className="text-sm font-medium">Follow-up Logic</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </summary>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What this means</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{logic.meaning}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What to check next</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{logic.nextCheck}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What would confirm it</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{logic.confirmation}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-900 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">What would invalidate it</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{logic.invalidation}</p>
        </div>
      </div>

      {logic.cautions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {logic.cautions.map((caution) => (
            <span
              key={caution}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {caution}
            </span>
          ))}
        </div>
      ) : null}
    </details>
  );
}
