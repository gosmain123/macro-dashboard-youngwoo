const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";
const MARKET_HISTORY_TIMEZONE = "UTC";
import type { LiveMarketSymbol } from "@/lib/market-live-config";

export type MarketHistoryRange =
  | "1H"
  | "4H"
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "3Y"
  | "5Y"
  | "10Y"
  | "20Y"
  | "MAX";
 
type TwelveDataPriceResponse = {
  price?: string;
  code?: number;
  message?: string;
  status?: string;
};
 
type TwelveDataTimeSeriesValue = {
  datetime?: string;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: string;
};

type TwelveDataTimeSeriesResponse = {
  values?: TwelveDataTimeSeriesValue[];
  status?: string;
  message?: string;
};

export type MarketLiveQuote = {
  symbol: MarketLiveSymbol;
  vendorSymbol: string;
  price: number;
  asOf: string;
  sourceName: string;
  sourceUrl: string;
};

export type MarketHistoryPoint = {
  date: string;
  value: number;
};

type MarketHistoryConfig = {
  interval: string;
  outputsize: number;
};

const HISTORY_CONFIG: Record<MarketHistoryRange, MarketHistoryConfig> = {
  "1H": { interval: "1min", outputsize: 60 },
  "4H": { interval: "5min", outputsize: 48 },
  "1D": { interval: "15min", outputsize: 96 },
  "5D": { interval: "1h", outputsize: 120 },
  "1M": { interval: "4h", outputsize: 180 },
  "3M": { interval: "1day", outputsize: 90 },
  "6M": { interval: "1day", outputsize: 180 },
  "1Y": { interval: "1day", outputsize: 365 },
  "3Y": { interval: "1week", outputsize: 156 },
  "5Y": { interval: "1week", outputsize: 260 },
  "10Y": { interval: "1month", outputsize: 120 },
  "20Y": { interval: "1month", outputsize: 240 },
  "MAX": { interval: "1month", outputsize: 5000 }
};

function getApiKey(): string {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TWELVE_DATA_API_KEY.");
  }

  return apiKey;
}

function getVendorSymbol(symbol: LiveMarketSymbol): string {
  switch (symbol) {
    case "gold":
      return "XAU/USD";
    default:
      throw new Error("Unsupported market live symbol.");
  }
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSeriesTime(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const withZone = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
  const parsed = new Date(withZone);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid time series timestamp: ${value}`);
  }

  return parsed.toISOString();
}

function dedupePoints(points: MarketHistoryPoint[]) {
  const map = new Map<string, MarketHistoryPoint>();

  for (const point of points) {
    map.set(point.date, point);
  }

  return [...map.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchMarketLiveQuote(symbol: LiveMarketSymbol): Promise<MarketLiveQuote> {
  const apiKey = getApiKey();
  const vendorSymbol = getVendorSymbol(symbol);

  const url = new URL(`${TWELVE_DATA_BASE_URL}/price`);
  url.searchParams.set("symbol", vendorSymbol);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent": "macro-dashboard/1.0",
      accept: "application/json,text/plain;q=0.8,*/*;q=0.7"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Twelve Data price request failed for ${symbol}: ${response.status}`);
  }

  const payload = (await response.json()) as TwelveDataPriceResponse;

  if (payload.status === "error") {
    throw new Error(payload.message ?? `Twelve Data returned an error for ${symbol}.`);
  }

  const price = toFiniteNumber(payload.price);

  if (price === null) {
    throw new Error(`Invalid Twelve Data price payload for ${symbol}.`);
  }

  return {
    symbol,
    vendorSymbol,
    price,
    asOf: new Date().toISOString(),
    sourceName: "Twelve Data",
    sourceUrl: `https://api.twelvedata.com/price?symbol=${encodeURIComponent(vendorSymbol)}`
  };
}

export async function fetchMarketLiveHistory(
  symbol: LiveMarketSymbol,
  range: MarketHistoryRange
): Promise<MarketHistoryPoint[]> {
  const apiKey = getApiKey();
  const vendorSymbol = getVendorSymbol(symbol);
  const config = HISTORY_CONFIG[range];

  const url = new URL(`${TWELVE_DATA_BASE_URL}/time_series`);
  url.searchParams.set("symbol", vendorSymbol);
  url.searchParams.set("interval", config.interval);
  url.searchParams.set("outputsize", String(config.outputsize));
  url.searchParams.set("timezone", MARKET_HISTORY_TIMEZONE);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent": "macro-dashboard/1.0",
      accept: "application/json,text/plain;q=0.8,*/*;q=0.7"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Twelve Data history request failed for ${symbol}/${range}: ${response.status}`);
  }

  const payload = (await response.json()) as TwelveDataTimeSeriesResponse;

  if (payload.status === "error") {
    throw new Error(payload.message ?? `Twelve Data returned a history error for ${symbol}/${range}.`);
  }

  const values = Array.isArray(payload.values) ? payload.values : [];

  const points = values
    .map((item) => {
      const close = toFiniteNumber(item.close);

      if (!item.datetime || close === null) {
        return null;
      }

      return {
        date: normalizeSeriesTime(item.datetime),
        value: close
      };
    })
    .filter((item): item is MarketHistoryPoint => item !== null)
    .reverse();

  if (points.length < 2) {
    throw new Error(`Not enough market history returned for ${symbol}/${range}.`);
  }

  return dedupePoints(points);
}
