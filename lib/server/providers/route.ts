import { NextRequest, NextResponse } from "next/server";

import { fetchMarketLiveQuote, type MarketLiveSymbol } from "@/lib/server/providers/market-live";
import { createSupabaseAdminClient } from "@/lib/server/supabase";

const CACHE_SECONDS = 15;

function isFreshEnough(updatedAt: string | null | undefined) {
  if (!updatedAt) {
    return false;
  }

  const updatedMs = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedMs)) {
    return false;
  }

  return Date.now() - updatedMs <= CACHE_SECONDS * 1000;
}

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get("symbol");

    if (symbolParam !== "gold") {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    const symbol = symbolParam as MarketLiveSymbol;
    const supabase = createSupabaseAdminClient();

    const { data: existingRow, error: readError } = await supabase
      .from("market_latest")
      .select("*")
      .eq("symbol", symbol)
      .maybeSingle();

    if (readError) {
      throw new Error(`Failed to read market_latest: ${readError.message}`);
    }

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

    const previousPrice =
      existingRow && typeof existingRow.price === "number"
        ? existingRow.price
        : typeof existingRow.price === "string"
          ? Number(existingRow.price)
          : null;

    const changeAbs =
      previousPrice !== null && Number.isFinite(previousPrice)
        ? Number((liveQuote.price - previousPrice).toFixed(4))
        : null;

    const changePct =
      previousPrice !== null && Number.isFinite(previousPrice) && previousPrice !== 0
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

    const { error: upsertError } = await supabase
      .from("market_latest")
      .upsert(upsertRow, { onConflict: "symbol" });

    if (upsertError) {
      throw new Error(`Failed to upsert market_latest: ${upsertError.message}`);
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
