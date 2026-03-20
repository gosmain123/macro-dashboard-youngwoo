"use client";

import { useEffect, useId, useMemo, useState, type PointerEvent } from "react";

import { normalizeChartHistory } from "@/lib/chart-data";
import {
  formatChartAxisDate,
  formatChartTooltipDate,
  getChartDataForRange,
  getChartFillOpacity,
  getChartRangeOptions,
  getDefaultChartRange,
  type ChartRangeId
} from "@/lib/chart-frequency";
import { cn, formatIndicatorValue } from "@/lib/utils";
import type { ChartPoint, Frequency } from "@/types/macro";

type ProjectedPoint = {
  point: ChartPoint;
  x: number;
  y: number;
  overlayY?: number;
};

type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildLinePath(points: ProjectedPoint[], key: "y" | "overlayY") {
  let path = "";

  points.forEach((point, index) => {
    const y = point[key];

    if (typeof y !== "number" || Number.isNaN(y)) {
      return;
    }

    path += `${index === 0 || path === "" ? "M" : " L"} ${point.x} ${y}`;
  });

  return path;
}

function buildAreaPath(points: ProjectedPoint[], baselineY: number) {
  if (points.length === 0) {
    return "";
  }

  const linePath = buildLinePath(points, "y");
  const first = points[0];
  const last = points.at(-1);

  if (!linePath || !first || !last) {
    return "";
  }

  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function getProjectedPoints(
  data: ChartPoint[],
  width: number,
  height: number,
  padding: ChartPadding
) {
  if (data.length === 0) {
    return [];
  }

  const innerWidth = Math.max(width - padding.left - padding.right, 1);
  const innerHeight = Math.max(height - padding.top - padding.bottom, 1);
  const allValues = data.flatMap((point) => {
    const values = [point.value];

    if (typeof point.overlay === "number" && Number.isFinite(point.overlay)) {
      values.push(point.overlay);
    }

    return values;
  });
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const paddingValue = maxValue === minValue ? Math.max(Math.abs(maxValue) * 0.08, 1) : (maxValue - minValue) * 0.12;
  const domainMin = minValue - paddingValue;
  const domainMax = maxValue + paddingValue;
  const denominator = Math.max(domainMax - domainMin, 1);

  return data.map((point, index) => {
    const x = padding.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y = padding.top + ((domainMax - point.value) / denominator) * innerHeight;
    const overlayY =
      typeof point.overlay === "number" && Number.isFinite(point.overlay)
        ? padding.top + ((domainMax - point.overlay) / denominator) * innerHeight
        : undefined;

    return {
      point,
      x,
      y,
      overlayY
    };
  });
}

function AxisLabelRow({
  data,
  frequency,
  rangeId
}: {
  data: ChartPoint[];
  frequency: Frequency;
  rangeId: ChartRangeId;
}) {
  const first = data[0];
  const middle = data[Math.floor((data.length - 1) / 2)];
  const last = data.at(-1);

  if (!first || !middle || !last) {
    return null;
  }

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[color:var(--text-muted)]">
      <span>{formatChartAxisDate(first.date, frequency, rangeId)}</span>
      <span className="text-center">{formatChartAxisDate(middle.date, frequency, rangeId)}</span>
      <span className="text-right">{formatChartAxisDate(last.date, frequency, rangeId)}</span>
    </div>
  );
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

export function SparklineChart({
  data,
  frequency,
  unit,
  showOverlay = false,
  variant = "detail"
}: {
  data?: ChartPoint[] | null;
  frequency: Frequency;
  unit: string;
  showOverlay?: boolean;
  variant?: "compact" | "detail";
}) {
  const compact = variant === "compact";
  const dimensions = compact ? compactDimensions : detailDimensions;
  const defaultRange = getDefaultChartRange(frequency);
  const rangeOptions = getChartRangeOptions(frequency);
  const gradientId = useId().replace(/:/g, "");
  const [selectedRange, setSelectedRange] = useState<ChartRangeId>(defaultRange);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const normalizedData = useMemo(() => normalizeChartHistory(data), [data]);

  useEffect(() => {
    setSelectedRange(defaultRange);
  }, [defaultRange, frequency]);

  const visibleData = useMemo(
    () => getChartDataForRange(normalizedData, frequency, selectedRange),
    [frequency, normalizedData, selectedRange]
  );
  const canRenderChart = visibleData.length >= 2;
  const projected = useMemo(
    () => (canRenderChart ? getProjectedPoints(visibleData, dimensions.width, dimensions.height, dimensions.padding) : []),
    [canRenderChart, dimensions.height, dimensions.padding, dimensions.width, visibleData]
  );
  const areaPath = useMemo(
    () => buildAreaPath(projected, dimensions.height - dimensions.padding.bottom),
    [dimensions.height, dimensions.padding.bottom, projected]
  );
  const linePath = useMemo(() => buildLinePath(projected, "y"), [projected]);
  const overlayPath = useMemo(() => buildLinePath(projected, "overlayY"), [projected]);
  const activeIndex = hoveredIndex === null ? visibleData.length - 1 : clamp(hoveredIndex, 0, visibleData.length - 1);
  const activePoint = visibleData[activeIndex];
  const activeProjected = projected[activeIndex];
  const hasOverlayData =
    showOverlay &&
    projected.some((point) => typeof point.overlayY === "number" && Number.isFinite(point.overlayY));

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
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
  }

  if (!canRenderChart) {
    return (
      <div className="space-y-3" data-chart-root="true">
        {!compact ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">History</p>
          </div>
        ) : null}
        <div className={cn("w-full", compact ? "h-24" : "h-56")}>
          <ChartUnavailable compact={compact} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-chart-root="true">
      {compact ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">History</p>
            {activePoint ? (
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">
                {formatChartTooltipDate(activePoint.date, frequency)} · {formatIndicatorValue(activePoint.value, unit)}
                {hasOverlayData && typeof activePoint.overlay === "number"
                  ? ` · ${formatIndicatorValue(activePoint.overlay, unit)} overlay`
                  : ""}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={selectedRange === option.id}
                onClick={() => {
                  setSelectedRange(option.id);
                  setHoveredIndex(null);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition",
                  selectedRange === option.id
                    ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)]"
                    : "border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("w-full", compact ? "h-24" : "h-56")}>
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`History chart for ${unit}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.26 * getChartFillOpacity(frequency)} />
              <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {!compact ? (
            <>
              {[0.25, 0.5, 0.75].map((ratio) => {
                const y = dimensions.padding.top + (dimensions.height - dimensions.padding.top - dimensions.padding.bottom) * ratio;

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

          <path d={areaPath} fill={`url(#${gradientId})`} opacity={compact ? 1 : 0.95} />
          <path d={linePath} fill="none" stroke="var(--chart-accent)" strokeWidth={compact ? 2 : 2.3} strokeLinejoin="round" strokeLinecap="round" />

          {hasOverlayData && overlayPath ? (
            <path
              d={overlayPath}
              fill="none"
              stroke="var(--chart-overlay)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="5 4"
            />
          ) : null}

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
              {hasOverlayData && typeof activeProjected.overlayY === "number" ? (
                <circle cx={activeProjected.x} cy={activeProjected.overlayY} r="3.4" fill="var(--chart-overlay)" />
              ) : null}
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
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoveredIndex(null)}
          />
        </svg>
      </div>

      {!compact ? <AxisLabelRow data={visibleData} frequency={frequency} rangeId={selectedRange} /> : null}
    </div>
  );
}
