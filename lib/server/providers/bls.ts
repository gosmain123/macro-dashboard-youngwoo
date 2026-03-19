import { z } from "zod";

import { parseMonthYear, round, type ProviderObservation } from "@/lib/server/providers/shared";

const BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

type BlsSupportedSlug =
  | "cpi-headline"
  | "core-cpi"
  | "ppi-final-demand"
  | "avg-hourly-earnings"
  | "nonfarm-payrolls"
  | "unemployment-rate";

type BlsTransform = "level" | "yoy" | "mom-diff";

const blsIndicatorConfig: Record<
  BlsSupportedSlug,
  {
    seriesId: string;
    transform: BlsTransform;
    sourceName: string;
    sourceUrl: string;
  }
> = {
  "cpi-headline": {
    seriesId: "CUUR0000SA0",
    transform: "yoy",
    sourceName: "BLS CPI",
    sourceUrl: "https://www.bls.gov/cpi/"
  },
  "core-cpi": {
    seriesId: "CUUR0000SA0L1E",
    transform: "yoy",
    sourceName: "BLS CPI",
    sourceUrl: "https://www.bls.gov/cpi/"
  },
  "ppi-final-demand": {
    seriesId: "WPUFD4",
    transform: "yoy",
    sourceName: "BLS PPI",
    sourceUrl: "https://www.bls.gov/ppi/"
  },
  "avg-hourly-earnings": {
    seriesId: "CES0500000003",
    transform: "yoy",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm"
  },
  "nonfarm-payrolls": {
    seriesId: "CES0000000001",
    transform: "mom-diff",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm"
  },
  "unemployment-rate": {
    seriesId: "LNS14000000",
    transform: "level",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm"
  }
};

const blsResponseSchema = z.object({
  status: z.string(),
  Results: z.object({
    series: z.array(
      z.object({
        seriesID: z.string(),
        data: z.array(
          z.object({
            year: z.string(),
            period: z.string(),
            value: z.string()
          })
        )
      })
    )
  })
});

type BlsPoint = {
  date: string;
  value: number;
};

function buildBlsSeries(values: Array<{ year: string; period: string; value: string }>) {
  return values
    .filter((entry) => /^M\d{2}$/.test(entry.period))
    .map((entry) => ({
      date: parseMonthYear(entry.period.slice(1), entry.year),
      value: Number(entry.value.replace(/,/g, ""))
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function transformSeries(series: BlsPoint[], transform: BlsTransform) {
  if (transform === "level") {
    return series.map((entry) => ({
      date: entry.date,
      value: round(entry.value)
    }));
  }

  if (transform === "yoy") {
    return series
      .map((entry, index) => {
        const priorYear = series[index - 12];

        if (!priorYear || priorYear.value === 0) {
          return null;
        }

        return {
          date: entry.date,
          value: round(((entry.value / priorYear.value) - 1) * 100)
        };
      })
      .filter((entry): entry is BlsPoint => Boolean(entry));
  }

  return series
    .map((entry, index) => {
      const priorMonth = series[index - 1];

      if (!priorMonth) {
        return null;
      }

      return {
        date: entry.date,
        value: round(entry.value - priorMonth.value)
      };
    })
    .filter((entry): entry is BlsPoint => Boolean(entry));
}

export async function fetchBlsIndicator(slug: BlsSupportedSlug): Promise<ProviderObservation> {
  const config = blsIndicatorConfig[slug];
  const currentYear = new Date().getUTCFullYear();
  const response = await fetch(BLS_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      seriesid: [config.seriesId],
      startyear: String(currentYear - 3),
      endyear: String(currentYear)
    }),
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`BLS request failed for ${slug}: ${response.status}`);
  }

  const payload = blsResponseSchema.parse(await response.json());
  const series = payload.Results.series[0];

  if (!series || series.seriesID !== config.seriesId) {
    throw new Error(`Unexpected BLS series mapping for ${slug}.`);
  }

  const rawSeries = buildBlsSeries(series.data);
  const transformed = transformSeries(rawSeries, config.transform);
  const current = transformed.at(-1);
  const prior = transformed.at(-2);

  if (!current || !prior) {
    throw new Error(`Not enough BLS data to resolve ${slug}.`);
  }

  return {
    provider: "bls",
    mode: "live",
    observedAt: current.date,
    currentValue: current.value,
    priorValue: prior.value,
    sourceName: config.sourceName,
    sourceUrl: config.sourceUrl
  };
}
