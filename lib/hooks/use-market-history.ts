"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveMarketSymbol } from "@/lib/market-live-config";

export type MarketHistoryRange =
  | "1H"
  | "4H"
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "3Y"
  | "5Y"
  | "10Y"
  | "20Y"
  | "MAX";

type MarketHistoryResponse = {
  symbol: string;
  range: MarketHistoryRange;
  points: Array<{ date: string; value: number }>;
  error?: string;
};

export function useMarketHistory(
  symbol: LiveMarketSymbol,
  range: MarketHistoryRange,
  refreshMs = 30000
) {
  const [data, setData] = useState<MarketHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, MarketHistoryResponse>>(new Map());
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const cacheKey = `${symbol}:${range}`;

    async function fetchHistory(isRetry = false) {
      try {
        const cached = cacheRef.current.get(cacheKey);

        if (cached && active) {
          setData(cached);
          setError(null);
          setLoading(false);
        } else if (active) {
          setLoading(true);
        }

        const response = await fetch(`/api/market/history?symbol=${symbol}&range=${range}`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as MarketHistoryResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load market history.");
        }

        cacheRef.current.set(cacheKey, payload);

        if (active) {
          setData(payload);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : "Unknown market history error.");
        setLoading(false);

        if (!isRetry) {
          if (retryTimeoutRef.current) {
            window.clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = window.setTimeout(() => {
            void fetchHistory(true);
          }, 2500);
        }
      }
    }

    void fetchHistory(false);

    const id = window.setInterval(() => {
      void fetchHistory(false);
    }, refreshMs);

    return () => {
      active = false;
      window.clearInterval(id);

      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [symbol, range, refreshMs]);

  return { data, loading, error };
}
