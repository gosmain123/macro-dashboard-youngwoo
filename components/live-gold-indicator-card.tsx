"use client";

import { useMemo } from "react";

import { IndicatorCard } from "@/components/indicator-card";
import { useMarketQuote } from "@/lib/hooks/use-market-quote";
import type { MacroIndicator } from "@/types/macro";

export function LiveGoldIndicatorCard({
  indicator
}: {
  indicator: MacroIndicator;
}) {
  const {
    data: quoteData,
    loading: quoteLoading,
    error: quoteError
  } = useMarketQuote("gold", 15000);

  const patchedIndicator = useMemo<MacroIndicator>(() => {
    const hasSeedValue = Number.isFinite(indicator.currentValue);
    const useDegradedLiveState = !quoteData && hasSeedValue && (quoteLoading || Boolean(quoteError));
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
        sourceName: quoteData?.source_name ?? "Twelve Data",
        sourceUrl: quoteData?.source_url ?? indicator.source.url
      },
      source: {
        ...indicator.source,
        name: quoteData?.source_name ?? "Twelve Data",
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
