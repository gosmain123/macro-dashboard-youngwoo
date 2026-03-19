import {
  fetchText,
  parseMonthYear,
  round,
  toPlainText,
  type ProviderObservation
} from "@/lib/server/providers/shared";

type FedSupportedSlug = "industrial-production";

const FED_G17_URL = "https://www.federalreserve.gov/releases/g17/current/default.htm";

function extractIndustrialProduction(text: string) {
  const releaseMatch = text.match(
    /Release Date:\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})\s+Industrial production \(IP\) increased\s+(-?\d+(?:\.\d+)?)\s+percent in\s+([A-Za-z]+)\s+after moving up\s+(-?\d+(?:\.\d+)?)\s+percent in\s+([A-Za-z]+)/i
  );

  if (!releaseMatch) {
    throw new Error("Unable to parse Federal Reserve G.17 industrial production release.");
  }

  return {
    observedAt: parseMonthYear(releaseMatch[5], releaseMatch[3]),
    currentValue: Number(releaseMatch[4]),
    priorValue: Number(releaseMatch[6])
  };
}

export async function fetchFedIndicator(slug: FedSupportedSlug): Promise<ProviderObservation> {
  if (slug !== "industrial-production") {
    throw new Error("Unsupported Federal Reserve indicator.");
  }

  const html = await fetchText(FED_G17_URL);
  const text = toPlainText(html);
  const values = extractIndustrialProduction(text);

  return {
    provider: "fed",
    mode: "live",
    observedAt: values.observedAt,
    currentValue: round(values.currentValue),
    priorValue: round(values.priorValue),
    sourceName: "Federal Reserve G.17",
    sourceUrl: FED_G17_URL
  };
}
