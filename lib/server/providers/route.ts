import { NextRequest, NextResponse } from "next/server";

import { fetchMarketLiveQuote, type MarketLiveSymbol } from "@/lib/server/providers/market-live";
import { createSupabaseAdminClient } from "@/lib/server/supabase";

const CACHE_SECONDS = 15;

type MarketLatestRow = {
  symbol: string;
  price: number | null;
  change_abs: number | null;
  change_pct: number | null;
  as_of: string;
  source_name: string | null;
  source_url: string | null;
  payload: Record<string, unknown> | null;
  updated_at: string | null;
};

function isFreshEnough(updatedAt: string | null | undefined): boolean {
  if (!updatedAt) {
    return false;
  }

  const updatedMs = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedMs)) {
    return false;
  }

  return Date.now() - updatedMs <= CACHE_SECONDS * 1000;
}

function isSupportedSymbol(value: string | null): value is MarketLiveSymbol {
  return value === "gold";
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get("symbol");

    if (!isSupportedSymbol(symbolParam)) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    const symbol = symbolParam;
    const supabase = createSupabaseAdminClient();

    const readResult = await supabase
      .from("market_latest")
      .select("symbol,price,change_abs,change_pct,as_of,source_name,source_url,payload,updated_at")
      .eq("symbol", symbol)
      .limit(1)
      .returns<MarketLatestRow[]>();

    if (readResult.error) {
      throw new Error(`Failed to read market_latest: ${readResult.error.message}`);
    }

    const existingRow = readResult.data?.[0] ?? null;

    if (existingRow && isFreshEnough(existingRow.updated_at)) {
      return NextResponse.json({
        symbol: existingRow.symbol,
        price: existingRow.price,
        change_abs: existingRow.change_abs,
        change_pct: existingRow.change_pct,
        as_of: existingRow.as_of,
        source_name: existingRow.source_name,
        source_url: existingRow.source_url,
        payload: existingRow.payload,
        cached: true
      });
    }

    const liveQuote = await fetchMarketLiveQuote(symbol);

    const previousPrice = existingRow ? toFiniteNumber(existingRow.price) : null;

    const changeAbs =
      previousPrice !== null
        ? Number((liveQuote.price - previousPrice).toFixed(4))
        : null;

    const changePct =
      previousPrice !== null && previousPrice !== 0
        ? Number((((liveQuote.price / previousPrice) - 1) * 100).toFixed(4))
        : null;

    const upsertRow = {
      symbol,
      price: liveQuote.price,
      change_abs: changeAbs,
      change_pct: changePct,
      as_of: liveQuote.asOf,
      source_name: liveQuote.sourceName,
      source_url: liveQuote.sourceUrl,
      payload: {
        vendor_symbol: liveQuote.vendorSymbol,
        fetched_at: liveQuote.asOf
      }
    };

    const upsertResult = await supabase
      .from("market_latest")
      .upsert(upsertRow, { onConflict: "symbol" });

    if (upsertResult.error) {
      throw new Error(`Failed to upsert market_latest: ${upsertResult.error.message}`);
    }

    return NextResponse.json({
      ...upsertRow,
      cached: false
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown market quote error."
      },
      { status: 500 }
    );
  }
}
