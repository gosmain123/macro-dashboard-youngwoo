import {
  decodeHtmlEntities,
  fetchText,
  parseMonthYear,
  round,
  toPlainText,
  type ProviderObservation
} from "@/lib/server/providers/shared";

const DOL_RSS_URL = "https://www.dol.gov/rss/releases.xml";

function extractLatestClaimsReleaseLink(xml: string) {
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;
  let match = itemPattern.exec(xml);

  while (match) {
    const item = match[1];
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/i);
    const title = decodeHtmlEntities(titleMatch?.[1] ?? "").trim();

    if (title.includes("Unemployment Insurance Weekly Claims Report") && linkMatch?.[1]) {
      return decodeHtmlEntities(linkMatch[1]).trim();
    }

    match = itemPattern.exec(xml);
  }

  throw new Error("Unable to locate the latest DOL weekly claims release.");
}

function extractClaimsValues(text: string) {
  const valuesMatch = text.match(
    /advance figure for seasonally adjusted initial claims was\s+([\d,]+),\s+a\s+(?:decrease|increase)\s+of\s+[\d,]+\s+from the previous week's revised figure of\s+([\d,]+)/i
  );
  const weekEndingMatch = text.match(/week ending\s+([A-Za-z]+)\s+(\d{1,2})/i);
  const yearMatch = text.match(/FOR IMMEDIATE RELEASE:\s+[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+(\d{4})/i);

  if (!valuesMatch || !weekEndingMatch || !yearMatch) {
    throw new Error("Unable to parse the DOL weekly claims release.");
  }

  return {
    observedAt: parseMonthYear(weekEndingMatch[1], yearMatch[1]).replace(/-01$/, `-${String(weekEndingMatch[2]).padStart(2, "0")}`),
    currentValue: Number(valuesMatch[1].replace(/,/g, "")) / 1000,
    priorValue: Number(valuesMatch[2].replace(/,/g, "")) / 1000
  };
}

export async function fetchDolIndicator(): Promise<ProviderObservation> {
  const rss = await fetchText(DOL_RSS_URL);
  const releaseUrl = extractLatestClaimsReleaseLink(rss);
  const html = await fetchText(releaseUrl);
  const text = toPlainText(html);
  const values = extractClaimsValues(text);

  return {
    provider: "dol",
    mode: "live",
    observedAt: values.observedAt,
    currentValue: round(values.currentValue),
    priorValue: round(values.priorValue),
    sourceName: "U.S. Department of Labor Weekly Claims",
    sourceUrl: releaseUrl
  };
}
