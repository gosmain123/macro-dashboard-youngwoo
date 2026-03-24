import { NextRequest, NextResponse } from "next/server";

import { fetchMarketLiveBars, type MarketBar, type MarketLiveSymbol } from "@/lib/server/providers/market-live";
import { createSupabaseAdminClient } from "@/lib/server/supabase";

type MarketBarRow = {
  symbol: string;
  bar_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  source_name: string | null;
  payload: Record<string, unknown> | null;
};

function isSupportedSymbol(value: string | null): value is MarketLiveSymbol {
  return value === "gold";
}

function mapRowToChartPoint(row: MarketBarRow) {
  return {
    date: row.bar_time,
    value: row.close
  };
}

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get("symbol");
    const limitParam = request.nextUrl.searchParams.get("limit");

    if (!isSupportedSymbol(symbolParam)) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    const symbol = symbolParam;
    const limit = Math.min(Math.max(Number(limitParam ?? "180"), 30), 390);
    const supabase = createSupabaseAdminClient();

    const readResult = await supabase
      .from("market_bars_1m")
      .select("symbol,bar_time,open,high,low,close,volume,source_name,payload")
      .eq("symbol", symbol)
      .order("bar_time", { ascending: false })
      .limit(limit)
      .returns<MarketBarRow[]>();

    if (readResult.error) {
      throw new Error(`Failed to read market_bars_1m: ${readResult.error.message}`);
    }

    const existingRows = Array.isArray(readResult.data) ? [...readResult.data].reverse() : [];
    const latestBarTime = existingRows.length > 0 ? existingRows[existingRows.length - 1].bar_time : null;

    const latestMs = latestBarTime ? new Date(latestBarTime).getTime() : NaN;
    const isFresh =
      Number.isFinite(latestMs) && Date.now() - latestMs <= 90 * 1000 && existingRows.length >= 30;

    if (isFresh) {
      return NextResponse.json({
        symbol,
        points: existingRows.map(mapRowToChartPoint),
        cached: true
      });
    }

    const bars = await fetchMarketLiveBars(symbol, limit);

    const upsertRows = bars.map((bar: MarketBar) => ({
      symbol: bar.symbol,
      bar_time: bar.barTime,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
      source_name: bar.sourceName,
      payload: {
        source_url: bar.sourceUrl
      }
    }));

    const upsertResult = await supabase
      .from("market_bars_1m")
      .upsert(upsertRows, { onConflict: "symbol,bar_time" });

    if (upsertResult.error) {
      throw new Error(`Failed to upsert market_bars_1m: ${upsertResult.error.message}`);
    }

    return NextResponse.json({
      symbol,
      points: bars.map((bar) => ({
        date: bar.barTime,
        value: bar.close
      })),
      cached: false
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown market bars error."
      },
      { status: 500 }
    );
  }
}
