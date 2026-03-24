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
