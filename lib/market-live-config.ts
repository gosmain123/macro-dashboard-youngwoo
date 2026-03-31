import type { MarketHistoryRange } from "@/lib/hooks/use-market-history";

export type IndicatorUpdateTier =
  | "intraday-market"
  | "daily-batch"
  | "release-driven";

export type LiveMarketSymbol = "gold";

const INTRADAY_MARKET_SLUGS = new Set([
  "gold",
  "vix",
  "move-index",
  "dxy",
  "wti-oil",
  "us-2y-treasury",
  "us-10y-treasury",
  "ten-year-real-yield",
  "five-year-breakeven",
  "curve-2s10s",
  "curve-3m10y",
  "ig-spreads",
  "hy-spreads",
  "copper-gold-ratio",
  "breadth",
  "cyclical-vs-defensive"
]);

const DAILY_BATCH_SLUGS = new Set([
  "fed-funds-upper",
  "rrp-balance",
  "tga-balance",
  "net-liquidity",
  "etf-flows"
]);

const RELEASE_DRIVEN_SLUGS = new Set([
  "fed-balance-sheet",
  "financial-conditions-index",
  "mortgage-rates",
  "initial-claims",
  "continuing-claims",
  "cftc-cot",
  "buyback-window",
  "crowding-flags",
  "major-central-bank-tracker",
  "global-growth-cross-check",
  "gdp-nowcast",
  "cpi-headline",
  "core-cpi",
  "ppi-final-demand",
  "core-pce",
  "avg-hourly-earnings",
  "shelter-inflation",
  "services-ex-housing",
  "nonfarm-payrolls",
  "unemployment-rate",
  "participation-rate",
  "jolts-openings",
  "quits-rate",
  "average-weekly-hours",
  "ism-manufacturing",
  "ism-services",
  "retail-sales",
  "industrial-production",
  "durable-goods",
  "housing-starts",
  "building-permits",
  "leading-economic-index",
  "consumer-sentiment",
  "china-pmi",
  "eurozone-pmi",
  "boj-policy",
  "thirteen-f-tracker"
]);

// 실제로 provider route까지 구현된 live market만 여기에 넣음.
// 지금은 gold만 구현.
const LIVE_MARKET_SYMBOL_BY_SLUG = {
  gold: "gold"
} as const satisfies Partial<Record<string, LiveMarketSymbol>>;

export function getIndicatorUpdateTier(slug: string): IndicatorUpdateTier {
  if (INTRADAY_MARKET_SLUGS.has(slug)) {
    return "intraday-market";
  }

  if (DAILY_BATCH_SLUGS.has(slug)) {
    return "daily-batch";
  }

  if (RELEASE_DRIVEN_SLUGS.has(slug)) {
    return "release-driven";
  }

  return "release-driven";
}

export function getLiveMarketSymbolBySlug(slug: string): LiveMarketSymbol | null {
  return LIVE_MARKET_SYMBOL_BY_SLUG[slug as keyof typeof LIVE_MARKET_SYMBOL_BY_SLUG] ?? null;
}

export function supportsLiveMarketQuote(slug: string): boolean {
  return getLiveMarketSymbolBySlug(slug) !== null;
}

export function supportsLiveMarketHistory(slug: string): boolean {
  return getLiveMarketSymbolBySlug(slug) !== null;
}

export function isSupportedLiveMarketSymbol(value: string | null): value is LiveMarketSymbol {
  return value === "gold";
}

export function getLiveQuoteRefreshMs(slug: string): number {
  const tier = getIndicatorUpdateTier(slug);

  if (tier === "intraday-market") {
    return 15_000;
  }

  if (tier === "daily-batch") {
    return 5 * 60_000;
  }

  return 60 * 60_000;
}

export function getLiveHistoryRefreshMs(
  slug: string,
  variant: "compact" | "detail"
): number {
  const tier = getIndicatorUpdateTier(slug);

  if (tier === "intraday-market") {
    return variant === "compact" ? 60_000 : 30_000;
  }

  if (tier === "daily-batch") {
    return variant === "compact" ? 15 * 60_000 : 5 * 60_000;
  }

  return variant === "compact" ? 60 * 60_000 : 15 * 60_000;
}

export function getDefaultHistoryRangeForSlug(slug: string): MarketHistoryRange {
  const tier = getIndicatorUpdateTier(slug);

  if (tier === "intraday-market") {
    return "1D";
  }

  if (tier === "daily-batch") {
    return "1M";
  }

  return "3M";
}
