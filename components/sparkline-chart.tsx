"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  formatChartAxisDate,
  formatChartTooltipDate,
  getChartDataForRange,
  getChartFillOpacity,
  getChartLineType,
  getChartRangeOptions,
  getChartTickMinGap,
  getDefaultChartRange,
  shouldShowChartDots,
  type ChartRangeId
} from "@/lib/chart-frequency";
import { cn, formatIndicatorValue } from "@/lib/utils";
import type { ChartPoint, Frequency } from "@/types/macro";

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
  const defaultRange = getDefaultChartRange(frequency);
  const rangeOptions = getChartRangeOptions(frequency);
  const [selectedRange, setSelectedRange] = useState<ChartRangeId>(defaultRange);
  const gradientId = useId().replace(/:/g, "");
  const compact = variant === "compact";
  const safeData = useMemo(
    () =>
      Array.isArray(data)
        ? data.filter(
            (point) =>
              point &&
              typeof point.date === "string" &&
              Number.isFinite(point.value) &&
              !Number.isNaN(new Date(`${point.date}T00:00:00Z`).getTime())
          )
        : [],
    [data]
  );

  useEffect(() => {
    setSelectedRange(defaultRange);
  }, [defaultRange, frequency]);

  const visibleData = getChartDataForRange(safeData, frequency, selectedRange);
  const lineType = getChartLineType(frequency);
  const fillOpacity = getChartFillOpacity(frequency);
  const showDots = shouldShowChartDots(frequency, visibleData.length);
  const canRenderChart = visibleData.length >= 2;
  const hasOverlayData =
    showOverlay &&
    visibleData.some((point) => typeof point.overlay === "number" && Number.isFinite(point.overlay));

  return (
    <div className="space-y-3" data-chart-root="true">
      {compact ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">History</p>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={selectedRange === option.id}
                onClick={() => setSelectedRange(option.id)}
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

      <div className={cn("w-full", compact ? "h-24" : "h-48")}>
        {canRenderChart ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleData} margin={compact ? { top: 6, right: 2, left: 2, bottom: 0 } : { top: 8, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-accent)" stopOpacity={0.38 * fillOpacity} />
                  <stop offset="95%" stopColor="var(--chart-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} horizontal={!compact} />
              {compact ? null : (
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  tickFormatter={(value: string) => formatChartAxisDate(value, frequency, selectedRange)}
                  minTickGap={getChartTickMinGap(frequency, selectedRange)}
                  tickMargin={10}
                />
              )}
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                cursor={compact ? false : undefined}
                formatter={(value: number, name: string) => [
                  formatIndicatorValue(Number(value), unit),
                  name === "overlay" ? "Overlay" : "Value"
                ]}
                labelFormatter={(value: string) => formatChartTooltipDate(value, frequency)}
                contentStyle={{
                  background: "var(--surface-strong)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "16px",
                  color: "var(--text-primary)"
                }}
                itemStyle={{ color: "var(--text-secondary)" }}
                labelStyle={{ color: "var(--text-muted)" }}
              />
              <Area
                type={lineType}
                dataKey="value"
                stroke="var(--chart-accent)"
                strokeWidth={2.2}
                fill={`url(#${gradientId})`}
                fillOpacity={fillOpacity}
                dot={showDots ? { r: 2, fill: "var(--chart-accent)", strokeWidth: 0 } : false}
                activeDot={{ r: 3, fill: "var(--chart-accent)", strokeWidth: 0 }}
                isAnimationActive={false}
              />
              {hasOverlayData ? (
                <Line
                  type={lineType}
                  dataKey="overlay"
                  stroke="var(--chart-overlay)"
                  strokeWidth={1.4}
                  dot={false}
                  isAnimationActive={false}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="surface-inset flex h-full items-center justify-center rounded-[18px] px-4 text-center text-xs leading-5 text-[color:var(--text-muted)]">
            History unavailable
          </div>
        )}
      </div>
    </div>
  );
}
