"use client";

import { useEffect, useState } from "react";

type MarketBarsResponse = {
  symbol: string;
  points: Array<{ date: string; value: number }>;
  cached: boolean;
  error?: string;
};

export function useMarketBars(symbol: "gold", limit = 180, refreshMs = 60000) {
  const [data, setData] = useState<MarketBarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchBars() {
      try {
        const response = await fetch(`/api/market/bars?symbol=${symbol}&limit=${limit}`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as MarketBarsResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load market bars.");
        }

        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown bars error.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchBars();
    const id = window.setInterval(() => {
      void fetchBars();
    }, refreshMs);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [symbol, limit, refreshMs]);

  return { data, loading, error };
}
