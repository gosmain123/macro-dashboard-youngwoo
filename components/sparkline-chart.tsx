"use client";

import { useEffect, useId, useState } from "react";
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
  showOverlay = false
}: {
  data: ChartPoint[];
  frequency: Frequency;
  unit: string;
  showOverlay?: boolean;
}) {
  const defaultRange = getDefaultChartRange(frequency);
  const rangeOptions = getChartRangeOptions(frequency);
  const [selectedRange, setSelectedRange] = useState<ChartRangeId>(defaultRange);
  const gradientId = useId().replace(/:/g, "");

  useEffect(() => {
    setSelectedRange(defaultRange);
  }, [defaultRange, frequency]);

  const visibleData = getChartDataForRange(data, frequency, selectedRange);
  const lineType = getChartLineType(frequency);
  const fillOpacity = getChartFillOpacity(frequency);
  const showDots = shouldShowChartDots(frequency, visibleData.length);

  return (
    <div className="space-y-3" data-chart-root="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">History</p>
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
                  ? "border-cyan-300/60 bg-cyan-300/15 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6ee7f9" stopOpacity={0.38 * fillOpacity} />
                <stop offset="95%" stopColor="#6ee7f9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 11 }}
              tickFormatter={(value: string) => formatChartAxisDate(value, frequency, selectedRange)}
              minTickGap={getChartTickMinGap(frequency, selectedRange)}
              tickMargin={10}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatIndicatorValue(Number(value), unit),
                name === "overlay" ? "Overlay" : "Value"
              ]}
              labelFormatter={(value: string) => formatChartTooltipDate(value, frequency)}
              contentStyle={{
                background: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                color: "#f8fafc"
              }}
              itemStyle={{ color: "#e2e8f0" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type={lineType}
              dataKey="value"
              stroke="#6ee7f9"
              strokeWidth={2.2}
              fill={`url(#${gradientId})`}
              fillOpacity={fillOpacity}
              dot={showDots ? { r: 2, fill: "#6ee7f9", strokeWidth: 0 } : false}
              activeDot={{ r: 3, fill: "#6ee7f9", strokeWidth: 0 }}
              isAnimationActive={false}
            />
            {showOverlay ? (
              <Line
                type={lineType}
                dataKey="overlay"
                stroke="#ffd36e"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive={false}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
