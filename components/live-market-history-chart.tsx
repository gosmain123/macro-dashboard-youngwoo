"use client";

import { useId, useMemo, useState } from "react";

import { cn, formatIndicatorValue } from "@/lib/utils";
import {
  type MarketHistoryRange,
  useMarketHistory
} from "@/lib/hooks/use-market-history";

type ChartPoint = {
  date: string;
  value: number;
};

type ProjectedPoint = {
  point: ChartPoint;
  x: number;
  y: number;
};

const DETAIL_RANGES: MarketHistoryRange[] = [
  "1H",
  "4H",
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "1Y",
  "3Y",
  "5Y",
  "10Y",
  "20Y",
  "MAX"
];

const compactDimensions = {
  width: 320,
  height: 96,
  padding: { top: 10, right: 8, bottom: 10, left: 8 }
} as const;

const detailDimensions = {
  width: 720,
  height: 248,
  padding: { top: 14, right: 14, bottom: 34, left: 14 }
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildLinePath(points: ProjectedPoint[]) {
  let path = "";

  points.forEach((point, index) => {
    path += `${index === 0 ? "M" : " L"} ${point.x} ${point.y}`;
  });

  return path;
}

function buildAreaPath(points: ProjectedPoint[], baselineY: number) {
  if (points.length === 0) {
    return "";
  }

  const linePath = buildLinePath(points);
  const first = points[0];
  const last = points.at(-1);

  if (!first || !last) {
    return "";
  }

  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function projectPoints(
  data: ChartPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
) {
  const innerWidth = Math.max(width - padding.left - padding.right, 1);
  const innerHeight = Math.max(height - padding.top - padding.bottom, 1);

  const values = data.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const pad =
    maxValue === minValue
      ? Math.max(Math.abs(maxValue) * 0.02, 1)
      : (maxValue - minValue) * 0.12;
  const domainMin = minValue - pad;
  const domainMax = maxValue + pad;
  const denominator = Math.max(domainMax - domainMin, 1);

  return data.map((point, index) => {
    const x =
      padding.left +
      (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y = padding.top + ((domainMax - point.value) / denominator) * innerHeight;

    return { point, x, y };
  });
}

function formatAxisDate(value: string, range: MarketHistoryRange) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const shortTime = new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore"
  }).format(date);

  const shortDate = new Intl.DateTimeFormat("en-SG", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Singapore"
  }).format(date);

  const monthYear = new Intl.DateTimeFormat("en-SG", {
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Singapore"
  }).format(date);

  const yearOnly = new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    timeZone: "Asia/Singapore"
  }).format(date);

  if (range === "1H" || range === "4H" || range === "1D") {
    return shortTime;
  }

  if (range === "5D" || range === "1M" || range === "3M") {
    return shortDate;
  }

  if (range === "6M" || range === "1Y" || range === "3Y" || range === "5Y") {
    return monthYear;
  }

  return yearOnly;
}

function formatTooltipDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore"
  }).format(date);
}

function ChartUnavailable({ compact }: { compact: boolean }) {
  return (
    <div
      className={cn(
        "surface-inset flex h-full items-center justify-center rounded-[18px] px-4 text-center text-xs leading-5 text-[color:var(--text-muted)]",
        compact ? "min-h-[5rem]" : "min-h-[12rem]"
      )}
    >
      Chart unavailable. No usable history is available yet.
    </div>
  );
}

export function LiveMarketHistoryChart({
  symbol,
  unit,
  variant = "detail"
}: {
  symbol: "gold";
  unit: string;
  variant?: "compact" | "detail";
}) {
  const compact = variant === "compact";
  const dimensions = compact ? compactDimensions : detailDimensions;
  const [selectedRange, setSelectedRange] = useState<MarketHistoryRange>("1D");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const { data, loading, error } = useMarketHistory(
    symbol,
    selectedRange,
    compact ? 60000 : 30000
  );

  const visibleData = useMemo(() => data?.points ?? [], [data?.points]);
  const renderRange = data?.range ?? selectedRange;
  const canRenderChart = visibleData.length >= 2;

  const projected = useMemo(
    () =>
      canRenderChart
        ? projectPoints(visibleData, dimensions.width, dimensions.height, dimensions.padding)
        : [],
    [canRenderChart, dimensions.height, dimensions.padding, dimensions.width, visibleData]
  );

  const areaPath = useMemo(
    () => buildAreaPath(projected, dimensions.height - dimensions.padding.bottom),
    [dimensions.height, dimensions.padding.bottom, projected]
  );

  const linePath = useMemo(() => buildLinePath(projected), [projected]);

  const activeIndex =
    hoveredIndex === null ? visibleData.length - 1 : clamp(hoveredIndex, 0, visibleData.length - 1);
  const activePoint = visibleData[activeIndex];
  const activeProjected = projected[activeIndex];

  if (loading && !canRenderChart) {
    return (
      <div className={cn("w-full", compact ? "h-24" : "h-56")}>
        <ChartUnavailable compact={compact} />
      </div>
    );
  }

  if (!canRenderChart) {
    return (
      <div className={cn("w-full", compact ? "h-24" : "h-56")}>
        <ChartUnavailable compact={compact} />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-chart-root="true">
      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              History
            </p>
            {activePoint ? (
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">
                {formatTooltipDate(activePoint.date)} · {formatIndicatorValue(activePoint.value, unit)}
              </p>
            ) : null}
            {error ? (
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                Live refresh delayed. Showing the last available history.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {DETAIL_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={selectedRange === range}
                onClick={() => {
                  setSelectedRange(range);
                  setHoveredIndex(null);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition",
                  selectedRange === range
                    ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)]"
                    : "border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={cn("w-full", compact ? "h-24" : "h-56")}>
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`History chart for ${symbol}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {!compact ? (
            <>
              {[0.25, 0.5, 0.75].map((ratio) => {
                const y =
                  dimensions.padding.top +
                  (dimensions.height - dimensions.padding.top - dimensions.padding.bottom) * ratio;

                return (
                  <line
                    key={ratio}
                    x1={dimensions.padding.left}
                    x2={dimensions.width - dimensions.padding.right}
                    y1={y}
                    y2={y}
                    stroke="var(--chart-grid)"
                    strokeWidth="1"
                  />
                );
              })}
            </>
          ) : null}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--chart-accent)"
            strokeWidth={compact ? 2 : 2.3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {activeProjected && !compact ? (
            <>
              <line
                x1={activeProjected.x}
                x2={activeProjected.x}
                y1={dimensions.padding.top}
                y2={dimensions.height - dimensions.padding.bottom}
                stroke="var(--border-strong)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle cx={activeProjected.x} cy={activeProjected.y} r="4" fill="var(--chart-accent)" />
            </>
          ) : null}

          {compact && activeProjected ? (
            <circle cx={activeProjected.x} cy={activeProjected.y} r="3.2" fill="var(--chart-accent)" />
          ) : null}

          <rect
            x={dimensions.padding.left}
            y={dimensions.padding.top}
            width={Math.max(dimensions.width - dimensions.padding.left - dimensions.padding.right, 1)}
            height={Math.max(dimensions.height - dimensions.padding.top - dimensions.padding.bottom, 1)}
            fill="transparent"
            onPointerMove={(event) => {
              if (compact || visibleData.length === 0) {
                return;
              }

              const bounds = event.currentTarget.getBoundingClientRect();

              if (!bounds.width) {
                return;
              }

              const ratio = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
              const nextIndex = Math.round(ratio * (visibleData.length - 1));
              setHoveredIndex(nextIndex);
            }}
            onPointerLeave={() => setHoveredIndex(null)}
          />
        </svg>
      </div>

      {!compact && visibleData.length >= 3 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[color:var(--text-muted)]">
          <span>{formatAxisDate(visibleData[0].date, renderRange)}</span>
          <span className="text-center">
            {formatAxisDate(visibleData[Math.floor((visibleData.length - 1) / 2)].date, renderRange)}
          </span>
          <span className="text-right">
            {formatAxisDate(visibleData[visibleData.length - 1].date, renderRange)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
