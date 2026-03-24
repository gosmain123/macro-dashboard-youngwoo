"use client";

import { MetaChip } from "@/components/meta-chip";
import { cn } from "@/lib/utils";
import { useMarketQuote } from "@/lib/hooks/use-market-quote";

function valueTone() {
  return "text-[color:var(--text-primary)]";
}

export function LiveGoldQuote() {
  const { data, loading, error } = useMarketQuote("gold", 15000);

  if (loading) {
    return (
      <article className="surface-card flex h-full min-h-[25.5rem] flex-col overflow-hidden rounded-[24px] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              USD PER OUNCE
            </p>
            <h3 className="mt-2 break-words text-xl font-semibold text-[color:var(--text-primary)] [overflow-wrap:anywhere]">
              Gold
            </h3>
          </div>
          <MetaChip label="Status" value="loading" tone="amber" />
        </div>

        <div className="mt-4 min-w-0">
          <p className="break-words text-[2.65rem] font-semibold tracking-tight text-[color:var(--text-primary)] [overflow-wrap:anywhere]">
            Loading...
          </p>
        </div>

        <p className="mt-3 min-h-[2.75rem] text-sm leading-6 text-[color:var(--text-secondary)]">
          Pulling the latest market live gold quote.
        </p>

        <div className="surface-inset mt-4 flex min-h-[7.5rem] items-center justify-center rounded-[20px] px-3 py-2 text-sm text-[color:var(--text-muted)]">
          Chart loading...
        </div>
      </article>
    );
  }

  if (error || !data) {
    return (
      <article className="surface-card flex h-full min-h-[25.5rem] flex-col overflow-hidden rounded-[24px] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              USD PER OUNCE
            </p>
            <h3 className="mt-2 break-words text-xl font-semibold text-[color:var(--text-primary)] [overflow-wrap:anywhere]">
              Gold
            </h3>
          </div>
          <MetaChip label="Status" value="error" tone="rose" />
        </div>

        <div className="mt-4 min-w-0">
          <p className="break-words text-[2.65rem] font-semibold tracking-tight text-[color:var(--text-primary)] [overflow-wrap:anywhere]">
            Unavailable
          </p>
        </div>

        <p className="mt-3 min-h-[2.75rem] text-sm leading-6 text-[color:var(--text-secondary)]">
          Market live gold quote is temporarily unavailable.
        </p>

        <div className="surface-inset mt-4 flex min-h-[7.5rem] items-center justify-center rounded-[20px] px-3 py-2 text-sm text-[color:var(--text-muted)]">
          Chart unavailable
        </div>
      </article>
    );
  }

  return (
    <article
      id="gold-live"
      className="surface-card flex h-full min-h-[25.5rem] scroll-mt-28 flex-col overflow-hidden rounded-[24px] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            USD PER OUNCE
          </p>
          <h3 className="mt-2 break-words text-xl font-semibold text-[color:var(--text-primary)] [overflow-wrap:anywhere]">
            Gold
          </h3>
        </div>
        <MetaChip label="Status" value="live" tone="emerald" />
      </div>

      <div className="mt-4 min-w-0">
        <p className={cn("break-words text-[2.65rem] font-semibold tracking-tight [overflow-wrap:anywhere]", valueTone())}>
          ${data.price.toFixed(2)}
        </p>
      </div>

      <p className="mt-3 min-h-[2.75rem] text-sm leading-6 text-[color:var(--text-secondary)] line-clamp-2">
        Live market quote for spot gold. This card refreshes automatically every 15 seconds.
      </p>

      <div className="surface-inset mt-4 flex min-h-[7.5rem] items-center justify-center rounded-[20px] px-3 py-2 text-sm text-[color:var(--text-muted)]">
        Live chart will be added next.
      </div>

      <div className="mt-3">
        <div className="inline-flex rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
          Updated {new Date(data.as_of).toLocaleTimeString()}
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="inline-flex rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-primary)]">
          Market live
        </div>
      </div>
    </article>
  );
}
