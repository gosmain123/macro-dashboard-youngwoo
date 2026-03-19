"use client";

import { Layers3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type UserMode = "beginner" | "pro";

const storageKey = "macro-signal-deck:user-mode";

export function UserModeToggle() {
  const [mode, setMode] = useState<UserMode>("beginner");

  useEffect(() => {
    const storedMode =
      typeof window !== "undefined" ? (window.localStorage.getItem(storageKey) as UserMode | null) : null;
    const resolvedMode = storedMode === "pro" ? "pro" : "beginner";

    setMode(resolvedMode);
    document.documentElement.dataset.userMode = resolvedMode;
  }, []);

  function updateMode(nextMode: UserMode) {
    setMode(nextMode);
    document.documentElement.dataset.userMode = nextMode;
    window.localStorage.setItem(storageKey, nextMode);
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => updateMode("beginner")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
          mode === "beginner"
            ? "bg-cyan-300/15 text-white"
            : "text-slate-400 hover:text-white"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Beginner
      </button>
      <button
        type="button"
        onClick={() => updateMode("pro")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
          mode === "pro"
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:text-white"
        )}
      >
        <Layers3 className="h-3.5 w-3.5" />
        Pro
      </button>
    </div>
  );
}
