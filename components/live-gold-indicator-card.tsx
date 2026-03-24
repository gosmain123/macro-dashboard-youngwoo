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
    const currentValue = quoteData?.price ?? indicator.currentValue;

    const priorValue =
      quoteData?.change_abs !== null && quoteData?.change_abs !== undefined
        ? Number((currentValue - quoteData.change_abs).toFixed(4))
        : indicator.priorValue;

    const updatedAt = quoteData?.as_of ?? indicator.updatedAt;

    return {
      ...indicator,
      currentValue,
      priorValue,
      change: Number((currentValue - priorValue).toFixed(4)),
      status: quoteData ? "live" : indicator.status,
      dataStatus: quoteData ? "live" : indicator.dataStatus,
      updatedAt,
      lastUpdated: updatedAt,
      nextReleaseAt: undefined,
      freshnessAgeMinutes: 0,
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
