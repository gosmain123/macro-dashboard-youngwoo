import type { MacroIndicator, RegimeCard, RegimeSnapshot } from "@/types/macro";

function topDrivers(indicators: MacroIndicator[]) {
  return indicators
    .slice()
    .sort((left, right) => Math.abs(right.signalScore) - Math.abs(left.signalScore))
    .slice(0, 3)
    .map((indicator) => indicator.shortName);
}

function labelGrowth(score: number) {
  if (score >= 0.8) {
    return {
      label: "soft landing",
      status: "Growth is firm without looking overheated."
    };
  }

  if (score >= 0.3) {
    return {
      label: "trend growth",
      status: "Expansion is intact but not surging."
    };
  }

  if (score >= -0.3) {
    return {
      label: "late-cycle wobble",
      status: "The growth picture is mixed."
    };
  }

  return {
    label: "growth scare",
    status: "Growth risk is becoming harder to dismiss."
  };
}

function labelInflation(score: number) {
  if (score <= -0.7) {
    return {
      label: "disinflation",
      status: "Inflation is cooling in a market-friendly way."
    };
  }

  if (score <= -0.2) {
    return {
      label: "cooling but sticky",
      status: "Inflation is improving, but the last mile is slow."
    };
  }

  if (score <= 0.5) {
    return {
      label: "sticky inflation",
      status: "Progress has stalled."
    };
  }

  return {
    label: "overheating",
    status: "Inflation pressure is rebuilding."
  };
}

function labelLabor(score: number) {
  if (score >= 0.4) {
    return {
      label: "rebalancing",
      status: "Labor is cooling gracefully."
    };
  }

  if (score >= -0.2) {
    return {
      label: "tight but easing",
      status: "Labor is no longer overheating, but it is not loose either."
    };
  }

  return {
    label: "slackening",
    status: "Labor weakness is becoming visible."
  };
}

function labelLiquidity(score: number) {
  if (score >= 0.4) {
    return {
      label: "liquidity support",
      status: "The plumbing is helping rather than hurting."
    };
  }

  if (score >= -0.2) {
    return {
      label: "neutral liquidity",
      status: "Liquidity is mixed, not hostile."
    };
  }

  return {
    label: "liquidity squeeze",
    status: "Financial plumbing is becoming a drag."
  };
}

function labelRisk(score: number) {
  if (score >= 0.5) {
    return {
      label: "risk-on",
      status: "Markets are embracing cyclicality and breadth is healthy."
    };
  }

  if (score >= 0) {
    return {
      label: "constructive but crowded",
      status: "Risk appetite is decent, but complacency is building."
    };
  }

  return {
    label: "defensive",
    status: "Markets are becoming more selective."
  };
}

function averageSignalScore(indicators: MacroIndicator[]) {
  return Number((indicators.reduce((sum, indicator) => sum + indicator.signalScore, 0) / indicators.length).toFixed(1));
}

export function deriveRegimeCards(indicators: MacroIndicator[]): RegimeCard[] {
  const groups = {
    growth: indicators.filter((indicator) => indicator.dimension === "growth"),
    inflation: indicators.filter((indicator) => indicator.dimension === "inflation"),
    labor: indicators.filter((indicator) => indicator.dimension === "labor"),
    liquidity: indicators.filter((indicator) => indicator.dimension === "liquidity"),
    "risk-appetite": indicators.filter((indicator) => indicator.dimension === "risk-appetite")
  } as const;

  const growthScore = averageSignalScore(groups.growth);
  const inflationScore = averageSignalScore(groups.inflation);
  const laborScore = averageSignalScore(groups.labor);
  const liquidityScore = averageSignalScore(groups.liquidity);
  const riskScore = averageSignalScore(groups["risk-appetite"]);

  const growthState = labelGrowth(growthScore);
  const inflationState = labelInflation(inflationScore);
  const laborState = labelLabor(laborScore);
  const liquidityState = labelLiquidity(liquidityScore);
  const riskState = labelRisk(riskScore);

  return [
    {
      id: "growth",
      title: "Growth",
      score: growthScore,
      label: growthState.label,
      status: growthState.status,
      drivers: topDrivers(groups.growth)
    },
    {
      id: "inflation",
      title: "Inflation",
      score: inflationScore,
      label: inflationState.label,
      status: inflationState.status,
      drivers: topDrivers(groups.inflation)
    },
    {
      id: "labor",
      title: "Labor",
      score: laborScore,
      label: laborState.label,
      status: laborState.status,
      drivers: topDrivers(groups.labor)
    },
    {
      id: "liquidity",
      title: "Liquidity",
      score: liquidityScore,
      label: liquidityState.label,
      status: liquidityState.status,
      drivers: topDrivers(groups.liquidity)
    },
    {
      id: "risk-appetite",
      title: "Risk Appetite",
      score: riskScore,
      label: riskState.label,
      status: riskState.status,
      drivers: topDrivers(groups["risk-appetite"])
    }
  ];
}

export const defaultRegimeSnapshot: RegimeSnapshot = {
  title: "Soft landing with disinflation bias",
  summary:
    "Growth is stable, inflation is easing, labor is cooling without cracking, and liquidity is mixed rather than outright hostile."
};
