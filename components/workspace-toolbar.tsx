"use client";

import Link from "next/link";
import { Camera, RotateCcw, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { useWorkspace } from "@/components/workspace-provider";
import { formatTimestamp } from "@/lib/utils";

export function WorkspaceToolbar() {
  const pathname = usePathname();
  const { hiddenSlugs, pinnedSlugs, watchlistSlugs, savedSnapshots, saveSnapshot, removeSnapshot, resetWorkspace } =
    useWorkspace();

  function handleSaveSnapshot() {
    const trimmedPath = pathname === "/" ? "dashboard" : pathname.replaceAll("/", " ").trim();
    saveSnapshot({
      path: pathname,
      name: `Snapshot | ${trimmedPath} | ${new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}`
    });
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Workspace</p>
          <p className="mt-2 text-sm text-slate-300">
            {pinnedSlugs.length} pinned | {watchlistSlugs.length} in watchlist | {hiddenSlugs.length} hidden
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveSnapshot}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/40"
          >
            <Camera className="h-3.5 w-3.5" />
            Save snapshot
          </button>
          <button
            type="button"
            onClick={resetWorkspace}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset view
          </button>
        </div>
      </div>

      {savedSnapshots.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {savedSnapshots.slice(0, 6).map((snapshot) => (
            <div key={snapshot.id} className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{snapshot.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTimestamp(snapshot.savedAt)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {snapshot.pinnedCount} pinned | {snapshot.watchlistCount} watchlist
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSnapshot(snapshot.id)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
                  aria-label={`Remove ${snapshot.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <Link
                href={snapshot.path}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:text-white"
              >
                Open snapshot route
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
