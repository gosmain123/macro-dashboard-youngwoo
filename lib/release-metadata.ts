import type { Frequency, IndicatorRelease } from "@/types/macro";

const sources = {
  blsCpi: {
    name: "BLS CPI schedule",
    url: "https://www.bls.gov/cpi/"
  },
  blsEmployment: {
    name: "BLS Employment Situation schedule",
    url: "https://www.bls.gov/ces/publications/news-release-schedule.htm"
  },
  blsPpi: {
    name: "BLS PPI schedule",
    url: "https://www.bls.gov/ppi/"
  },
  beaPio: {
    name: "BEA release schedule",
    url: "https://www.bea.gov/index.php/news/schedule/full"
  },
  censusCalendar: {
    name: "Census indicator calendar",
    url: "https://www.census.gov/economic-indicators/calendar-listview.html"
  },
  dolClaims: {
    name: "DOL claims release",
    url: "https://www.dol.gov/newsroom/releases"
  },
  fedG17: {
    name: "Federal Reserve G.17 schedule",
    url: "https://www.federalreserve.gov/releases/G17/default.htm"
  },
  ismCalendar: {
    name: "ISM release calendar",
    url: "https://www.ismworld.org/supply-management-news-and-reports/reports/semi-annual-economic-forecast/2025/fall/"
  },
  atlantaFedGdpNow: {
    name: "Atlanta Fed GDPNow release dates",
    url: "https://www.atlantafed.org/research-and-data/data/gdpnow"
  }
} as const;

const employmentSituationDates = [
  "2026-01-09",
  "2026-02-11",
  "2026-03-06",
  "2026-04-03",
  "2026-05-08",
  "2026-06-05",
  "2026-07-02",
  "2026-08-07",
  "2026-09-04",
  "2026-10-02",
  "2026-11-06",
  "2026-12-04"
];

const cpiReleaseDates = [
  "2026-01-13",
  "2026-02-13",
  "2026-03-11",
  "2026-04-10",
  "2026-05-12",
  "2026-06-10",
  "2026-07-14",
  "2026-08-12",
  "2026-09-11"
];

const ppiReleaseDates = [
  "2026-01-14",
  "2026-01-30",
  "2026-02-27",
  "2026-03-18",
  "2026-04-14",
  "2026-05-13",
  "2026-06-11",
  "2026-07-15",
  "2026-08-13",
  "2026-09-10"
];

const pioReleaseDates = [
  "2026-02-20",
  "2026-03-13",
  "2026-04-09",
  "2026-04-30",
  "2026-05-28",
  "2026-06-25",
  "2026-07-30",
  "2026-08-26",
  "2026-09-30",
  "2026-10-29",
  "2026-11-25",
  "2026-12-23"
];

const g17ReleaseDates = [
  "2026-01-16",
  "2026-02-18",
  "2026-03-16",
  "2026-04-16",
  "2026-05-15",
  "2026-06-15",
  "2026-07-17",
  "2026-08-18",
  "2026-09-18",
  "2026-10-16",
  "2026-11-17",
  "2026-12-16"
];

const retailSalesReleaseDates = [
  "2026-01-14",
  "2026-02-10",
  "2026-03-06",
  "2026-03-16",
  "2026-04-16",
  "2026-05-14"
];

const housingReleaseDates = [
  "2026-01-09",
  "2026-02-18",
  "2026-03-12",
  "2026-03-17",
  "2026-04-17",
  "2026-05-19"
];

const durableGoodsReleaseDates = [
  "2026-01-26",
  "2026-02-18",
  "2026-03-13",
  "2026-03-25",
  "2026-04-24",
  "2026-05-28"
];

const wholesaleTradeReleaseDates = [
  "2026-01-08",
  "2026-01-29",
  "2026-02-24",
  "2026-03-19",
  "2026-04-09",
  "2026-05-08",
  "2026-06-09"
];

const internationalTradeReleaseDates = [
  "2026-01-08",
  "2026-01-29",
  "2026-02-19",
  "2026-03-12",
  "2026-04-02",
  "2026-05-05",
  "2026-06-09"
];

function getEasternToday(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function getEasternDate(now = new Date()) {
  const date = getEasternToday(now);
  return new Date(`${date}T12:00:00Z`);
}

function getNextDate(dates: string[], now = new Date()) {
  const today = getEasternToday(now);
  return dates.find((date) => date >= today);
}

function getBusinessDayOfMonth(year: number, monthIndex: number, ordinal: number) {
  let businessDayCount = 0;
  const cursor = new Date(Date.UTC(year, monthIndex, 1));

  while (cursor.getUTCMonth() === monthIndex) {
    const weekday = cursor.getUTCDay();

    if (weekday !== 0 && weekday !== 6) {
      businessDayCount += 1;

      if (businessDayCount === ordinal) {
        return cursor.toISOString().slice(0, 10);
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return undefined;
}

function buildIsmReleaseDates(kind: "manufacturing" | "services", startYear = 2026, years = 2) {
  const dates: string[] = [];

  for (let year = startYear; year < startYear + years; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      const januaryOrdinal =
        kind === "manufacturing" ? 2 : 4;
      const defaultOrdinal =
        kind === "manufacturing" ? 1 : 3;
      const ordinal = month === 0 ? januaryOrdinal : defaultOrdinal;
      const date = getBusinessDayOfMonth(year, month, ordinal);

      if (date) {
        dates.push(date);
      }
    }
  }

  return dates;
}

const ismManufacturingDates = buildIsmReleaseDates("manufacturing");
const ismServicesDates = buildIsmReleaseDates("services");

function getNextThursday(now = new Date()) {
  const current = getEasternDate(now);
  const day = current.getUTCDay();
  const daysUntilThursday = (4 - day + 7) % 7;
  current.setUTCDate(current.getUTCDate() + daysUntilThursday);
  return current.toISOString().slice(0, 10);
}

function getGdpNowDates() {
  const dates = new Set<string>([
    ...ismManufacturingDates,
    ...retailSalesReleaseDates,
    ...housingReleaseDates,
    ...durableGoodsReleaseDates,
    ...pioReleaseDates,
    ...wholesaleTradeReleaseDates,
    ...internationalTradeReleaseDates
  ]);

  return [...dates].sort();
}

function scheduledRelease(
  nextReleaseDate: string | undefined,
  timeLabel: string,
  detail: string,
  sourceName: string,
  sourceUrl: string
): IndicatorRelease {
  return {
    type: "scheduled",
    label: "Next release",
    nextReleaseDate,
    timeLabel,
    detail,
    sourceName,
    sourceUrl
  };
}

function marketRelease(detail = "Updates daily"): IndicatorRelease {
  return {
    type: "market",
    label: "Last close",
    detail
  };
}

function continuousRelease(detail: string): IndicatorRelease {
  return {
    type: "continuous",
    label: "Cadence",
    detail
  };
}

export function getIndicatorRelease(slug: string, frequency: Frequency, releaseCadence: string, now = new Date()) {
  if (slug === "cpi-headline" || slug === "core-cpi") {
    return scheduledRelease(
      getNextDate(cpiReleaseDates, now),
      "8:30 AM ET",
      "Monthly BLS CPI release",
      sources.blsCpi.name,
      sources.blsCpi.url
    );
  }

  if (slug === "ppi-final-demand") {
    return scheduledRelease(
      getNextDate(ppiReleaseDates, now),
      "8:30 AM ET",
      "Monthly BLS PPI release",
      sources.blsPpi.name,
      sources.blsPpi.url
    );
  }

  if (slug === "core-pce") {
    return scheduledRelease(
      getNextDate(pioReleaseDates, now),
      "8:30 AM ET",
      "Monthly BEA Personal Income and Outlays release",
      sources.beaPio.name,
      sources.beaPio.url
    );
  }

  if (["avg-hourly-earnings", "nonfarm-payrolls", "unemployment-rate"].includes(slug)) {
    return scheduledRelease(
      getNextDate(employmentSituationDates, now),
      "8:30 AM ET",
      "Monthly BLS Employment Situation release",
      sources.blsEmployment.name,
      sources.blsEmployment.url
    );
  }

  if (slug === "initial-claims") {
    return scheduledRelease(
      getNextThursday(now),
      "8:30 AM ET",
      "Weekly Department of Labor claims release",
      sources.dolClaims.name,
      sources.dolClaims.url
    );
  }

  if (slug === "gdp-nowcast") {
    return scheduledRelease(
      getNextDate(getGdpNowDates(), now),
      "After source releases",
      "Updated after qualifying source releases on the Atlanta Fed schedule",
      sources.atlantaFedGdpNow.name,
      sources.atlantaFedGdpNow.url
    );
  }

  if (slug === "ism-manufacturing") {
    return scheduledRelease(
      getNextDate(ismManufacturingDates, now),
      "10:00 AM ET",
      "Issued on the first business day of most months",
      sources.ismCalendar.name,
      sources.ismCalendar.url
    );
  }

  if (slug === "ism-services") {
    return scheduledRelease(
      getNextDate(ismServicesDates, now),
      "10:00 AM ET",
      "Issued on the third business day of most months",
      sources.ismCalendar.name,
      sources.ismCalendar.url
    );
  }

  if (slug === "industrial-production") {
    return scheduledRelease(
      getNextDate(g17ReleaseDates, now),
      "9:15 AM ET",
      "Federal Reserve G.17 release",
      sources.fedG17.name,
      sources.fedG17.url
    );
  }

  if (slug === "retail-sales") {
    return scheduledRelease(
      getNextDate(retailSalesReleaseDates, now),
      "8:30 AM ET",
      "Advance Monthly Retail Trade release",
      sources.censusCalendar.name,
      sources.censusCalendar.url
    );
  }

  if (slug === "durable-goods") {
    return scheduledRelease(
      getNextDate(durableGoodsReleaseDates, now),
      "8:30 AM ET",
      "Advance durable goods release",
      sources.censusCalendar.name,
      sources.censusCalendar.url
    );
  }

  if (slug === "housing-starts" || slug === "building-permits") {
    return scheduledRelease(
      getNextDate(housingReleaseDates, now),
      "8:30 AM ET",
      "New Residential Construction release",
      sources.censusCalendar.name,
      sources.censusCalendar.url
    );
  }

  if (
    [
      "five-year-breakeven",
      "us-2y-treasury",
      "us-10y-treasury",
      "curve-2s10s",
      "curve-3m10y",
      "ig-spreads",
      "hy-spreads",
      "ten-year-real-yield",
      "dxy",
      "eurusd",
      "usdjpy",
      "usdcnh",
      "wti-oil",
      "natural-gas",
      "copper",
      "gold",
      "copper-gold-ratio",
      "sofr-implied-cuts",
      "terminal-rate-pricing",
      "next-three-fomc-path",
      "vix",
      "move-index",
      "breadth",
      "cyclical-vs-defensive",
      "equal-weight-vs-cap-weight",
      "small-caps-vs-large-caps",
      "etf-flows"
    ].includes(slug)
  ) {
    return marketRelease("Updates daily");
  }

  if (frequency === "Live") {
    return continuousRelease(releaseCadence);
  }

  return continuousRelease(releaseCadence);
}
