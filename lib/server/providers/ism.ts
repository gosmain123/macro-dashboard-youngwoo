import { format } from "date-fns";

import {
  fetchText,
  round,
  toPlainText,
  type ProviderObservation
} from "@/lib/server/providers/shared";

type IsmSupportedSlug = "ism-manufacturing" | "ism-services";

function getBusinessDayOfMonth(year: number, monthIndex: number, ordinal: number) {
  let businessDayCount = 0;
  const cursor = new Date(Date.UTC(year, monthIndex, 1));

  while (cursor.getUTCMonth() === monthIndex) {
    const weekday = cursor.getUTCDay();

    if (weekday !== 0 && weekday !== 6) {
      businessDayCount += 1;

      if (businessDayCount === ordinal) {
        return new Date(cursor.getTime());
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  throw new Error("Unable to resolve ISM release date.");
}

function getLatestIsmReleaseDate(kind: IsmSupportedSlug, now = new Date()) {
  const currentMonthRelease =
    kind === "ism-manufacturing"
      ? getBusinessDayOfMonth(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCMonth() === 0 ? 2 : 1)
      : getBusinessDayOfMonth(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCMonth() === 0 ? 4 : 3);

  if (currentMonthRelease.getTime() <= now.getTime()) {
    return currentMonthRelease;
  }

  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
  return kind === "ism-manufacturing"
    ? getBusinessDayOfMonth(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth(), previousMonth.getUTCMonth() === 0 ? 2 : 1)
    : getBusinessDayOfMonth(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth(), previousMonth.getUTCMonth() === 0 ? 4 : 3);
}

function getIsmConfig(slug: IsmSupportedSlug) {
  const releaseDate = getLatestIsmReleaseDate(slug);
  const observedMonth = new Date(Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth() - 1, 1));
  const segment = format(observedMonth, "MMMM").toLowerCase();

  if (slug === "ism-manufacturing") {
    return {
      observedAt: format(observedMonth, "yyyy-MM-01"),
      url: `https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/${segment}/`,
      sourceName: "ISM Manufacturing PMI"
    };
  }

  return {
    observedAt: format(observedMonth, "yyyy-MM-01"),
    url: `https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/${segment}/`,
    sourceName: "ISM Services PMI"
  };
}

function extractIsmValues(text: string, slug: IsmSupportedSlug) {
  if (slug === "ism-manufacturing") {
    const match = text.match(
      /Manufacturing PMI® registered\s+(-?\d+(?:\.\d+)?)\s+percent[^.]*?reading of\s+(-?\d+(?:\.\d+)?)\s+in\s+[A-Za-z]+/i
    );

    if (!match) {
      throw new Error("Unable to parse ISM manufacturing PMI values.");
    }

    return {
      currentValue: Number(match[1]),
      priorValue: Number(match[2])
    };
  }

  const match = text.match(
    /Services PMI® registered\s+(-?\d+(?:\.\d+)?)\s+percent[^.]*?(?:figure of|reading of)\s+(-?\d+(?:\.\d+)?)\s+percent/i
  );

  if (!match) {
    throw new Error("Unable to parse ISM services PMI values.");
  }

  return {
    currentValue: Number(match[1]),
    priorValue: Number(match[2])
  };
}

export async function fetchIsmIndicator(slug: IsmSupportedSlug): Promise<ProviderObservation> {
  const config = getIsmConfig(slug);
  const html = await fetchText(config.url);
  const text = toPlainText(html);
  const values = extractIsmValues(text, slug);

  return {
    provider: "ism",
    mode: "live",
    observedAt: config.observedAt,
    currentValue: round(values.currentValue),
    priorValue: round(values.priorValue),
    sourceName: config.sourceName,
    sourceUrl: config.url
  };
}
