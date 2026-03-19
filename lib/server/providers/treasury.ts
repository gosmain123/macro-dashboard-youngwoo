import {
  decodeHtmlEntities,
  round,
  type ProviderObservation
} from "@/lib/server/providers/shared";

type TreasurySupportedSlug = "us-2y-treasury" | "us-10y-treasury" | "us-30y-treasury";

const TREASURY_TEXT_VIEW_BASE =
  "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView";

function formatTreasuryMonth(date = new Date()) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatPreviousTreasuryMonth(date = new Date()) {
  const previousMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  return formatTreasuryMonth(previousMonth);
}

function buildTreasuryUrl(month = formatTreasuryMonth()) {
  return `${TREASURY_TEXT_VIEW_BASE}?field_tdr_date_value_month=${month}&type=daily_treasury_yield_curve`;
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractTableRows(html: string) {
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);

  if (!tableMatch) {
    throw new Error("Unable to locate the Treasury yield curve table.");
  }

  return [...tableMatch[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((row) =>
    [...row[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => stripHtml(cell[1]))
  );
}

function resolveTargetColumn(header: string[], slug: TreasurySupportedSlug) {
  const target = slug === "us-2y-treasury" ? "2 Yr" : slug === "us-10y-treasury" ? "10 Yr" : "30 Yr";
  const columnIndex = header.findIndex((cell) => cell === target);

  if (columnIndex === -1) {
    throw new Error(`Unable to locate Treasury ${target} column.`);
  }

  return columnIndex;
}

function extractTreasuryPoints(rows: string[][], slug: TreasurySupportedSlug) {
  const headerRowIndex = rows.findIndex((row) => row[0] === "Date");

  if (headerRowIndex === -1) {
    throw new Error("Unable to locate the Treasury table header row.");
  }

  const header = rows[headerRowIndex];
  const columnIndex = resolveTargetColumn(header, slug);
  const points = rows
    .slice(headerRowIndex + 1)
    .filter((row) => row.length > columnIndex && /^\d{2}\/\d{2}\/\d{4}$/.test(row[0]) && row[columnIndex] !== "N/A")
    .map((row) => ({
      date: row[0],
      value: Number(row[columnIndex])
    }));

  if (points.length < 2) {
    throw new Error("Not enough Treasury observations in the current month view.");
  }

  return points;
}

function toIsoDate(value: string) {
  const [month, day, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

export async function fetchTreasuryIndicator(slug: TreasurySupportedSlug): Promise<ProviderObservation> {
  const currentMonth = formatTreasuryMonth();
  const monthsToTry = [currentMonth, formatPreviousTreasuryMonth()];

  for (const month of monthsToTry) {
    const response = await fetch(buildTreasuryUrl(month), {
      headers: {
        "user-agent": "macro-dashboard/1.0",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.7"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      continue;
    }

    try {
      const html = await response.text();
      const points = extractTreasuryPoints(extractTableRows(html), slug);
      const current = points.at(-1);
      const prior = points.at(-2);

      if (!current || !prior) {
        continue;
      }

      return {
        provider: "treasury",
        mode: "live",
        observedAt: toIsoDate(current.date),
        currentValue: round(current.value),
        priorValue: round(prior.value),
        sourceName: "U.S. Treasury Daily Yield Curve",
        sourceUrl: buildTreasuryUrl(month)
      };
    } catch {
      continue;
    }
  }

  throw new Error(`Unable to parse Treasury ${slug} observations.`);
}
