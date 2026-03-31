"use client";

import { useMemo } from "react";

import { IndicatorCard } from "@/components/indicator-card";
import {
  getLiveMarketSymbolBySlug,
  getLiveQuoteRefreshMs,
  type LiveMarketSymbol
} from "@/lib/market-live-config";
import { useMarketQuote } from "@/lib/hooks/use-market-quote";
import type { MacroIndicator } from "@/types/macro";

function LiveMarketIndicatorCardInner({
  indicator,
  symbol
}: {
  indicator: MacroIndicator;
  symbol: LiveMarketSymbol;
}) {
  const {
    data: quoteData,
    loading: quoteLoading,
    error: quoteError
  } = useMarketQuote(symbol, getLiveQuoteRefreshMs(indicator.slug));

  const patchedIndicator = useMemo<MacroIndicator>(() => {
    const hasSeedValue = Number.isFinite(indicator.currentValue);
    const useDegradedLiveState =
      !quoteData && hasSeedValue && (quoteLoading || Boolean(quoteError));

    const updatedAt = quoteData?.as_of ?? indicator.updatedAt;

    return {
      ...indicator,
      currentValue: quoteData?.price ?? indicator.currentValue,
      status: quoteData ? "live" : useDegradedLiveState ? "stale-live" : indicator.status,
      dataStatus: quoteData ? "live" : useDegradedLiveState ? "stale-live" : indicator.dataStatus,
      freshnessStatus: quoteData ? "fresh" : indicator.freshnessStatus,
      updatedAt,
      lastUpdated: updatedAt,
      lastSuccessfulFetch: quoteData ? updatedAt : indicator.lastSuccessfulFetch,
      nextReleaseAt: undefined,
      freshnessAgeMinutes: quoteData ? 0 : indicator.freshnessAgeMinutes,
      release: {
        type: "continuous",
        label: "Market live",
        detail: "Updates continuously from the live market feed.",
        sourceName: quoteData?.source_name ?? indicator.source.name,
        sourceUrl: quoteData?.source_url ?? indicator.source.url
      },
      source: {
        ...indicator.source,
        name: quoteData?.source_name ?? indicator.source.name,
        url: quoteData?.source_url ?? indicator.source.url
      },
      fallbackUsageReason: quoteData
        ? undefined
        : quoteError
          ? "Live quote is temporarily unavailable. Showing the last available value."
          : indicator.fallbackUsageReason,
      errorMessage: quoteData || quoteLoading ? undefined : (quoteError ?? indicator.errorMessage)
    };
  }, [indicator, quoteData, quoteLoading, quoteError]);

  return <IndicatorCard indicator={patchedIndicator} />;
}

export function LiveMarketIndicatorCard({
  indicator
}: {
  indicator: MacroIndicator;
}) {
  const symbol = getLiveMarketSymbolBySlug(indicator.slug);

  if (!symbol) {
    return <IndicatorCard indicator={indicator} />;
  }

  return <LiveMarketIndicatorCardInner indicator={indicator} symbol={symbol} />;
}
