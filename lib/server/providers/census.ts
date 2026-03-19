import {
  fetchText,
  parseMonthYear,
  round,
  toPlainText,
  type ProviderObservation
} from "@/lib/server/providers/shared";

type CensusSupportedSlug =
  | "durable-goods"
  | "housing-starts"
  | "building-permits"
  | "retail-sales";

const CENSUS_HOUSING_URL = "https://www.census.gov/construction/nrc/current/index.html";
const CENSUS_DURABLES_URL = "https://www.census.gov/manufacturing/m3/adv/current/index.html";

function extractHousingRelease(text: string, slug: "housing-starts" | "building-permits") {
  const releaseMatch = text.match(/MONTHLY NEW RESIDENTIAL CONSTRUCTION,\s+([A-Za-z]+)\s+(\d{4})/i);

  if (!releaseMatch) {
    throw new Error("Unable to parse housing release month.");
  }

  const sectionMatch =
    slug === "housing-starts"
      ? text.match(
          /Housing Starts Privately-owned housing starts in [A-Za-z]+ were at a seasonally adjusted annual rate of ([\d,]+).*?above the revised [A-Za-z]+ estimate of ([\d,]+)/i
        )
      : text.match(
          /Building Permits Privately-owned housing units authorized by building permits in [A-Za-z]+ were at a seasonally adjusted annual rate of ([\d,]+).*?the revised [A-Za-z]+ rate of ([\d,]+)/i
        );

  if (!sectionMatch) {
    throw new Error(`Unable to parse Census housing values for ${slug}.`);
  }

  return {
    observedAt: parseMonthYear(releaseMatch[1], releaseMatch[2]),
    currentValue: Number(sectionMatch[1].replace(/,/g, "")) / 1000,
    priorValue: Number(sectionMatch[2].replace(/,/g, "")) / 1000
  };
}

function extractDurableGoodsRelease(text: string) {
  const releaseMatch = text.match(/new orders for manufactured durable goods in ([A-Za-z]+),/i);

  if (!releaseMatch) {
    throw new Error("Unable to parse Census durable goods release month.");
  }

  const yearMatch = text.match(/FOR IMMEDIATE RELEASE:\s+[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+(\d{4})/i);
  const valuesMatch = text.match(
    /Excluding transportation, new orders (increased|decreased)\s+(-?\d+(?:\.\d+)?)\s+percent\.\s+Excluding defense/i
  );
  const priorMatch = text.match(/This followed a\s+(-?\d+(?:\.\d+)?)\s+percent\s+[A-Za-z]+\s+(increase|decrease)/i);

  if (!yearMatch || !valuesMatch || !priorMatch) {
    throw new Error("Unable to parse Census durable goods values.");
  }

  return {
    observedAt: parseMonthYear(releaseMatch[1], yearMatch[1]),
    currentValue: Number(valuesMatch[2]) * (valuesMatch[1].toLowerCase() === "decreased" ? -1 : 1),
    priorValue: Number(priorMatch[1]) * (priorMatch[2].toLowerCase() === "decrease" ? -1 : 1)
  };
}

export async function fetchCensusIndicator(slug: CensusSupportedSlug): Promise<ProviderObservation> {
  if (slug === "retail-sales") {
    throw new Error("Retail Sales Control Group remains a derived Census series and cannot use the headline release value directly.");
  }

  if (slug === "housing-starts" || slug === "building-permits") {
    const html = await fetchText(CENSUS_HOUSING_URL);
    const text = toPlainText(html);
    const values = extractHousingRelease(text, slug);

    return {
      provider: "census",
      mode: "live",
      observedAt: values.observedAt,
      currentValue: round(values.currentValue),
      priorValue: round(values.priorValue),
      sourceName: "U.S. Census / HUD New Residential Construction",
      sourceUrl: CENSUS_HOUSING_URL
    };
  }

  const html = await fetchText(CENSUS_DURABLES_URL);
  const text = toPlainText(html);
  const values = extractDurableGoodsRelease(text);

  return {
    provider: "census",
    mode: "live",
    observedAt: values.observedAt,
    currentValue: round(values.currentValue),
    priorValue: round(values.priorValue),
    sourceName: "U.S. Census Advance Durable Goods",
    sourceUrl: CENSUS_DURABLES_URL
  };
}
