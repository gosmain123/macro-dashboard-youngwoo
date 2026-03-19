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
    <div className="surface-card rounded-[28px] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-kicker">Workspace</p>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {pinnedSlugs.length} pinned | {watchlistSlugs.length} in watchlist | {hiddenSlugs.length} hidden
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleSaveSnapshot} className="soft-button-accent rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
            <span className="inline-flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" />
              Save snapshot
            </span>
          </button>
          <button type="button" onClick={resetWorkspace} className="soft-button rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset view
            </span>
          </button>
        </div>
      </div>

      {savedSnapshots.length > 0 ? (
        <details className="surface-inset mt-4 rounded-[22px] p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-[color:var(--text-primary)]">
            Saved snapshots ({savedSnapshots.length})
          </summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedSnapshots.slice(0, 6).map((snapshot) => (
              <div key={snapshot.id} className="surface-card rounded-[20px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--text-primary)]">{snapshot.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{formatTimestamp(snapshot.savedAt)}</p>
                    <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                      {snapshot.pinnedCount} pinned | {snapshot.watchlistCount} watchlist
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSnapshot(snapshot.id)}
                    className="soft-button rounded-full p-2 transition"
                    aria-label={`Remove ${snapshot.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Link href={snapshot.path} className="soft-button mt-3 inline-flex rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition">
                  Open snapshot route
                </Link>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
