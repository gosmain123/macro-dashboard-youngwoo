import { z } from "zod";

import {
  fetchText,
  parseMonthYearLabel,
  round,
  toPlainText,
  type ProviderObservation
} from "@/lib/server/providers/shared";

type BeaSupportedSlug = "headline-pce" | "core-pce";

const beaIndicatorConfig: Record<
  BeaSupportedSlug,
  {
    url: string;
    sourceName: string;
  }
> = {
  "headline-pce": {
    url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index",
    sourceName: "BEA Personal Consumption Expenditures Price Index"
  },
  "core-pce": {
    url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index-excluding-food-and-energy",
    sourceName: "BEA Personal Income and Outlays"
  }
};

const currentReleaseSchema = z.object({
  label: z.string(),
  currentValue: z.number(),
  priorLabel: z.string(),
  priorValue: z.number()
});

function extractBeaChangeSeries(text: string) {
  const normalized = text.replace(/\s+/g, " ");
  const match = normalized.match(
    /Change From Month One Year Ago\s+([A-Za-z]+\s+\d{4})\s*\+?(-?\d+(?:\.\d+)?)%\s+([A-Za-z]+\s+\d{4})\s*\+?(-?\d+(?:\.\d+)?)%/
  );

  if (!match) {
    throw new Error("Could not parse BEA year-over-year change table.");
  }

  return currentReleaseSchema.parse({
    label: match[1],
    currentValue: Number(match[2]),
    priorLabel: match[3],
    priorValue: Number(match[4])
  });
}

export async function fetchBeaIndicator(slug: BeaSupportedSlug): Promise<ProviderObservation> {
  const config = beaIndicatorConfig[slug];
  const html = await fetchText(config.url);
  const text = toPlainText(html);
  const release = extractBeaChangeSeries(text);

  return {
    provider: "bea",
    mode: "live",
    observedAt: parseMonthYearLabel(release.label),
    currentValue: round(release.currentValue),
    priorValue: round(release.priorValue),
    sourceName: config.sourceName,
    sourceUrl: config.url
  };
}
