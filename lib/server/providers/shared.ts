import type { IndicatorDataStatus, ProviderType } from "@/types/macro";

export interface ProviderObservation {
  provider: ProviderType;
  mode: IndicatorDataStatus;
  observedAt: string;
  currentValue: number;
  priorValue: number;
  sourceName: string;
  sourceUrl?: string;
  note?: string;
}

const monthLookup: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  sept: "09",
  oct: "10",
  nov: "11",
  dec: "12"
};

export async function fetchText(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "macro-dashboard/1.0",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7"
      },
      next: { revalidate: 0 },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${url}: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out for ${url}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, "\"")
    .replace(/&rdquo;/g, "\"")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'");
}

export function toPlainText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMonthYear(monthLabel: string, yearLabel: string) {
  const normalizedMonth = monthLabel.trim().toLowerCase();
  const month = /^\d{2}$/.test(normalizedMonth) ? normalizedMonth : monthLookup[normalizedMonth];

  if (!month) {
    throw new Error(`Unsupported month label: ${monthLabel}`);
  }

  return `${yearLabel}-${month}-01`;
}

export function parseMonthYearLabel(label: string) {
  const match = label.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);

  if (!match) {
    throw new Error(`Unsupported month-year label: ${label}`);
  }

  return parseMonthYear(match[1], match[2]);
}

export function round(value: number) {
  return Number(value.toFixed(4));
}
