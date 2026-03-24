import { NextRequest, NextResponse } from "next/server";

import {
  fetchMarketLiveHistory,
  type MarketHistoryRange,
  type MarketLiveSymbol
} from "@/lib/server/providers/market-live";

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

function isSupportedSymbol(value: string | null): value is MarketLiveSymbol {
  return value === "gold";
}

function isSupportedRange(value: string | null): value is MarketHistoryRange {
  return value !== null && SUPPORTED_RANGES.includes(value as MarketHistoryRange);
}

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get("symbol");
    const rangeParam = request.nextUrl.searchParams.get("range");

    if (!isSupportedSymbol(symbolParam)) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    if (!isSupportedRange(rangeParam)) {
      return NextResponse.json({ error: "Unsupported range" }, { status: 400 });
    }

    const points = await fetchMarketLiveHistory(symbolParam, rangeParam);

    return NextResponse.json({
      symbol: symbolParam,
      range: rangeParam,
      points
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown market history error."
      },
      { status: 500 }
    );
  }
}
