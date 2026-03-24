"use client";

import { useMemo } from "react";

import { IndicatorCard } from "@/components/indicator-card";
import { useMarketBars } from "@/lib/hooks/use-market-bars";
import { useMarketQuote } from "@/lib/hooks/use-market-quote";
import type { ChartPoint, MacroIndicator } from "@/types/macro";

function mergeGoldChartHistory(
  longHistory: ChartPoint[],
  intradayHistory: ChartPoint[],
  quotePoint?: ChartPoint
) {
  const merged = new Map<string, ChartPoint>();

  for (const point of longHistory) {
    merged.set(point.date, point);
  }

  for (const point of intradayHistory) {
    merged.set(point.date, point);
  }

  if (quotePoint) {
    merged.set(quotePoint.date, quotePoint);
  }

  return [...merged.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function LiveGoldIndicatorCard({
  indicator
}: {
  indicator: MacroIndicator;
}) {
  const { data: quoteData } = useMarketQuote("gold", 15000);
  const { data: barsData } = useMarketBars("gold", 390, 60000);

  const patchedIndicator = useMemo<MacroIndicator>(() => {
    const currentValue = quoteData?.price ?? indicator.currentValue;

    const priorValue =
      quoteData?.change_abs !== null && quoteData?.change_abs !== undefined
        ? Number((currentValue - quoteData.change_abs).toFixed(4))
        : indicator.priorValue;

    const longHistory = Array.isArray(indicator.chartHistory) ? indicator.chartHistory : [];
    const intradayHistory = barsData?.points ?? [];

    const quotePoint =
      quoteData?.as_of
        ? {
            date: quoteData.as_of,
            value: currentValue
          }
        : undefined;

    const chartHistory = mergeGoldChartHistory(longHistory, intradayHistory, quotePoint);

    const updatedAt = quoteData?.as_of ?? indicator.updatedAt;

    return {
      ...indicator,
      frequency: "Intraday",
      currentValue,
      priorValue,
      change: Number((currentValue - priorValue).toFixed(4)),
      chartHistory,
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
  }, [indicator, quoteData, barsData]);

  return <IndicatorCard indicator={patchedIndicator} />;
}
