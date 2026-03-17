const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

interface FredApiObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredApiObservation[];
}

export interface FredObservation {
  date: string;
  value: number;
}

export interface FredSeriesResult {
  currentValue: number;
  priorValue: number;
  chartHistory: Array<{ date: string; value: number }>;
}

export async function fetchFredObservations(seriesId: string, limit = 24): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FRED_API_KEY.");
  }

  const url = new URL(FRED_BASE_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`FRED request failed for ${seriesId}: ${response.status}`);
  }

  const payload = (await response.json()) as FredResponse;
  const observations = payload.observations
    .filter((item) => item.value !== ".")
    .map((item) => ({
      date: item.date,
      value: Number(item.value)
    }))
    .reverse();

  if (observations.length === 0) {
    throw new Error(`No usable observations returned for ${seriesId}.`);
  }

  return observations;
}

export async function fetchFredSeries(seriesId: string, limit = 24): Promise<FredSeriesResult> {
  const observations = await fetchFredObservations(seriesId, limit);

  if (observations.length < 2) {
    throw new Error(`Not enough observations returned for ${seriesId}.`);
  }

  const current = observations.at(-1);
  const prior = observations.at(-2);

  if (!current || !prior) {
    throw new Error(`Missing current or prior observation for ${seriesId}.`);
  }

  return {
    currentValue: current.value,
    priorValue: prior.value,
    chartHistory: observations
  };
}
