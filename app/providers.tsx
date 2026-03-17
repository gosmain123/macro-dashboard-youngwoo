"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { ExperienceMode } from "@/types/macro";

interface ExperienceContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExperienceMode>("beginner");

  useEffect(() => {
    const storedMode = window.localStorage.getItem("macro-dashboard-mode");

    if (storedMode === "advanced" || storedMode === "beginner") {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("macro-dashboard-mode", mode);
  }, [mode]);

  return <ExperienceContext.Provider value={{ mode, setMode }}>{children}</ExperienceContext.Provider>;
}

export function useExperienceMode() {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error("useExperienceMode must be used within Providers.");
  }

  return context;
}
