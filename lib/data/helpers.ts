import type { Frequency, IndicatorTooltip, MacroIndicator } from "@/types/macro";

export type IndicatorBlueprint = Omit<MacroIndicator, "change" | "chartHistory" | "searchTerms"> & {
  trendSlope: number;
  volatility: number;
  minValue?: number;
  searchTerms?: string[];
};

const referenceDate = new Date("2026-03-17T00:00:00Z");

export function inflationTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Inflation data reshapes Fed expectations, real yields, and the market's comfort with paying high multiples.",
    howToUse,
    whatToWatch
  };
}

export function growthTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Growth data tells markets whether earnings revisions should improve, stabilize, or roll over.",
    howToUse,
    whatToWatch
  };
}

export function laborTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Labor is the bridge between growth and inflation because wage pressure and job security drive spending power.",
    howToUse,
    whatToWatch
  };
}

export function liquidityTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Liquidity changes often hit markets before the economic data visibly turns, especially for duration and speculative assets.",
    howToUse,
    whatToWatch
  };
}

export function ratesTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Rates and credit translate macro conditions into financing costs, valuation pressure, and recession odds.",
    howToUse,
    whatToWatch
  };
}

export function internalsTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Market internals tell you whether price action is healthy underneath the index level or propped up by a narrow group.",
    howToUse,
    whatToWatch
  };
}

export function flowsTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Positioning changes determine how violent the market reaction can be when the macro narrative shifts.",
    howToUse,
    whatToWatch
  };
}

export function globalTooltip(
  definition: string,
  howToUse: string,
  whatToWatch: string
): IndicatorTooltip {
  return {
    definition,
    whyItMatters:
      "Global data confirms whether domestic trends are broad-based or being offset by weakness abroad.",
    howToUse,
    whatToWatch
  };
}

function shiftDate(date: Date, frequency: Frequency, offset: number) {
  const copy = new Date(date.getTime());

  if (frequency === "Daily" || frequency === "Live") {
    copy.setUTCDate(copy.getUTCDate() + offset);
    return copy;
  }

  if (frequency === "Weekly") {
    copy.setUTCDate(copy.getUTCDate() + offset * 7);
    return copy;
  }

  if (frequency === "Monthly") {
    copy.setUTCMonth(copy.getUTCMonth() + offset);
    return copy;
  }

  copy.setUTCMonth(copy.getUTCMonth() + offset * 3);
  return copy;
}

function formatSeriesDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function seriesLength(frequency: Frequency) {
  if (frequency === "Daily" || frequency === "Live") {
    return 24;
  }

  if (frequency === "Weekly") {
    return 20;
  }

  if (frequency === "Quarterly") {
    return 10;
  }

  return 14;
}

function seedNoise(slug: string, index: number) {
  const seed = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (((seed + index * 19) % 11) - 5) / 10;
}

function roundValue(value: number, unit: string) {
  if (unit === "k" || unit === "pts" || unit === "bps") {
    return Math.round(value);
  }

  if (unit === "x") {
    return Number(value.toFixed(4));
  }

  if (unit === "$tn" || unit === "m" || unit === "hours") {
    return Number(value.toFixed(2));
  }

  return Number(value.toFixed(1));
}

export function buildIndicators(blueprints: IndicatorBlueprint[]): MacroIndicator[] {
  return blueprints.map((blueprint) => {
    const count = seriesLength(blueprint.frequency);
    const points = [];
    const startValue = blueprint.priorValue - blueprint.trendSlope * (count - 3);

    for (let index = 0; index < count - 2; index += 1) {
      const rawValue =
        startValue + blueprint.trendSlope * index + seedNoise(blueprint.slug, index) * blueprint.volatility;
      const value =
        blueprint.minValue !== undefined ? Math.max(blueprint.minValue, rawValue) : rawValue;

      points.push({
        date: formatSeriesDate(shiftDate(referenceDate, blueprint.frequency, index - (count - 1))),
        value: roundValue(value, blueprint.unit),
        overlay:
          blueprint.overlays && blueprint.overlays.length > 0
            ? roundValue(value + seedNoise(blueprint.slug, index + 7) * blueprint.volatility * 2, blueprint.unit)
            : undefined
      });
    }

    points.push({
      date: formatSeriesDate(shiftDate(referenceDate, blueprint.frequency, -1)),
      value: roundValue(blueprint.priorValue, blueprint.unit)
    });
    points.push({
      date: formatSeriesDate(referenceDate),
      value: roundValue(blueprint.currentValue, blueprint.unit)
    });

    return {
      ...blueprint,
      change: Number((blueprint.currentValue - blueprint.priorValue).toFixed(2)),
      chartHistory: points,
      searchTerms: [blueprint.name, blueprint.shortName, ...(blueprint.searchTerms ?? [])]
    };
  });
}
