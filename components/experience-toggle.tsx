"use client";

import { useExperienceMode } from "@/app/providers";
import { cn } from "@/lib/utils";

export function ExperienceToggle() {
  const { mode, setMode } = useExperienceMode();

  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/6 p-1 shadow-soft backdrop-blur">
      {(["beginner", "advanced"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setMode(item)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition",
            mode === item
              ? "bg-white text-slate-950"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
