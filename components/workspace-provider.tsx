"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SavedSnapshot = {
  id: string;
  name: string;
  path: string;
  savedAt: string;
  watchlistCount: number;
  pinnedCount: number;
};

type WorkspaceState = {
  pinnedSlugs: string[];
  hiddenSlugs: string[];
  orderedSlugs: string[];
  watchlistSlugs: string[];
  savedSnapshots: SavedSnapshot[];
};

type WorkspaceContextValue = WorkspaceState & {
  isPinned: (slug: string) => boolean;
  isHidden: (slug: string) => boolean;
  isInWatchlist: (slug: string) => boolean;
  togglePinned: (slug: string) => void;
  toggleHidden: (slug: string) => void;
  toggleWatchlist: (slug: string) => void;
  moveIndicator: (slug: string, direction: "up" | "down", visibleSlugs: string[]) => void;
  applyIndicatorPreferences: <T extends { slug: string }>(indicators: T[]) => T[];
  saveSnapshot: (input: { path: string; name: string }) => void;
  removeSnapshot: (id: string) => void;
  resetWorkspace: () => void;
};

const storageKey = "macro-signal-deck:workspace";

const defaultState: WorkspaceState = {
  pinnedSlugs: [],
  hiddenSlugs: [],
  orderedSlugs: [],
  watchlistSlugs: [],
  savedSnapshots: []
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function unique(values: string[]) {
  return [...new Set(values)];
}

function isSavedSnapshot(value: unknown): value is SavedSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<SavedSnapshot>;

  return (
    typeof snapshot.id === "string" &&
    typeof snapshot.name === "string" &&
    typeof snapshot.path === "string" &&
    snapshot.path.trim().startsWith("/") &&
    typeof snapshot.savedAt === "string" &&
    typeof snapshot.watchlistCount === "number" &&
    typeof snapshot.pinnedCount === "number"
  );
}

function normalizeWorkspaceState(value: Partial<WorkspaceState> | null | undefined): WorkspaceState {
  return {
    pinnedSlugs: unique(Array.isArray(value?.pinnedSlugs) ? value.pinnedSlugs.filter((entry): entry is string => typeof entry === "string") : []),
    hiddenSlugs: unique(Array.isArray(value?.hiddenSlugs) ? value.hiddenSlugs.filter((entry): entry is string => typeof entry === "string") : []),
    orderedSlugs: unique(Array.isArray(value?.orderedSlugs) ? value.orderedSlugs.filter((entry): entry is string => typeof entry === "string") : []),
    watchlistSlugs: unique(Array.isArray(value?.watchlistSlugs) ? value.watchlistSlugs.filter((entry): entry is string => typeof entry === "string") : []),
    savedSnapshots: Array.isArray(value?.savedSnapshots) ? value.savedSnapshots.filter(isSavedSnapshot).slice(0, 12) : []
  };
}

function readWorkspaceState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return defaultState;
    }

    return normalizeWorkspaceState(JSON.parse(raw) as Partial<WorkspaceState>);
  } catch {
    return defaultState;
  }
}

function writeWorkspaceState(value: WorkspaceState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Keep the app usable even when storage is blocked or quota is exceeded.
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readWorkspaceState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeWorkspaceState(state);
  }, [hydrated, state]);

  const value = useMemo<WorkspaceContextValue>(() => {
    function isPinned(slug: string) {
      return state.pinnedSlugs.includes(slug);
    }

    function isHidden(slug: string) {
      return state.hiddenSlugs.includes(slug);
    }

    function isInWatchlist(slug: string) {
      return state.watchlistSlugs.includes(slug);
    }

    function togglePinned(slug: string) {
      setState((current) => ({
        ...current,
        pinnedSlugs: current.pinnedSlugs.includes(slug)
          ? current.pinnedSlugs.filter((entry) => entry !== slug)
          : [slug, ...current.pinnedSlugs],
        hiddenSlugs: current.hiddenSlugs.filter((entry) => entry !== slug)
      }));
    }

    function toggleHidden(slug: string) {
      setState((current) => ({
        ...current,
        hiddenSlugs: current.hiddenSlugs.includes(slug)
          ? current.hiddenSlugs.filter((entry) => entry !== slug)
          : unique([...current.hiddenSlugs, slug]),
        pinnedSlugs: current.pinnedSlugs.filter((entry) => entry !== slug),
        watchlistSlugs: current.watchlistSlugs.filter((entry) => entry !== slug)
      }));
    }

    function toggleWatchlist(slug: string) {
      setState((current) => ({
        ...current,
        watchlistSlugs: current.watchlistSlugs.includes(slug)
          ? current.watchlistSlugs.filter((entry) => entry !== slug)
          : unique([...current.watchlistSlugs, slug]),
        hiddenSlugs: current.hiddenSlugs.filter((entry) => entry !== slug)
      }));
    }

    function moveIndicator(slug: string, direction: "up" | "down", visibleSlugs: string[]) {
      setState((current) => {
        const orderedVisible = visibleSlugs.slice();
        const index = orderedVisible.indexOf(slug);

        if (index === -1) {
          return current;
        }

        const swapIndex = direction === "up" ? index - 1 : index + 1;

        if (swapIndex < 0 || swapIndex >= orderedVisible.length) {
          return current;
        }

        const swapped = orderedVisible.slice();
        [swapped[index], swapped[swapIndex]] = [swapped[swapIndex], swapped[index]];

        const remainder = current.orderedSlugs.filter((entry) => !visibleSlugs.includes(entry));
        return {
          ...current,
          orderedSlugs: unique([...swapped, ...remainder])
        };
      });
    }

    function applyIndicatorPreferences<T extends { slug: string }>(indicators: T[]) {
      const orderIndex = new Map(state.orderedSlugs.map((slug, index) => [slug, index]));
      const pinIndex = new Map(state.pinnedSlugs.map((slug, index) => [slug, index]));

      return indicators
        .filter((indicator) => !state.hiddenSlugs.includes(indicator.slug))
        .slice()
        .sort((left, right) => {
          const leftPinned = pinIndex.has(left.slug);
          const rightPinned = pinIndex.has(right.slug);

          if (leftPinned && rightPinned) {
            return (pinIndex.get(left.slug) ?? 0) - (pinIndex.get(right.slug) ?? 0);
          }

          if (leftPinned) {
            return -1;
          }

          if (rightPinned) {
            return 1;
          }

          return (orderIndex.get(left.slug) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(right.slug) ?? Number.MAX_SAFE_INTEGER);
        });
    }

    function saveSnapshot(input: { path: string; name: string }) {
      setState((current) => ({
        ...current,
        savedSnapshots: [
          {
            id: `${Date.now()}`,
            name: input.name,
            path: input.path,
            savedAt: new Date().toISOString(),
            watchlistCount: current.watchlistSlugs.length,
            pinnedCount: current.pinnedSlugs.length
          },
          ...current.savedSnapshots
        ].slice(0, 12)
      }));
    }

    function removeSnapshot(id: string) {
      setState((current) => ({
        ...current,
        savedSnapshots: current.savedSnapshots.filter((snapshot) => snapshot.id !== id)
      }));
    }

    function resetWorkspace() {
      setState(defaultState);
    }

    return {
      ...state,
      isPinned,
      isHidden,
      isInWatchlist,
      togglePinned,
      toggleHidden,
      toggleWatchlist,
      moveIndicator,
      applyIndicatorPreferences,
      saveSnapshot,
      removeSnapshot,
      resetWorkspace
    };
  }, [state]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);

  if (!value) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return value;
}
