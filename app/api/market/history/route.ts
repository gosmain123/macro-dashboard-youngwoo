import { NextRequest, NextResponse } from "next/server";

import { fetchMarketLiveHistory, type MarketHistoryRange } from "@/lib/server/providers/market-live";
import { isSupportedLiveMarketSymbol, type LiveMarketSymbol } from "@/lib/market-live-config";

const SUPPORTED_RANGES: MarketHistoryRange[] = [
  "1H",
  "4H",
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "1Y",
  "3Y",
  "5Y",
  "10Y",
  "20Y",
  "MAX"
];

const RANGE_TTL_MS: Record<MarketHistoryRange, number> = {
  "1H": 15_000,
  "4H": 30_000,
  "1D": 60_000,
  "5D": 5 * 60_000,
  "1M": 10 * 60_000,
  "3M": 30 * 60_000,
  "6M": 30 * 60_000,
  "1Y": 60 * 60_000,
  "3Y": 6 * 60 * 60_000,
  "5Y": 6 * 60 * 60_000,
  "10Y": 24 * 60 * 60_000,
  "20Y": 24 * 60 * 60_000,
  "MAX": 24 * 60 * 60_000
};

type HistoryPayload = {
  symbol: LiveMarketSymbol;
  range: MarketHistoryRange;
  points: Array<{ date: string; value: number }>;
};

type CacheEntry = {
  expiresAt: number;
  payload: HistoryPayload;
};

declare global {
  // eslint-disable-next-line no-var
  var __marketHistoryCache: Map<string, CacheEntry> | undefined;
}

const historyCache = globalThis.__marketHistoryCache ?? new Map<string, CacheEntry>();
globalThis.__marketHistoryCache = historyCache;

function isSupportedRange(value: string | null): value is MarketHistoryRange {
  return value !== null && SUPPORTED_RANGES.includes(value as MarketHistoryRange);
}

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get("symbol");
    const rangeParam = request.nextUrl.searchParams.get("range");

    if (!isSupportedLiveMarketSymbol(symbolParam)) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    if (!isSupportedRange(rangeParam)) {
      return NextResponse.json({ error: "Unsupported range" }, { status: 400 });
    }

    const cacheKey = `${symbolParam}:${rangeParam}`;
    const now = Date.now();
    const cached = historyCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.payload);
    }

    const points = await fetchMarketLiveHistory(symbolParam, rangeParam);

    const payload: HistoryPayload = {
      symbol: symbolParam,
      range: rangeParam,
      points
    };

    historyCache.set(cacheKey, {
      expiresAt: now + RANGE_TTL_MS[rangeParam],
      payload
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown market history error."
      },
      { status: 500 }
    );
  }
}
