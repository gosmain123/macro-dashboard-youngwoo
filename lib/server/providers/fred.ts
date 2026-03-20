const FRED_API_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";
const FRED_GRAPH_CSV_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";

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

function normalizeFredObservations(observations: FredApiObservation[]) {
  return observations
    .filter((item) => item.value !== "." && item.value !== "")
    .map((item) => ({
      date: item.date,
      value: Number(item.value)
    }))
    .filter((item) => Number.isFinite(item.value))
    .reverse();
}

async function fetchFredObservationsFromApi(
  seriesId: string,
  limit: number,
  apiKey: string
): Promise<FredObservation[]> {
  const url = new URL(FRED_API_BASE_URL);
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
  const observations = normalizeFredObservations(payload.observations);

  if (observations.length === 0) {
    throw new Error(`No usable observations returned for ${seriesId}.`);
  }

  return observations;
}

function parseFredCsv(text: string): FredObservation[] {
  const lines = text.trim().split(/\r?\n/);

  if (lines.length <= 1) {
    return [];
  }

  return lines
    .slice(1)
    .map((line) => {
      const commaIndex = line.indexOf(",");

      if (commaIndex === -1) {
        return null;
      }

      const date = line.slice(0, commaIndex).trim();
      const rawValue = line.slice(commaIndex + 1).trim().replace(/^"|"$/g, "");

if (!date || rawValue === "." || rawValue === "") {
  return null;
}

const normalizedRawValue = rawValue.replace(/,/g, "");
const value = Number(normalizedRawValue);

      if (!Number.isFinite(value)) {
        return null;
      }

      return { date, value };
    })
    .filter((item): item is FredObservation => item !== null);
}

async function fetchFredObservationsFromCsv(seriesId: string, limit: number): Promise<FredObservation[]> {
  const url = new URL(FRED_GRAPH_CSV_BASE_URL);
  url.searchParams.set("id", seriesId);

  const response = await fetch(url.toString(), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`FRED CSV request failed for ${seriesId}: ${response.status}`);
  }

  const observations = parseFredCsv(await response.text());

  if (observations.length === 0) {
    throw new Error(`No usable CSV observations returned for ${seriesId}.`);
  }

  return observations.slice(-limit);
}

export async function fetchFredObservations(seriesId: string, limit = 24): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;

  if (apiKey) {
    try {
      return await fetchFredObservationsFromApi(seriesId, limit, apiKey);
    } catch (error) {
      console.warn(
        JSON.stringify({
          event: "fred_api_fallback_to_csv",
          series_id: seriesId,
          message: error instanceof Error ? error.message : "FRED API failed, falling back to CSV."
        })
      );
    }
  }

  return fetchFredObservationsFromCsv(seriesId, limit);
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
