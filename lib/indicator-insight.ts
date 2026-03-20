import type {
  HistoricalContextBand,
  IndicatorSourceType,
  MacroIndicator,
  ProviderType
} from "@/types/macro";

const derivedSlugs = new Set([
  "gdp-nowcast",
  "net-liquidity",
  "copper-gold-ratio",
  "major-central-bank-tracker",
  "global-growth-cross-check",
  "breadth",
  "cyclical-vs-defensive",
  "equal-weight-vs-cap-weight",
  "small-caps-vs-large-caps",
  "thirteen-f-tracker",
  "cftc-cot",
  "etf-flows",
  "buyback-window",
  "crowding-flags",
  "sofr-implied-cuts",
  "terminal-rate-pricing",
  "next-three-fomc-path"
]);

const marketImpliedSlugs = new Set([
  "us-2y-treasury",
  "us-10y-treasury",
  "curve-2s10s",
  "curve-3m10y",
  "ig-spreads",
  "hy-spreads",
  "mortgage-rates",
  "ten-year-real-yield",
  "dxy",
  "eurusd",
  "usdjpy",
  "usdcnh",
  "wti-oil",
  "natural-gas",
  "copper",
  "gold",
  "vix",
  "move-index"
]);

const officialProviders = new Set<ProviderType>(["bea", "bls", "census", "dol", "fed", "ism", "treasury"]);

export type HistoricalContextSummary = {
  percentile: number | null;
  percentileLabel: string;
  zScore: number | null;
  zScoreLabel: string;
  band: HistoricalContextBand;
  contextLabel: string;
};

function classifyPercentile(percentile: number) {
  if (percentile <= 20) {
    return {
      band: "low" as const,
      label: "low vs history"
    };
  }

  if (percentile <= 75) {
    return {
      band: "normal" as const,
      label: "normal vs history"
    };
  }

  if (percentile <= 90) {
    return {
      band: "elevated" as const,
      label: "elevated vs history"
    };
  }

  return {
    band: "extreme" as const,
    label: "extreme vs history"
  };
}

function getWindowValues(history: MacroIndicator["chartHistory"], days: number) {
  if (!Array.isArray(history) || history.length === 0) {
    return [];
  }

  const lastDate = history.at(-1)?.date;

  if (!lastDate) {
    return history.filter(
      (point) => point && typeof point.date === "string" && Number.isFinite(point.value)
    );
  }

  const cutoff = new Date(`${lastDate}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);

  const filtered = history.filter(
    (point) =>
      point &&
      typeof point.date === "string" &&
      Number.isFinite(point.value) &&
      new Date(`${point.date}T00:00:00Z`) >= cutoff
  );
  return filtered.length >= 6 ? filtered : history;
}

function computePercentile(values: number[], currentValue: number) {
  if (values.length === 0) {
    return null;
  }

  const lessThanOrEqual = values.filter((value) => value <= currentValue).length;
  return Math.round((lessThanOrEqual / values.length) * 100);
}

function computeZScore(values: number[], currentValue: number) {
  if (values.length < 2) {
    return null;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  if (!Number.isFinite(standardDeviation) || standardDeviation === 0) {
    return null;
  }

  return Number(((currentValue - mean) / standardDeviation).toFixed(1));
}

export function getIndicatorSourceType(indicator: Pick<MacroIndicator, "slug" | "provider" | "source">): IndicatorSourceType {
  if (derivedSlugs.has(indicator.slug)) {
    return "derived";
  }

  if (marketImpliedSlugs.has(indicator.slug)) {
    return "market-implied";
  }

  if (indicator.provider.type === "manual" || indicator.source.access === "licensed-manual") {
    return "manual";
  }

  if (officialProviders.has(indicator.provider.type)) {
    return "official";
  }

  return "derived";
}

export function getHistoricalContext(indicator: Pick<MacroIndicator, "chartHistory" | "currentValue">): HistoricalContextSummary {
  const chartHistory = Array.isArray(indicator.chartHistory) ? indicator.chartHistory : [];
  const oneYearWindow = getWindowValues(chartHistory, 365);
  const fiveYearWindow = getWindowValues(chartHistory, 365 * 5);
  const percentile = computePercentile(
    oneYearWindow.map((point) => point.value).filter((value) => Number.isFinite(value)),
    indicator.currentValue
  );
  const zScore = computeZScore(
    fiveYearWindow.map((point) => point.value).filter((value) => Number.isFinite(value)),
    indicator.currentValue
  );
  const classified = classifyPercentile(percentile ?? 50);

  return {
    percentile,
    percentileLabel: oneYearWindow.length !== chartHistory.length ? "1Y pct" : "History pct",
    zScore,
    zScoreLabel: fiveYearWindow.length !== chartHistory.length ? "5Y z" : "History z",
    band: classified.band,
    contextLabel: classified.label
  };
}
