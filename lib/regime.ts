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
      status: "Growth is firm without looking overheated.",
      description: "Demand is holding up and the cyclical complex is stabilizing."
    };
  }

  if (score >= 0.3) {
    return {
      label: "trend growth",
      status: "Expansion is intact but not surging.",
      description: "Growth is running above stall speed with moderate upside surprises."
    };
  }

  if (score >= -0.3) {
    return {
      label: "late-cycle wobble",
      status: "The growth picture is mixed.",
      description: "Some leading signals are improving, but the cycle still lacks a decisive broadening."
    };
  }

  return {
    label: "growth scare",
    status: "Growth risk is becoming harder to dismiss.",
    description: "Leading indicators are deteriorating and markets would likely price more policy relief."
  };
}

function labelInflation(score: number) {
  if (score <= -0.7) {
    return {
      label: "disinflation",
      status: "Inflation is cooling in a market-friendly way.",
      description: "The broad trend is lower, even though sticky services still need work."
    };
  }

  if (score <= -0.2) {
    return {
      label: "cooling but sticky",
      status: "Inflation is improving, but the last mile is slow.",
      description: "Markets can live with this backdrop as long as growth stays intact."
    };
  }

  if (score <= 0.5) {
    return {
      label: "sticky inflation",
      status: "Progress has stalled.",
      description: "The Fed stays cautious and real-rate pressure can persist."
    };
  }

  return {
    label: "overheating",
    status: "Inflation pressure is rebuilding.",
    description: "Rates and valuation-sensitive assets would likely struggle in this regime."
  };
}

function labelLabor(score: number) {
  if (score >= 0.4) {
    return {
      label: "rebalancing",
      status: "Labor is cooling gracefully.",
      description: "Hiring is still positive while supply is improving and pressure is easing."
    };
  }

  if (score >= -0.2) {
    return {
      label: "tight but easing",
      status: "Labor is no longer overheating, but it is not loose either.",
      description: "This is supportive for a soft landing if wage growth keeps cooling."
    };
  }

  return {
    label: "slackening",
    status: "Labor weakness is becoming visible.",
    description: "A faster deterioration here would shift the entire market regime toward growth fear."
  };
}

function labelLiquidity(score: number) {
  if (score >= 0.4) {
    return {
      label: "liquidity support",
      status: "The plumbing is helping rather than hurting.",
      description: "Rates and balance-sheet forces are no longer tightening aggressively."
    };
  }

  if (score >= -0.2) {
    return {
      label: "neutral liquidity",
      status: "Liquidity is mixed, not hostile.",
      description: "There are offsets between rate relief and balance-sheet or Treasury cash headwinds."
    };
  }

  return {
    label: "liquidity squeeze",
    status: "Financial plumbing is becoming a drag.",
    description: "When liquidity tightens, markets often weaken before the hard data fully reacts."
  };
}

function labelRisk(score: number) {
  if (score >= 0.5) {
    return {
      label: "risk-on",
      status: "Markets are embracing cyclicality and breadth is healthy.",
      description: "Volatility is contained and credit is confirming the constructive tape."
    };
  }

  if (score >= 0) {
    return {
      label: "constructive but crowded",
      status: "Risk appetite is decent, but complacency is building.",
      description: "Participation is better, though crowding deserves monitoring."
    };
  }

  return {
    label: "defensive",
    status: "Markets are becoming more selective.",
    description: "Credit and internals would need to improve before chasing beta."
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
      description: growthState.description,
      drivers: topDrivers(groups.growth)
    },
    {
      id: "inflation",
      title: "Inflation",
      score: inflationScore,
      label: inflationState.label,
      status: inflationState.status,
      description: inflationState.description,
      drivers: topDrivers(groups.inflation)
    },
    {
      id: "labor",
      title: "Labor",
      score: laborScore,
      label: laborState.label,
      status: laborState.status,
      description: laborState.description,
      drivers: topDrivers(groups.labor)
    },
    {
      id: "liquidity",
      title: "Liquidity",
      score: liquidityScore,
      label: liquidityState.label,
      status: liquidityState.status,
      description: liquidityState.description,
      drivers: topDrivers(groups.liquidity)
    },
    {
      id: "risk-appetite",
      title: "Risk Appetite",
      score: riskScore,
      label: riskState.label,
      status: riskState.status,
      description: riskState.description,
      drivers: topDrivers(groups["risk-appetite"])
    }
  ];
}

export const defaultRegimeSnapshot: RegimeSnapshot = {
  title: "Soft landing with disinflation bias",
  summary:
    "The dashboard currently leans constructive: growth is stable, inflation is easing, labor is rebalancing, and liquidity is mixed rather than outright hostile.",
  labels: ["disinflation", "soft landing", "rebalancing labor", "constructive risk appetite"],
  watchItems: [
    "Supercore needs to keep cooling for clean Fed easing.",
    "TGA rebuilding is the main near-term liquidity headwind.",
    "Crowding is rising, so better breadth matters."
  ]
};
