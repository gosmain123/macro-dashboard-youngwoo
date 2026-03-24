const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

export type MarketLiveSymbol = "gold";

type TwelveDataPriceResponse = {
  price?: string;
  code?: number;
  message?: string;
  status?: string;
};

export type MarketLiveQuote = {
  symbol: MarketLiveSymbol;
  vendorSymbol: string;
  price: number;
  asOf: string;
  sourceName: string;
  sourceUrl: string;
};
 
function getApiKey(): string {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TWELVE_DATA_API_KEY.");
  }

  return apiKey;
}

function getVendorSymbol(symbol: MarketLiveSymbol): string {
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

export async function fetchMarketLiveQuote(symbol: MarketLiveSymbol): Promise<MarketLiveQuote> {
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

export type MarketBar = {
  symbol: MarketLiveSymbol;
  barTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  sourceName: string;
  sourceUrl: string;
};

function normalizeBarTime(value: string): string {
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = iso.endsWith("Z") ? iso : `${iso}Z`;
  const date = new Date(withZone);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid bar datetime: ${value}`);
  }

  return date.toISOString();
}

export async function fetchMarketLiveBars(
  symbol: MarketLiveSymbol,
  outputsize = 180
): Promise<MarketBar[]> {
  const apiKey = getApiKey();
  const vendorSymbol = getVendorSymbol(symbol);

  const url = new URL(`${TWELVE_DATA_BASE_URL}/time_series`);
  url.searchParams.set("symbol", vendorSymbol);
  url.searchParams.set("interval", "1min");
  url.searchParams.set("outputsize", String(outputsize));
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent": "macro-dashboard/1.0",
      accept: "application/json,text/plain;q=0.8,*/*;q=0.7"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Twelve Data time_series request failed for ${symbol}: ${response.status}`);
  }

  const payload = (await response.json()) as TwelveDataTimeSeriesResponse;

  if (payload.status === "error") {
    throw new Error(payload.message ?? `Twelve Data returned a time_series error for ${symbol}.`);
  }

  const values = Array.isArray(payload.values) ? payload.values : [];

  const bars = values
    .map((item) => {
      const open = toFiniteNumber(item.open);
      const high = toFiniteNumber(item.high);
      const low = toFiniteNumber(item.low);
      const close = toFiniteNumber(item.close);
      const volume = toFiniteNumber(item.volume);

      if (
        !item.datetime ||
        open === null ||
        high === null ||
        low === null ||
        close === null
      ) {
        return null;
      }

      return {
        symbol,
        barTime: normalizeBarTime(item.datetime),
        open,
        high,
        low,
        close,
        volume,
        sourceName: "Twelve Data",
        sourceUrl: `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(vendorSymbol)}&interval=1min`
      };
    })
    .filter((item): item is MarketBar => item !== null)
    .reverse();

  if (bars.length < 2) {
    throw new Error(`Not enough 1-minute bars returned for ${symbol}.`);
  }

  return bars;
}
