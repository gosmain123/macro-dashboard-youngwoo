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
  const { data: quoteData } = useMarketQuote("gold", 15000);

  const patchedIndicator = useMemo<MacroIndicator>(() => {
    const updatedAt = quoteData?.as_of ?? indicator.updatedAt;

    return {
      ...indicator,
      currentValue: quoteData?.price ?? indicator.currentValue,
      status: quoteData ? "live" : indicator.status,
      dataStatus: quoteData ? "live" : indicator.dataStatus,
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
      fallbackUsageReason: quoteData ? undefined : indicator.fallbackUsageReason,
      errorMessage: quoteData ? undefined : indicator.errorMessage
    };
  }, [indicator, quoteData]);

  return <IndicatorCard indicator={patchedIndicator} />;
}
