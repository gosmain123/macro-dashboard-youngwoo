"use client";

import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "macro-signal-deck:theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const resolvedTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(resolvedTheme);
  }, []);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] p-1">
      <button
        type="button"
        onClick={() => updateTheme("light")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition",
          theme === "light"
            ? "bg-[color:var(--surface-strong)] text-[color:var(--text-primary)] shadow-sm"
            : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
        )}
        aria-pressed={theme === "light"}
      >
        <SunMedium className="h-3.5 w-3.5" />
        Light
      </button>
      <button
        type="button"
        onClick={() => updateTheme("dark")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition",
          theme === "dark"
            ? "bg-[color:var(--surface-strong)] text-[color:var(--text-primary)] shadow-sm"
            : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
        )}
        aria-pressed={theme === "dark"}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </button>
    </div>
  );
}
