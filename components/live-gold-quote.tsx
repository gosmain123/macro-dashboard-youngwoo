"use client";

import { useMarketQuote } from "@/lib/hooks/use-market-quote";

export function LiveGoldQuote() {
  const { data, loading, error } = useMarketQuote("gold", 15000);

  if (loading) {
    return <div>Loading gold...</div>;
  }

  if (error || !data) {
    return <div>Gold live unavailable</div>;
  }

  return (
    <div className="surface-card rounded-[20px] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        Market live
      </div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
        Gold ${data.price.toFixed(2)}
      </div>
      <div className="mt-2 text-sm text-[color:var(--text-secondary)]">
        Updated {new Date(data.as_of).toLocaleTimeString()}
      </div>
      <div className="mt-1 text-xs text-[color:var(--text-muted)]">
        {data.cached ? "cached" : "fresh"}
      </div>
    </div>
  );
}
