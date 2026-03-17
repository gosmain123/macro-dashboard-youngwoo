"use client";

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

type ChartPoint = {
  date: string;
  value: number;
  overlay?: number;
};

export function SparklineChart({
  data,
  showOverlay = false
}: {
  data: ChartPoint[];
  showOverlay?: boolean;
}) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="macroArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6ee7f9" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#6ee7f9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 11 }}
            tickFormatter={(value: string) => value.slice(5)}
            minTickGap={24}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              background: "rgba(2, 6, 23, 0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              color: "#f8fafc"
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area type="monotone" dataKey="value" stroke="#6ee7f9" strokeWidth={2} fill="url(#macroArea)" />
          {showOverlay ? (
            <Line type="monotone" dataKey="overlay" stroke="#ffd36e" strokeWidth={1.5} dot={false} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
