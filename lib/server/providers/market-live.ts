export function formatChartAxisDate(
  value: string,
  frequency: Frequency,
  rangeId: ChartRangeId
) {
  const bucket = getChartFrequencyBucket(frequency);

  if (bucket === "intraday") {
    if (rangeId === "1H" || rangeId === "4H" || rangeId === "1D") {
      return shortAxisFormat(value, "HH:mm");
    }

    if (rangeId === "5D" || rangeId === "1M" || rangeId === "3M") {
      return longAxisFormat(value, "MMM d");
    }

    if (rangeId === "6M" || rangeId === "1Y" || rangeId === "3Y" || rangeId === "5Y") {
      return longAxisFormat(value, "MMM ''yy");
    }

    return longAxisFormat(value, "yyyy");
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
