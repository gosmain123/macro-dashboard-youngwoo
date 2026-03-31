"use client";

import { useCallback, useEffect, useState } from "react";

type MarketQuoteResponse = {
  symbol: string;
  price: number;
  change_abs: number | null;
  change_pct: number | null;
  as_of: string;
  source_name: string | null;
  source_url: string | null;
  payload: Record<string, unknown> | null;
  cached: boolean;
  error?: string;
};
 
export function useMarketQuote(symbol: "gold", refreshMs = 15000) {
  const [data, setData] = useState<MarketQuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/market/quote?symbol=${symbol}`, {
        cache: "no-store"
      });

      const payload = (await response.json()) as MarketQuoteResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load market quote.");
      }

      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown quote error.");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    void fetchQuote();

    const id = window.setInterval(() => {
      void fetchQuote();
    }, refreshMs);

    return () => window.clearInterval(id);
  }, [fetchQuote, refreshMs]);

  return { data, loading, error };
}
