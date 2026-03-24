import { format, parseISO, subDays, subHours, subMonths, subYears } from "date-fns";

import type { ChartPoint, Frequency } from "@/types/macro";

export type ChartRangeId =
  | "1H"
  | "4H"
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "3Y"
  | "5Y"
  | "10Y"
  | "20Y"
  | "MAX";

type ChartFrequencyBucket = "intraday" | "daily" | "weekly" | "monthly" | "quarterly";

type ChartRangeOption = {
  id: ChartRangeId;
  label: string;
  months?: number;
  years?: number;
  max?: boolean;
};

const chartRangeConfig: Record<
  ChartFrequencyBucket,
  {
    defaultRange: ChartRangeId;
    historyPointTarget: number;
    options: ChartRangeOption[];
  }
> = {
   intraday: {
    defaultRange: "4H",
    historyPointTarget: 390,
    options: [
      { id: "1H", label: "1H" },
      { id: "4H", label: "4H" },
      { id: "1D", label: "1D" },
      { id: "5D", label: "5D" },
      { id: "MAX", label: "MAX", max: true }
    ]
  },
  daily: {
    defaultRange: "3M",
    historyPointTarget: 365 * 20,
    options: [
      { id: "1M", label: "1M", months: 1 },
      { id: "3M", label: "3M", months: 3 },
      { id: "6M", label: "6M", months: 6 },
      { id: "1Y", label: "1Y", years: 1 },
      { id: "3Y", label: "3Y", years: 3 },
      { id: "5Y", label: "5Y", years: 5 },
      { id: "10Y", label: "10Y", years: 10 },
      { id: "20Y", label: "20Y", years: 20 },
      { id: "MAX", label: "MAX", max: true }
    ]
  },
  weekly: {
    defaultRange: "1Y",
    historyPointTarget: 52 * 20,
    options: [
      { id: "3M", label: "3M", months: 3 },
      { id: "6M", label: "6M", months: 6 },
      { id: "1Y", label: "1Y", years: 1 },
      { id: "3Y", label: "3Y", years: 3 },
      { id: "5Y", label: "5Y", years: 5 },
      { id: "10Y", label: "10Y", years: 10 },
      { id: "20Y", label: "20Y", years: 20 },
      { id: "MAX", label: "MAX", max: true }
    ]
  },
  monthly: {
    defaultRange: "3Y",
    historyPointTarget: 12 * 30,
    options: [
      { id: "1Y", label: "1Y", years: 1 },
      { id: "3Y", label: "3Y", years: 3 },
      { id: "5Y", label: "5Y", years: 5 },
      { id: "10Y", label: "10Y", years: 10 },
      { id: "20Y", label: "20Y", years: 20 },
      { id: "MAX", label: "MAX", max: true }
    ]
  },
  quarterly: {
    defaultRange: "5Y",
    historyPointTarget: 4 * 30,
    options: [
      { id: "1Y", label: "1Y", years: 1 },
      { id: "3Y", label: "3Y", years: 3 },
      { id: "5Y", label: "5Y", years: 5 },
      { id: "10Y", label: "10Y", years: 10 },
      { id: "20Y", label: "20Y", years: 20 },
      { id: "MAX", label: "MAX", max: true }
    ]
  }
};

function getChartFrequencyBucket(frequency: Frequency): ChartFrequencyBucket {
  if (frequency === "Intraday") {
    return "intraday";
  }

  if (frequency === "Daily" || frequency === "Live") {
    return "daily";
  }

  if (frequency === "Weekly") {
    return "weekly";
  }

  if (frequency === "Monthly") {
    return "monthly";
  }

  return "quarterly";
}

function getRangeOption(frequency: Frequency, rangeId: ChartRangeId) {
  return chartRangeConfig[getChartFrequencyBucket(frequency)].options.find((option) => option.id === rangeId);
}

function getDateTimestamp(value: string) {
  return parseISO(value).getTime();
}

function shortAxisFormat(value: string, pattern: string) {
  return format(parseISO(value), pattern);
}

function longAxisFormat(value: string, pattern: string) {
  return format(parseISO(value), pattern);
}

export function getDefaultChartRange(frequency: Frequency): ChartRangeId {
  return chartRangeConfig[getChartFrequencyBucket(frequency)].defaultRange;
}

export function getChartRangeOptions(frequency: Frequency) {
  return chartRangeConfig[getChartFrequencyBucket(frequency)].options;
}

export function getChartHistoryPointTarget(frequency: Frequency) {
  return chartRangeConfig[getChartFrequencyBucket(frequency)].historyPointTarget;
}

export function getRequiredObservationLimit(frequency: Frequency, transform: string) {
  const base = getChartHistoryPointTarget(frequency);

  if (transform === "yoy") {
    const bucket = getChartFrequencyBucket(frequency);

    if (bucket === "daily") {
      return base + 366;
    }

    if (bucket === "weekly") {
      return base + 52;
    }

    if (bucket === "quarterly") {
      return base + 4;
    }

    return base + 12;
  }

  if (transform === "mom_pct" || transform === "mom_diff") {
    return base + 1;
  }

  return base;
}

export function getChartDataForRange(
  data: ChartPoint[],
  frequency: Frequency,
  rangeId: ChartRangeId
) {
  if (data.length <= 2 || rangeId === "MAX") {
    return data;
  }

  const latestPoint = data.at(-1);
  const option = getRangeOption(frequency, rangeId);

  if (!latestPoint || !option || option.max) {
    return data;
  }

 const latestDate = parseISO(latestPoint.date);
  const bucket = getChartFrequencyBucket(frequency);

  const cutoffDate =
    bucket === "intraday"
      ? rangeId === "1H"
        ? subHours(latestDate, 1)
        : rangeId === "4H"
          ? subHours(latestDate, 4)
          : rangeId === "1D"
            ? subDays(latestDate, 1)
            : rangeId === "5D"
              ? subDays(latestDate, 5)
              : null
      : option.years !== undefined
        ? subYears(latestDate, option.years)
        : option.months !== undefined
          ? subMonths(latestDate, option.months)
          : null;
  
  if (!cutoffDate) {
    return data;
  }

  const cutoff = cutoffDate.getTime();
  const filtered = data.filter((point) => getDateTimestamp(point.date) >= cutoff);

  return filtered.length >= 2 ? filtered : data;
}

export function formatChartAxisDate(
  value: string,
  frequency: Frequency,
  rangeId: ChartRangeId
) {
  const bucket = getChartFrequencyBucket(frequency);
  if (bucket === "intraday") {
    if (rangeId === "1H" || rangeId === "4H") {
      return shortAxisFormat(value, "HH:mm");
    }

    if (rangeId === "1D") {
      return shortAxisFormat(value, "HH:mm");
    }

    return longAxisFormat(value, "MMM d");
  }
  if (bucket === "daily") {
    if (rangeId === "1M" || rangeId === "3M") {
      return shortAxisFormat(value, "MMM d");
    }

    if (rangeId === "6M" || rangeId === "1Y") {
      return longAxisFormat(value, "MMM yy");
    }

    return longAxisFormat(value, "MMM ''yy");
  }

  if (bucket === "weekly") {
    if (rangeId === "3M" || rangeId === "6M") {
      return shortAxisFormat(value, "MMM d");
    }

    if (rangeId === "1Y") {
      return longAxisFormat(value, "MMM yy");
    }

    return longAxisFormat(value, "MMM ''yy");
  }

  if (bucket === "quarterly") {
    return rangeId === "20Y" ? longAxisFormat(value, "yyyy") : longAxisFormat(value, "QQQ yy");
  }

  if (rangeId === "10Y" || rangeId === "20Y") {
    return longAxisFormat(value, "yyyy");
  }

  return longAxisFormat(value, "MMM yy");
}

export function formatChartTooltipDate(value: string, frequency: Frequency) {
  const bucket = getChartFrequencyBucket(frequency);
  
  if (bucket === "intraday") {
    return format(parseISO(value), "MMM d, HH:mm");
  }
  
  if (bucket === "daily") {
    return format(parseISO(value), "MMM d, yyyy");
  }

  if (bucket === "weekly") {
    return `Week ending ${format(parseISO(value), "MMM d, yyyy")}`;
  }

  if (bucket === "quarterly") {
    return format(parseISO(value), "QQQ yyyy");
  }

  return format(parseISO(value), "MMM yyyy");
}

export function getChartTickMinGap(frequency: Frequency, rangeId: ChartRangeId) {
  const bucket = getChartFrequencyBucket(frequency);

    if (bucket === "intraday") {
    return rangeId === "1H" ? 36 : 28;
  }
  
  if (bucket === "daily") {
    return rangeId === "1M" ? 24 : 30;
  }

  if (bucket === "weekly") {
    return rangeId === "3M" ? 28 : 34;
  }

  return 36;
}

export function getChartLineType(frequency: Frequency) {
  const bucket = getChartFrequencyBucket(frequency);
  return bucket === "daily" ? "monotone" : "linear";
}

export function shouldShowChartDots(frequency: Frequency, pointCount: number) {
  const bucket = getChartFrequencyBucket(frequency);

  if (bucket === "daily") {
    return pointCount <= 40;
  }

  if (bucket === "weekly") {
    return pointCount <= 32;
  }

  return pointCount <= 24;
}

export function getChartFillOpacity(frequency: Frequency) {
  return getChartFrequencyBucket(frequency) === "daily" ? 1 : 0.2;
}
