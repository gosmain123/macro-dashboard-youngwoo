"use client";

import { MetaChip } from "@/components/meta-chip";
import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { SparklineChart } from "@/components/sparkline-chart";
import { WidgetErrorBoundary } from "@/components/widget-error-boundary";
import { cn, formatIndicatorValue } from "@/lib/utils";
import type { MacroIndicator } from "@/types/macro";

function statusTone(status: MacroIndicator["status"]) {
  if (status === "live") {
    return "emerald" as const;
  }

  if (status === "fallback" || status === "stale-live") {
    return "amber" as const;
  }

  return "rose" as const;
}

function valueTone(indicator: MacroIndicator) {
  if (indicator.tone === "positive") {
    return "text-[color:var(--positive-text)]";
  }

  if (indicator.tone === "negative") {
    return "text-[color:var(--negative-text)]";
  }

  return "text-[color:var(--text-primary)]";
}

export function IndicatorCard({
  indicator
}: {
  indicator: MacroIndicator;
}) {
  const safeSummary = indicator.summary?.trim() || indicator.advancedSummary?.trim() || "Summary unavailable.";
  const safeChartHistory = Array.isArray(indicator.chartHistory) ? indicator.chartHistory : [];

  return (
    <article
      id={indicator.slug}
      className="surface-card flex h-full min-h-[25.5rem] scroll-mt-28 flex-col overflow-hidden rounded-[24px] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {indicator.unitLabel}
          </p>
          <h3 className="mt-2 break-words text-xl font-semibold text-[color:var(--text-primary)] [overflow-wrap:anywhere]">{indicator.name}</h3>
        </div>
        <MetaChip label="Status" value={indicator.status} tone={statusTone(indicator.status)} />
      </div>

      <div className="mt-4 min-w-0">
        <p className={cn("break-words text-[2.65rem] font-semibold tracking-tight [overflow-wrap:anywhere]", valueTone(indicator))}>
          {formatIndicatorValue(indicator.currentValue, indicator.unit)}
        </p>
      </div>

      <p className="mt-3 min-h-[2.75rem] text-sm leading-6 text-[color:var(--text-secondary)] line-clamp-2">
        {safeSummary}
      </p>

      <div className="surface-inset mt-4 overflow-hidden rounded-[20px] px-3 py-2">
        <WidgetErrorBoundary compact title="Chart unavailable" description="This card is still usable without the mini chart.">
          <SparklineChart
            data={safeChartHistory}
            frequency={indicator.frequency}
            unit={indicator.unit}
            showOverlay={Boolean(indicator.overlays?.length)}
            variant="compact"
          />
        </WidgetErrorBoundary>
      </div>

      <div className="mt-3">
        <WidgetErrorBoundary compact title="Links unavailable" description="The card still renders even if the follow-up map is missing.">
          <IndicatorActionLinks indicator={indicator} />
        </WidgetErrorBoundary>
      </div>

      <div className="mt-auto pt-3">
        <WidgetErrorBoundary compact title="Details unavailable" description="The headline card stays available even if the detail drawer cannot open.">
          <IndicatorTooltip indicator={indicator} trigger="button" />
        </WidgetErrorBoundary>
      </div>
    </article>
  );
}
