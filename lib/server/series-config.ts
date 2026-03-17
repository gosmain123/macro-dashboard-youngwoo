export type SeriesTransform = "level" | "yoy" | "mom_pct" | "mom_diff";

export type SeriesConfig = {
  seriesId: string;
  transform: SeriesTransform;
  scale?: number;
  limit?: number;
};

export const seriesConfigBySlug: Record<string, SeriesConfig> = {
  "fed-funds-upper": { seriesId: "DFEDTARU", transform: "level", limit: 36 },
  "fed-balance-sheet": { seriesId: "WALCL", transform: "level", scale: 0.000001, limit: 48 },
  "rrp-balance": { seriesId: "RRPONTSYD", transform: "level", scale: 0.000001, limit: 48 },
  "tga-balance": { seriesId: "WTREGEN", transform: "level", scale: 0.000001, limit: 48 },
  "financial-conditions-index": { seriesId: "NFCI", transform: "level", limit: 48 },
  "cpi-headline": { seriesId: "CPIAUCSL", transform: "yoy", limit: 48 },
  "core-cpi": { seriesId: "CPILFESL", transform: "yoy", limit: 48 },
  "ppi-final-demand": { seriesId: "PPIACO", transform: "yoy", limit: 48 },
  "core-pce": { seriesId: "PCEPILFE", transform: "yoy", limit: 48 },
  "avg-hourly-earnings": { seriesId: "CES0500000003", transform: "yoy", limit: 48 },
  "five-year-breakeven": { seriesId: "T5YIE", transform: "level", limit: 48 },
  "retail-sales": { seriesId: "RSXFS", transform: "mom_pct", limit: 48 },
  "industrial-production": { seriesId: "INDPRO", transform: "mom_pct", limit: 48 },
  "durable-goods": { seriesId: "NEWORDER", transform: "mom_pct", limit: 48 },
  "housing-starts": { seriesId: "HOUST", transform: "level", scale: 0.001, limit: 48 },
  "building-permits": { seriesId: "PERMIT", transform: "level", scale: 0.001, limit: 48 },
  "consumer-sentiment": { seriesId: "UMCSENT", transform: "level", limit: 48 },
  "nonfarm-payrolls": { seriesId: "PAYEMS", transform: "mom_diff", limit: 48 },
  "unemployment-rate": { seriesId: "UNRATE", transform: "level", limit: 48 },
  "participation-rate": { seriesId: "CIVPART", transform: "level", limit: 48 },
  "initial-claims": { seriesId: "ICSA", transform: "level", scale: 0.001, limit: 48 },
  "continuing-claims": { seriesId: "CCSA", transform: "level", scale: 0.000001, limit: 48 },
  "jolts-openings": { seriesId: "JTSJOL", transform: "level", scale: 0.001, limit: 48 },
  "quits-rate": { seriesId: "JTSQUR", transform: "level", limit: 48 },
  "average-weekly-hours": { seriesId: "AWHAETP", transform: "level", limit: 48 },
  "us-2y-treasury": { seriesId: "DGS2", transform: "level", limit: 48 },
  "us-10y-treasury": { seriesId: "DGS10", transform: "level", limit: 48 },
  "curve-2s10s": { seriesId: "T10Y2Y", transform: "level", scale: 100, limit: 48 },
  "curve-3m10y": { seriesId: "T10Y3M", transform: "level", scale: 100, limit: 48 },
  "ig-spreads": { seriesId: "BAMLC0A0CM", transform: "level", scale: 100, limit: 48 },
  "hy-spreads": { seriesId: "BAMLH0A0HYM2", transform: "level", scale: 100, limit: 48 },
  "mortgage-rates": { seriesId: "MORTGAGE30US", transform: "level", limit: 48 },
  "ten-year-real-yield": { seriesId: "DFII10", transform: "level", limit: 48 },
  "wti-oil": { seriesId: "DCOILWTICO", transform: "level", limit: 48 },
  gold: { seriesId: "GOLDAMGBD228NLBM", transform: "level", limit: 48 }
};
