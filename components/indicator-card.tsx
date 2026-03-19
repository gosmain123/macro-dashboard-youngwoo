"use client";

import { MetaChip } from "@/components/meta-chip";
import { IndicatorActionLinks } from "@/components/indicator-action-links";
import { IndicatorTooltip } from "@/components/indicator-tooltip";
import { SparklineChart } from "@/components/sparkline-chart";
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
  indicator,
  visibleSlugs = [indicator.slug]
}: {
  indicator: MacroIndicator;
  visibleSlugs?: string[];
}) {
  return (
    <article
      id={indicator.slug}
      className="surface-card flex h-full min-h-[27rem] scroll-mt-28 flex-col rounded-[28px] p-5 md:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {indicator.unitLabel}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">{indicator.name}</h3>
        </div>
        <MetaChip label="Status" value={indicator.status} tone={statusTone(indicator.status)} />
      </div>

      <div className="mt-5">
        <p className={cn("text-5xl font-semibold tracking-tight", valueTone(indicator))}>
          {formatIndicatorValue(indicator.currentValue, indicator.unit)}
        </p>
      </div>

      <p className="mt-4 min-h-[3rem] text-sm leading-6 text-[color:var(--text-secondary)] line-clamp-2">
        {indicator.summary}
      </p>

      <div className="surface-inset mt-4 overflow-hidden rounded-[22px] px-3 py-2">
        <SparklineChart
          data={indicator.chartHistory}
          frequency={indicator.frequency}
          unit={indicator.unit}
          showOverlay={Boolean(indicator.overlays?.length)}
          variant="compact"
        />
      </div>

      <div className="mt-4">
        <IndicatorActionLinks indicator={indicator} />
      </div>

      <div className="mt-auto pt-4">
        <IndicatorTooltip indicator={indicator} visibleSlugs={visibleSlugs} trigger="button" />
      </div>
    </article>
  );
}
