import { getChartHistoryPointTarget } from "@/lib/chart-frequency";
import { getIndicatorRelease } from "@/lib/release-metadata";
import type { Frequency, IndicatorTooltip, MacroIndicator } from "@/types/macro";

export type IndicatorBlueprint = Omit<
  MacroIndicator,
  | "change"
  | "chartHistory"
  | "searchTerms"
  | "lastUpdated"
  | "updatedAt"
  | "nextReleaseAt"
  | "freshnessAgeMinutes"
  | "dataStatus"
  | "status"
  | "freshnessStatus"
  | "lastSuccessfulFetch"
  | "lastFailedFetch"
  | "fallbackUsageReason"
  | "errorMessage"
  | "release"
  | "unitLabel"
> & {
  unitLabel?: string;
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

function seedNoise(slug: string, index: number) {
  const seed = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (((seed + index * 19) % 11) - 5) / 10;
}

function roundValue(value: number, unit: string) {
  if (unit === "k" || unit === "pts" || unit === "bps") {
    return Math.round(value);
  }

  if (unit === "usd" || unit === "usd/oz") {
    return Number(value.toFixed(1));
  }

  if (unit === "x") {
    return Number(value.toFixed(4));
  }

  if (unit === "$tn" || unit === "m" || unit === "hours") {
    return Number(value.toFixed(2));
  }

  return Number(value.toFixed(1));
}

function inferUnitLabel(unit: string) {
  if (unit === "%") {
    return "Percent";
  }

  if (unit === "bps") {
    return "bps";
  }

  if (unit === "index" || unit === "pts") {
    return "Index level";
  }

  if (unit === "k") {
    return "Thousands";
  }

  if (unit === "m") {
    return "Millions";
  }

  if (unit === "$tn") {
    return "$ trillions";
  }

  if (unit === "$bn") {
    return "$ billions";
  }

  if (unit === "hours") {
    return "Hours";
  }

  if (unit === "x") {
    return "Ratio";
  }

  if (unit === "usd") {
    return "Daily close";
  }

  if (unit === "usd/oz") {
    return "USD per ounce";
  }

  return unit;
}

export function buildIndicators(blueprints: IndicatorBlueprint[]): MacroIndicator[] {
  return blueprints.map((blueprint) => {
    const count = getChartHistoryPointTarget(blueprint.frequency);
    const points = [];
    const trendWindow =
      blueprint.frequency === "Daily" || blueprint.frequency === "Live"
        ? 30
        : blueprint.frequency === "Weekly"
          ? 26
          : blueprint.frequency === "Quarterly"
            ? 12
            : 24;
    const effectiveSlope = blueprint.trendSlope * Math.min(1, trendWindow / count);
    const startValue = blueprint.priorValue - effectiveSlope * (count - 3);

    for (let index = 0; index < count - 2; index += 1) {
      const rawValue =
        startValue + effectiveSlope * index + seedNoise(blueprint.slug, index) * blueprint.volatility;
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

    const lastObservationDate = points.at(-1)?.date ?? referenceDate.toISOString().slice(0, 10);

    return {
      ...blueprint,
      change: Number((blueprint.currentValue - blueprint.priorValue).toFixed(2)),
      chartHistory: points,
      unitLabel: blueprint.unitLabel ?? inferUnitLabel(blueprint.unit),
      lastUpdated: `${lastObservationDate}T00:00:00Z`,
      updatedAt: `${lastObservationDate}T00:00:00Z`,
      nextReleaseAt: undefined,
      freshnessAgeMinutes: 0,
      dataStatus: "fallback",
      status: "fallback",
      freshnessStatus: "stale",
      lastSuccessfulFetch: undefined,
      lastFailedFetch: undefined,
      fallbackUsageReason: "Seed/manual fallback value.",
      errorMessage: undefined,
      release: getIndicatorRelease(blueprint.slug, blueprint.frequency, blueprint.releaseCadence),
      searchTerms: [blueprint.name, blueprint.shortName, ...(blueprint.searchTerms ?? [])]
    };
  });
}
