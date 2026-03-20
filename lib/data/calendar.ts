import { growthIndicators } from "@/lib/data/growth";
import { inflationIndicators } from "@/lib/data/inflation";
import { laborIndicators } from "@/lib/data/labor";
import { formatIndicatorValue } from "@/lib/utils";
import { releaseSnapshotInputs } from "@/lib/workflow-data";
import type { CalendarEvent, CalendarEventStatus, MacroIndicator } from "@/types/macro";

type EventCategory = CalendarEvent["category"];
type EventImportance = CalendarEvent["importance"];

type ModuleLink = Pick<CalendarEvent, "module" | "moduleLabel" | "moduleHref">;
type FlowLink = Pick<CalendarEvent, "playbookLabel" | "playbookHref">;
type EventValueFields = Pick<CalendarEvent, "actual" | "forecast" | "previous" | "revisedPrevious">;

type SourceDefinition = {
  name: string;
  url: string;
};

type EventSeed = {
  id: string;
  title: string;
  date: string;
  timeLabel: string;
  category: EventCategory;
  importance: EventImportance;
  module: ModuleLink;
  flow: FlowLink;
  source: SourceDefinition;
  whyItMatters: string;
  whatToConfirmNext: string;
  indicatorSlug?: string;
  values?: EventValueFields;
  status?: CalendarEventStatus;
};

const DEFAULT_TIMEZONE = "America/New_York";
const DEFAULT_COUNTRY = "United States";
const ACTIVE_YEAR = 2026;

const sources = {
  fedCalendar: {
    name: "Federal Reserve calendar",
    url: "https://www.federalreserve.gov/newsevents/calendar.htm"
  },
  fomcSchedule: {
    name: "Federal Reserve FOMC calendar",
    url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
  },
  blsCpi: {
    name: "BLS CPI release calendar",
    url: "https://www.bls.gov/schedule/news_release/cpi.htm"
  },
  blsPpi: {
    name: "BLS PPI release calendar",
    url: "https://www.bls.gov/schedule/news_release/ppi.htm"
  },
  blsEmployment: {
    name: "BLS Employment Situation calendar",
    url: "https://www.bls.gov/ces/publications/news-release-schedule.htm"
  },
  blsJolts: {
    name: "BLS JOLTS release calendar",
    url: "https://www.bls.gov/jlt/"
  },
  blsTradePrices: {
    name: "BLS Import and Export Prices calendar",
    url: "https://www.bls.gov/schedule/news_release/ximpim.htm"
  },
  blsEci: {
    name: "BLS Employment Cost Index calendar",
    url: "https://www.bls.gov/schedule/news_release/eci.htm"
  },
  blsProductivity: {
    name: "BLS Productivity calendar",
    url: "https://www.bls.gov/schedule/news_release/prod2.htm"
  },
  beaSchedule: {
    name: "BEA release schedule",
    url: "https://www.bea.gov/news/schedule/full"
  },
  censusCalendar: {
    name: "Census economic indicators calendar",
    url: "https://www.census.gov/economic-indicators/calendar-listview.html"
  },
  censusRetail: {
    name: "Census retail sales release",
    url: "https://www.census.gov/retail/sales.html"
  },
  censusHousing: {
    name: "Census housing release",
    url: "https://www.census.gov/construction/nrc/index.html"
  },
  censusDurableGoods: {
    name: "Census durable goods release",
    url: "https://www.census.gov/manufacturing/m3/index.html"
  },
  treasuryAuctions: {
    name: "Treasury auction schedule",
    url: "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics"
  },
  ismManufacturing: {
    name: "ISM Manufacturing PMI schedule",
    url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/"
  },
  ismServices: {
    name: "ISM Services PMI schedule",
    url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/"
  },
  conferenceBoard: {
    name: "Conference Board Consumer Confidence",
    url: "https://www.conference-board.org/topics/consumer-confidence"
  }
} as const;

const modules: Record<string, ModuleLink> = {
  inflation: {
    module: "inflation",
    moduleLabel: "Inflation",
    moduleHref: "/inflation"
  },
  growth: {
    module: "growth",
    moduleLabel: "Growth",
    moduleHref: "/growth"
  },
  labor: {
    module: "labor",
    moduleLabel: "Labor",
    moduleHref: "/labor"
  },
  policy: {
    module: "policy-liquidity",
    moduleLabel: "Policy Expectations",
    moduleHref: "/policy-expectations"
  },
  liquidity: {
    module: "policy-liquidity",
    moduleLabel: "Liquidity",
    moduleHref: "/liquidity"
  },
  rates: {
    module: "rates-credit",
    moduleLabel: "Rates & Credit",
    moduleHref: "/rates-credit"
  }
};

const flows: Record<string, FlowLink> = {
  inflation: {
    playbookLabel: "CPI / Core PCE Flow",
    playbookHref: "/macro-flow#cpi-core-pce"
  },
  labor: {
    playbookLabel: "Payrolls / Unemployment / Wages Flow",
    playbookHref: "/macro-flow#payrolls-unemployment-wages"
  },
  claims: {
    playbookLabel: "Claims Early Warning Flow",
    playbookHref: "/macro-flow#claims-early-warning"
  },
  growth: {
    playbookLabel: "ISM / Growth Turn Flow",
    playbookHref: "/macro-flow#ism-manufacturing-services"
  },
  rates: {
    playbookLabel: "2Y / 10Y / Curve Flow",
    playbookHref: "/macro-flow#rates-curve"
  },
  credit: {
    playbookLabel: "IG / HY Spreads Flow",
    playbookHref: "/macro-flow#ig-hy-spreads"
  },
  liquidity: {
    playbookLabel: "Liquidity Path",
    playbookHref: "/macro-flow#liquidity-path"
  }
};

const indicatorUniverse: MacroIndicator[] = [...inflationIndicators, ...growthIndicators, ...laborIndicators];
const indicatorBySlug = new Map(indicatorUniverse.map((indicator) => [indicator.slug, indicator]));
const snapshotByKey = new Map(
  releaseSnapshotInputs.map((snapshot) => [`${snapshot.indicatorSlug}:${snapshot.releaseDate}`, snapshot])
);

function getUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 12));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getEasternToday(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIMEZONE,
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

function isBusinessDay(date: Date) {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

function getFirstBusinessDayOnOrAfter(year: number, monthIndex: number, day: number) {
  const cursor = getUtcDate(year, monthIndex, day);

  while (!isBusinessDay(cursor)) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return toDateKey(cursor);
}

function getBusinessDayOfMonth(year: number, monthIndex: number, ordinal: number) {
  const cursor = getUtcDate(year, monthIndex, 1);
  let seen = 0;

  while (cursor.getUTCMonth() === monthIndex) {
    if (isBusinessDay(cursor)) {
      seen += 1;

      if (seen === ordinal) {
        return toDateKey(cursor);
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return getFirstBusinessDayOnOrAfter(year, monthIndex, 1);
}

function getNthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, ordinal: number) {
  const cursor = getUtcDate(year, monthIndex, 1);
  let seen = 0;

  while (cursor.getUTCMonth() === monthIndex) {
    if (cursor.getUTCDay() === weekday) {
      seen += 1;

      if (seen === ordinal) {
        return toDateKey(cursor);
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return toDateKey(getUtcDate(year, monthIndex, 1));
}

function getLastWeekdayOfMonth(year: number, monthIndex: number, weekday: number) {
  const cursor = getUtcDate(year, monthIndex + 1, 0);

  while (cursor.getUTCDay() !== weekday) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return toDateKey(cursor);
}

function buildIsmReleaseDates(kind: "manufacturing" | "services", year: number) {
  const dates: string[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const januaryOrdinal = kind === "manufacturing" ? 2 : 4;
    const defaultOrdinal = kind === "manufacturing" ? 1 : 3;
    const ordinal = monthIndex === 0 ? januaryOrdinal : defaultOrdinal;
    dates.push(getBusinessDayOfMonth(year, monthIndex, ordinal));
  }

  return dates;
}

function buildMonthlyDates(
  year: number,
  startDay: number,
  overrides: string[] = [],
  monthStart = 0,
  monthEnd = 11
) {
  const dates = overrides.slice();

  for (let monthIndex = monthStart; monthIndex <= monthEnd; monthIndex += 1) {
    dates.push(getFirstBusinessDayOnOrAfter(year, monthIndex, startDay));
  }

  return [...new Set(dates)].sort();
}

function sortEvents(events: CalendarEvent[]) {
  return events.slice().sort((left, right) => {
    return (
      left.date.localeCompare(right.date) ||
      (right.importance === "high" ? 1 : right.importance === "medium" ? 0 : -1) -
        (left.importance === "high" ? 1 : left.importance === "medium" ? 0 : -1) ||
      left.timeLabel.localeCompare(right.timeLabel) ||
      left.title.localeCompare(right.title)
    );
  });
}

function resolveIndicatorValues(date: string, indicatorSlug?: string, overrides?: EventValueFields) {
  const baseValues = {
    actual: overrides?.actual,
    forecast: overrides?.forecast,
    previous: overrides?.previous,
    revisedPrevious: overrides?.revisedPrevious
  };

  if (!indicatorSlug) {
    return baseValues;
  }

  const indicator = indicatorBySlug.get(indicatorSlug);
  const snapshot = snapshotByKey.get(`${indicatorSlug}:${date}`);

  if (!indicator || !snapshot) {
    return baseValues;
  }

  return {
    actual: baseValues.actual ?? formatIndicatorValue(indicator.currentValue, indicator.unit),
    forecast:
      baseValues.forecast ??
      (typeof snapshot.consensusValue === "number" ? formatIndicatorValue(snapshot.consensusValue, indicator.unit) : undefined),
    previous:
      baseValues.previous ??
      (typeof snapshot.revisedFrom === "number"
        ? formatIndicatorValue(snapshot.revisedFrom, indicator.unit)
        : formatIndicatorValue(indicator.priorValue, indicator.unit)),
    revisedPrevious:
      baseValues.revisedPrevious ??
      (typeof snapshot.revisedTo === "number" ? formatIndicatorValue(snapshot.revisedTo, indicator.unit) : undefined)
  };
}

function inferStatus(date: string, values: EventValueFields, override?: CalendarEventStatus) {
  if (override) {
    return override;
  }

  const today = getEasternToday();

  if (date > today) {
    return "scheduled";
  }

  if (date === today && !values.actual) {
    return "scheduled";
  }

  if (values.revisedPrevious) {
    return "revised";
  }

  return "released";
}

function makeEvent(seed: EventSeed): CalendarEvent {
  const values = resolveIndicatorValues(seed.date, seed.indicatorSlug, seed.values);
  const status = inferStatus(seed.date, values, seed.status);

  return {
    id: seed.id,
    title: seed.title,
    date: seed.date,
    timeLabel: seed.timeLabel,
    timezone: DEFAULT_TIMEZONE,
    country: DEFAULT_COUNTRY,
    category: seed.category,
    importance: seed.importance,
    sourceName: seed.source.name,
    sourceUrl: seed.source.url,
    status,
    actual: values.actual,
    forecast: values.forecast,
    previous: values.previous,
    revisedPrevious: values.revisedPrevious,
    whyItMatters: seed.whyItMatters,
    whatToConfirmNext: seed.whatToConfirmNext,
    whatToWatch: seed.whatToConfirmNext,
    ...seed.module,
    ...seed.flow
  };
}

function makeRecurringEvents(
  idPrefix: string,
  title: string,
  dates: string[],
  options: Omit<EventSeed, "id" | "title" | "date">
) {
  return dates.map((date) =>
    makeEvent({
      ...options,
      id: `${idPrefix}-${date}`,
      title,
      date
    })
  );
}

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
  "2026-09-11",
  "2026-10-14",
  "2026-11-10",
  "2026-12-10"
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
  "2026-09-10",
  "2026-10-15",
  "2026-11-13",
  "2026-12-15"
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
  "2026-05-14",
  ...buildMonthlyDates(ACTIVE_YEAR, 15, [], 5, 11)
];

const housingReleaseDates = [
  "2026-01-09",
  "2026-02-18",
  "2026-03-12",
  "2026-03-17",
  "2026-04-17",
  "2026-05-19",
  ...buildMonthlyDates(ACTIVE_YEAR, 18, [], 5, 11)
];

const durableGoodsReleaseDates = [
  "2026-01-26",
  "2026-02-18",
  "2026-03-13",
  "2026-03-25",
  "2026-04-24",
  "2026-05-28",
  ...buildMonthlyDates(ACTIVE_YEAR, 25, [], 5, 11)
];

const newHomeSalesDates = buildMonthlyDates(ACTIVE_YEAR, 24);

const importExportPriceDates = buildMonthlyDates(ACTIVE_YEAR, 16, ["2026-01-16", "2026-02-18", "2026-03-17"], 3, 11);

const factoryOrdersDates = ["2026-01-07", ...buildMonthlyDates(ACTIVE_YEAR, 3, [], 1, 11)];

const constructionSpendingDates = Array.from({ length: 12 }, (_, monthIndex) =>
  getFirstBusinessDayOnOrAfter(ACTIVE_YEAR, monthIndex, 1)
);

const wholesaleTradeDates = [
  "2026-01-08",
  "2026-01-29",
  "2026-02-24",
  "2026-03-19",
  "2026-04-09",
  "2026-05-08",
  "2026-06-09",
  ...buildMonthlyDates(ACTIVE_YEAR, 9, [], 6, 11)
];

const advanceEconomicIndicatorDates = [
  "2026-02-19",
  "2026-04-29",
  "2026-05-29",
  "2026-06-26",
  "2026-07-28",
  "2026-08-27",
  "2026-09-30",
  "2026-10-28",
  "2026-11-27",
  "2026-12-28"
];

const internationalTradeDates = [
  "2026-01-08",
  "2026-01-29",
  "2026-02-19",
  "2026-03-12",
  "2026-04-02",
  "2026-05-05",
  "2026-06-09",
  "2026-07-07",
  "2026-08-04",
  "2026-09-03",
  "2026-10-06",
  "2026-11-04",
  "2026-12-08"
];

const fomcMeetingSeeds = [
  { date: "2026-01-28", title: "FOMC Rate Decision (Jan)" },
  { date: "2026-03-18", title: "FOMC Rate Decision (Mar)" },
  { date: "2026-04-29", title: "FOMC Rate Decision (Apr)" },
  { date: "2026-06-17", title: "FOMC Rate Decision (Jun)" },
  { date: "2026-07-29", title: "FOMC Rate Decision (Jul)" },
  { date: "2026-09-16", title: "FOMC Rate Decision (Sep)" },
  { date: "2026-11-04", title: "FOMC Rate Decision (Nov)" },
  { date: "2026-12-09", title: "FOMC Rate Decision (Dec)" }
];

const fomcMinuteSeeds = [
  { date: "2026-01-07", title: "FOMC Minutes (Dec 2025 Meeting)" },
  { date: "2026-02-18", title: "FOMC Minutes (Jan Meeting)" },
  { date: "2026-04-08", title: "FOMC Minutes (Mar Meeting)" },
  { date: "2026-05-20", title: "FOMC Minutes (Apr Meeting)" },
  { date: "2026-07-08", title: "FOMC Minutes (Jun Meeting)" },
  { date: "2026-08-19", title: "FOMC Minutes (Jul Meeting)" },
  { date: "2026-10-07", title: "FOMC Minutes (Sep Meeting)" },
  { date: "2026-11-18", title: "FOMC Minutes (Nov Meeting)" },
  { date: "2026-12-30", title: "FOMC Minutes (Dec Meeting)" }
];

const sepMeetingSeeds = [
  { date: "2026-03-18", title: "SEP / Dot Plot Update (Mar FOMC)" },
  { date: "2026-06-17", title: "SEP / Dot Plot Update (Jun FOMC)" },
  { date: "2026-09-16", title: "SEP / Dot Plot Update (Sep FOMC)" },
  { date: "2026-12-09", title: "SEP / Dot Plot Update (Dec FOMC)" }
];

const beigeBookDates = [
  "2026-01-14",
  "2026-03-04",
  "2026-04-15",
  "2026-06-03",
  "2026-07-15",
  "2026-09-02",
  "2026-10-21",
  "2026-12-02"
];

const gdpReleaseSeeds = [
  { date: "2026-03-13", title: "GDP Second Estimate (Q4 2025)" },
  { date: "2026-04-09", title: "GDP Third Estimate (Q4 2025)" },
  { date: "2026-04-30", title: "GDP Advance Estimate (Q1 2026)" },
  { date: "2026-05-28", title: "GDP Second Estimate (Q1 2026)" },
  { date: "2026-07-30", title: "GDP Advance Estimate (Q2 2026)" },
  { date: "2026-08-27", title: "GDP Second Estimate (Q2 2026)" },
  { date: "2026-09-30", title: "GDP Third Estimate (Q2 2026)" },
  { date: "2026-10-29", title: "GDP Advance Estimate (Q3 2026)" },
  { date: "2026-11-25", title: "GDP Second Estimate (Q3 2026)" },
  { date: "2026-12-23", title: "GDP Third Estimate (Q3 2026)" }
];

const ismManufacturingDates = buildIsmReleaseDates("manufacturing", ACTIVE_YEAR);
const ismServicesDates = buildIsmReleaseDates("services", ACTIVE_YEAR);
const joltsDates = Array.from({ length: 12 }, (_, monthIndex) =>
  monthIndex === 0 ? "2026-01-07" : getNthWeekdayOfMonth(ACTIVE_YEAR, monthIndex, 2, 1)
);
const consumerCreditDates = buildMonthlyDates(ACTIVE_YEAR, 6);
const consumerConfidenceDates = Array.from({ length: 12 }, (_, monthIndex) =>
  getLastWeekdayOfMonth(ACTIVE_YEAR, monthIndex, 2)
);
const eciDates = ["2026-01-30", "2026-04-30", "2026-07-31", "2026-10-30"];
const productivityDates = ["2026-03-05", "2026-06-04", "2026-09-03", "2026-11-05"];
const sloosDates = ["2026-02-02", "2026-05-04", "2026-08-03", "2026-11-02"];
const z1Dates = ["2026-03-12", "2026-06-11", "2026-09-10", "2026-12-10"];
const treasury3yAuctionDates = Array.from({ length: 12 }, (_, monthIndex) =>
  getNthWeekdayOfMonth(ACTIVE_YEAR, monthIndex, 2, 2)
);
const treasury10yAuctionDates = Array.from({ length: 12 }, (_, monthIndex) =>
  getNthWeekdayOfMonth(ACTIVE_YEAR, monthIndex, 3, 2)
);
const treasury30yAuctionDates = Array.from({ length: 12 }, (_, monthIndex) =>
  getNthWeekdayOfMonth(ACTIVE_YEAR, monthIndex, 4, 2)
);

const policyWhy =
  "Fed communication can move the entire discount-rate stack, so even a small language shift can reprice rates, credit, and duration-sensitive equities.";
const policyConfirm =
  "Check the 2Y, real yields, SOFR-implied cuts, and HY spreads before treating the Fed read as a broader regime change.";

const inflationWhy =
  "Inflation releases reset the policy path faster than most macro prints, especially when the front end and real yields react at the same time.";
const inflationConfirm =
  "Split headline from core, then confirm the move in the 2Y, breakevens, and the next market-implied Fed path.";

const laborWhy =
  "Labor releases still carry the most concentrated read on growth, wages, and recession risk in a single print.";
const laborConfirm =
  "Check unemployment, wages, hours, and claims before deciding whether the print reflects a benign cooldown or a real crack.";

const growthWhy =
  "Growth releases matter most when they confirm or reject the soft-landing path that markets are already pricing.";
const growthConfirm =
  "Confirm with ISM internals, payrolls, the 10Y, and cyclicals before calling a broader growth turn.";

export const calendarEvents = sortEvents([
  ...fomcMeetingSeeds.map((seed) =>
    makeEvent({
      ...seed,
      id: `fomc-meeting-${seed.date}`,
      timeLabel: "2:00 PM ET",
      category: "central bank",
      importance: "high",
      module: modules.policy,
      flow: flows.rates,
      source: sources.fomcSchedule,
      whyItMatters: policyWhy,
      whatToConfirmNext: policyConfirm
    })
  ),
  ...fomcMinuteSeeds.map((seed) =>
    makeEvent({
      ...seed,
      id: `fomc-minutes-${seed.date}`,
      timeLabel: "2:00 PM ET",
      category: "central bank",
      importance: "high",
      module: modules.policy,
      flow: flows.rates,
      source: sources.fedCalendar,
      whyItMatters:
        "Minutes show whether the statement understated or overstated the real balance of risks inside the Fed.",
      whatToConfirmNext: policyConfirm
    })
  ),
  ...sepMeetingSeeds.map((seed) =>
    makeEvent({
      ...seed,
      id: `sep-marker-${seed.date}`,
      timeLabel: "2:00 PM ET",
      category: "central bank",
      importance: "high",
      module: modules.policy,
      flow: flows.rates,
      source: sources.fomcSchedule,
      whyItMatters:
        "SEP meetings matter because the dot plot and projections can re-anchor terminal-rate pricing in one afternoon.",
      whatToConfirmNext:
        "Check the 2Y, terminal rate pricing, real yields, and the curve before deciding whether the SEP changed the real policy path."
    })
  ),
  ...makeRecurringEvents("beige-book", "Beige Book", beigeBookDates, {
    timeLabel: "2:00 PM ET",
    category: "central bank",
    importance: "medium",
    module: modules.policy,
    flow: flows.growth,
    source: sources.fedCalendar,
    whyItMatters:
      "The Beige Book gives a qualitative read on regional activity, labor tightness, pricing power, and business caution ahead of the next Fed meeting.",
    whatToConfirmNext:
      "Check ISM, payrolls, claims, and credit to see whether anecdotes are showing up in the hard data."
  }),
  ...makeRecurringEvents("cpi", "Consumer Price Index (CPI)", cpiReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.inflation,
    flow: flows.inflation,
    source: sources.blsCpi,
    indicatorSlug: "cpi-headline",
    whyItMatters: inflationWhy,
    whatToConfirmNext: inflationConfirm
  }),
  ...makeRecurringEvents("ppi", "Producer Price Index (PPI)", ppiReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.inflation,
    flow: flows.inflation,
    source: sources.blsPpi,
    indicatorSlug: "ppi-final-demand",
    whyItMatters:
      "PPI is the fastest official read on pipeline inflation and often shapes expectations for the next Core PCE print.",
    whatToConfirmNext:
      "Check Core PCE expectations, the 2Y, and commodity-sensitive inflation inputs before treating producer pressure as consumer inflation persistence."
  }),
  ...makeRecurringEvents("employment-situation", "Employment Situation / Nonfarm Payrolls", employmentSituationDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.labor,
    flow: flows.labor,
    source: sources.blsEmployment,
    indicatorSlug: "nonfarm-payrolls",
    whyItMatters: laborWhy,
    whatToConfirmNext: laborConfirm
  }),
  ...makeRecurringEvents("jolts", "JOLTS Job Openings", joltsDates, {
    timeLabel: "10:00 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.labor,
    flow: flows.claims,
    source: sources.blsJolts,
    whyItMatters:
      "JOLTS helps gauge whether labor demand is fading slowly or rolling over fast enough to pressure hiring and wages.",
    whatToConfirmNext:
      "Check payrolls, unemployment, quits, claims, and HY spreads before treating a openings drop as a decisive labor turn."
  }),
  ...gdpReleaseSeeds.map((seed) =>
    makeEvent({
      ...seed,
      id: `gdp-${seed.date}`,
      timeLabel: "8:30 AM ET",
      category: "macro release",
      importance: "high",
      module: modules.growth,
      flow: flows.growth,
      source: sources.beaSchedule,
      whyItMatters:
        "GDP estimates reset the hard-data growth backdrop and matter most when they reinforce or challenge the softer-landing story.",
      whatToConfirmNext:
        "Check ISM, payrolls, retail sales, and the 10Y before deciding whether the GDP revision changes the broader macro path."
    })
  ),
  ...makeRecurringEvents("core-pce", "Personal Income & Outlays / Core PCE", pioReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.inflation,
    flow: flows.inflation,
    source: sources.beaSchedule,
    indicatorSlug: "core-pce",
    whyItMatters:
      "Core PCE is the inflation gauge most closely tied to the Fed reaction function and medium-term easing expectations.",
    whatToConfirmNext:
      "Check the monthly core pace, revisions, and services ex housing, then confirm the move in the 2Y and real yields."
  }),
  ...makeRecurringEvents("retail-sales", "Retail Sales", retailSalesReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusRetail,
    indicatorSlug: "retail-sales",
    whyItMatters:
      "Retail sales are the cleanest scheduled check on whether the consumer is still validating the soft-landing growth story.",
    whatToConfirmNext:
      "Check the control group, revisions, 10Y yields, and consumer-sensitive cyclicals before calling a real demand turn."
  }),
  ...makeRecurringEvents("durable-goods", "Durable Goods Orders", durableGoodsReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusDurableGoods,
    indicatorSlug: "durable-goods",
    whyItMatters:
      "Durable goods orders show whether factory demand is holding up beyond surveys and whether capex appetite is broadening.",
    whatToConfirmNext:
      "Check ex-transportation orders, industrial production, ISM new orders, and the 10Y before calling a broader industrial turn."
  }),
  ...makeRecurringEvents("ism-manufacturing", "ISM Manufacturing PMI", ismManufacturingDates, {
    timeLabel: "10:00 AM ET",
    category: "survey",
    importance: "high",
    module: modules.growth,
    flow: flows.growth,
    source: sources.ismManufacturing,
    indicatorSlug: "ism-manufacturing",
    whyItMatters: growthWhy,
    whatToConfirmNext: growthConfirm
  }),
  ...makeRecurringEvents("ism-services", "ISM Services PMI", ismServicesDates, {
    timeLabel: "10:00 AM ET",
    category: "survey",
    importance: "high",
    module: modules.growth,
    flow: flows.growth,
    indicatorSlug: "ism-services",
    source: sources.ismServices,
    whyItMatters:
      "Services PMI matters because it sits closest to the part of the economy carrying the soft-landing story.",
    whatToConfirmNext:
      "Check business activity, employment, prices paid, retail sales, and the 10Y before treating the services signal as a regime shift."
  }),
  ...makeRecurringEvents("industrial-production", "Industrial Production", g17ReleaseDates, {
    timeLabel: "9:15 AM ET",
    category: "macro release",
    importance: "high",
    module: modules.growth,
    flow: flows.growth,
    source: sources.fedCalendar,
    indicatorSlug: "industrial-production",
    whyItMatters:
      "Industrial production tells you whether survey optimism is translating into actual output and factory utilization.",
    whatToConfirmNext:
      "Check ISM, durable goods, energy-sensitive sectors, and the 10Y before treating one production print as a durable growth turn."
  }),
  ...makeRecurringEvents("housing-starts", "Housing Starts / Building Permits", housingReleaseDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusHousing,
    indicatorSlug: "housing-starts",
    whyItMatters:
      "Housing reacts quickly to financing conditions, so starts and permits tell you whether lower or higher rates are reaching the real economy.",
    whatToConfirmNext:
      "Check building permits, mortgage rates, homebuilder sentiment, and the 10Y before turning one housing print into a broad growth call."
  }),
  ...makeRecurringEvents("new-home-sales", "New Home Sales", newHomeSalesDates, {
    timeLabel: "10:00 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusHousing,
    whyItMatters:
      "New home sales are one of the cleanest housing demand reads and help confirm whether financing pressure is really easing or tightening.",
    whatToConfirmNext:
      "Check mortgage rates, housing starts, permits, and homebuilder equities before deciding whether housing is stabilizing."
  }),
  ...makeRecurringEvents("treasury-3y", "Treasury 3Y Auction", treasury3yAuctionDates, {
    timeLabel: "1:00 PM ET",
    category: "auction",
    importance: "medium",
    module: modules.rates,
    flow: flows.rates,
    source: sources.treasuryAuctions,
    whyItMatters:
      "3Y auction demand is a quick check on front-end duration appetite and how comfortable the market is with the near-term policy path.",
    whatToConfirmNext:
      "Check the auction tail, bid-to-cover, the 2Y, and SOFR-implied cuts before treating one result as a bigger policy signal."
  }),
  ...makeRecurringEvents("treasury-10y", "Treasury 10Y Auction", treasury10yAuctionDates, {
    timeLabel: "1:00 PM ET",
    category: "auction",
    importance: "high",
    module: modules.rates,
    flow: flows.rates,
    source: sources.treasuryAuctions,
    whyItMatters:
      "The 10Y auction sits at the center of term premium, mortgage transmission, and equity discount-rate pressure.",
    whatToConfirmNext:
      "Check the auction tail, indirect bidders, the 10Y cash yield, mortgage rates, and equity duration-sensitive sectors."
  }),
  ...makeRecurringEvents("treasury-30y", "Treasury 30Y Auction", treasury30yAuctionDates, {
    timeLabel: "1:00 PM ET",
    category: "auction",
    importance: "medium",
    module: modules.rates,
    flow: flows.rates,
    source: sources.treasuryAuctions,
    whyItMatters:
      "30Y auction demand is the cleanest monthly check on long-end duration appetite and pension-heavy demand.",
    whatToConfirmNext:
      "Check the long bond, mortgage-sensitive assets, and the 2s10s/10s30s curves before reading through to a larger duration view."
  }),
  ...makeRecurringEvents("import-export-prices", "Import / Export Prices", importExportPriceDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.inflation,
    flow: flows.inflation,
    source: sources.blsTradePrices,
    whyItMatters:
      "Trade-price data is an early read on pipeline inflation, dollar pass-through, and goods disinflation durability.",
    whatToConfirmNext:
      "Check the dollar, PPI, commodity moves, and goods-heavy CPI categories before deciding whether import pressure is returning."
  }),
  ...makeRecurringEvents("consumer-credit", "Consumer Credit", consumerCreditDates, {
    timeLabel: "3:00 PM ET",
    category: "credit",
    importance: "medium",
    module: modules.liquidity,
    flow: flows.credit,
    source: sources.fedCalendar,
    whyItMatters:
      "Consumer credit shows whether households are still extending spending power through borrowing as financing conditions tighten or ease.",
    whatToConfirmNext:
      "Check retail sales, delinquencies, credit-card stress, and HY spreads before treating one consumer credit print as a demand regime shift."
  }),
  ...makeRecurringEvents("employment-cost-index", "Employment Cost Index (ECI)", eciDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.inflation,
    flow: flows.labor,
    source: sources.blsEci,
    whyItMatters:
      "ECI is one of the cleaner broad wage-cost measures, so it matters when wage stickiness is the last obstacle to full disinflation.",
    whatToConfirmNext:
      "Check average hourly earnings, services inflation, and the 2Y before reading one wage-cost print as a lasting policy signal."
  }),
  ...makeRecurringEvents("productivity", "Productivity and Unit Labor Costs", productivityDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.labor,
    source: sources.blsProductivity,
    whyItMatters:
      "Productivity and unit labor costs help separate wage pressure that is inflationary from wage growth that is being absorbed by better output.",
    whatToConfirmNext:
      "Check ECI, payrolls, margins, and core services inflation before deciding whether labor costs are turning more problematic."
  }),
  ...makeRecurringEvents("construction-spending", "Construction Spending", constructionSpendingDates, {
    timeLabel: "10:00 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusCalendar,
    whyItMatters:
      "Construction spending helps confirm whether public and private investment is broad enough to support the real-economy growth path.",
    whatToConfirmNext:
      "Check nonresidential categories, housing, industrial production, and cyclical equities before calling a broader capex turn."
  }),
  ...makeRecurringEvents("wholesale-inventories", "Wholesale Inventories", wholesaleTradeDates, {
    timeLabel: "10:00 AM ET",
    category: "macro release",
    importance: "low",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusCalendar,
    whyItMatters:
      "Wholesale inventories matter because inventory accumulation can materially change GDP tracking and the near-term factory cycle.",
    whatToConfirmNext:
      "Check factory orders, retail sales, GDP tracking, and industrial production before over-weighting one inventory print."
  }),
  ...makeRecurringEvents("factory-orders", "Factory Orders", factoryOrdersDates, {
    timeLabel: "10:00 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusCalendar,
    whyItMatters:
      "Factory orders confirm whether durable-goods strength is broadening into a more persistent manufacturing demand cycle.",
    whatToConfirmNext:
      "Check durable goods, ISM new orders, industrial production, and 10Y yields before calling a cleaner factory upturn."
  }),
  ...makeRecurringEvents("advance-economic-indicators", "Advance Economic Indicators", advanceEconomicIndicatorDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.censusCalendar,
    whyItMatters:
      "Advance indicators push GDP tracking, especially through trade and inventories, so they can move the nowcast before the headline monthly data lands.",
    whatToConfirmNext:
      "Check wholesale inventories, trade, GDP tracking, and the 10Y before turning one advance report into a bigger growth call."
  }),
  ...makeRecurringEvents("international-trade", "International Trade in Goods and Services", internationalTradeDates, {
    timeLabel: "8:30 AM ET",
    category: "macro release",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.beaSchedule,
    whyItMatters:
      "Trade releases matter because they feed GDP tracking and can signal whether external demand or imports are changing the growth mix.",
    whatToConfirmNext:
      "Check the dollar, advance indicators, GDP tracking, and global growth signals before reading the trade print in isolation."
  }),
  ...makeRecurringEvents("sloos", "Senior Loan Officer Opinion Survey (SLOOS)", sloosDates, {
    timeLabel: "2:00 PM ET",
    category: "credit",
    importance: "medium",
    module: modules.liquidity,
    flow: flows.credit,
    source: sources.fedCalendar,
    whyItMatters:
      "SLOOS is one of the cleanest official reads on whether bank credit availability is easing or tightening for the real economy.",
    whatToConfirmNext:
      "Check bank credit growth, HY spreads, small caps, and claims before treating one SLOOS shift as a full macro regime break."
  }),
  ...makeRecurringEvents("financial-accounts", "Financial Accounts of the U.S. (Z.1)", z1Dates, {
    timeLabel: "12:00 PM ET",
    category: "liquidity",
    importance: "low",
    module: modules.liquidity,
    flow: flows.liquidity,
    source: sources.fedCalendar,
    whyItMatters:
      "Z.1 is the deeper balance-sheet map for household, corporate, and government leverage, useful for checking whether liquidity conditions are improving or deteriorating under the surface.",
    whatToConfirmNext:
      "Check reserves, the TGA, bank credit growth, and spreads before translating a flow-of-funds shift into a shorter-term market call."
  }),
  ...makeRecurringEvents("consumer-confidence", "Conference Board Consumer Confidence", consumerConfidenceDates, {
    timeLabel: "10:00 AM ET",
    category: "survey",
    importance: "medium",
    module: modules.growth,
    flow: flows.growth,
    source: sources.conferenceBoard,
    whyItMatters:
      "Consumer confidence helps judge whether the spending backdrop is stable enough to keep the soft-landing story intact.",
    whatToConfirmNext:
      "Check retail sales, labor data, small-business sentiment, and consumer-sensitive equities before overreacting to the survey mood."
  })
]);
