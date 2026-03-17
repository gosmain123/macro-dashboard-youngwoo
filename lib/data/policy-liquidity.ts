import { buildIndicators, liquidityTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "fed-funds-upper",
    name: "Fed Funds Upper Bound",
    shortName: "Fed Funds",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 4.75,
    priorValue: 5,
    unit: "%",
    frequency: "Live",
    source: {
      name: "Federal Reserve via FRED",
      url: "https://fred.stlouisfed.org/series/DFEDTARU",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "The upper bound of the federal funds target range is the main US policy rate.",
      "Use policy rate changes as the clearest signal of central bank intent. The level matters, but the path and messaging matter more for markets.",
      "Watch dot plots, inflation progress, and labor slack for the next cut or pause."
    ),
    regimeTag: "gradual easing",
    summary: "Policy is still restrictive, but the direction is less hostile than before.",
    advancedSummary:
      "Markets care most about where the terminal and neutral assumptions shift, not just one meeting outcome.",
    watchList: ["Core PCE", "Payroll trend", "Fed language"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "After each FOMC meeting",
    provider: { type: "fred", seriesId: "DFEDTARU" },
    trendSlope: -0.02,
    volatility: 0.01,
    minValue: 0,
    searchTerms: ["policy rate", "fomc", "fed target range"]
  },
  {
    slug: "fed-balance-sheet",
    name: "Fed Balance Sheet",
    shortName: "Fed BS",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 7.12,
    priorValue: 7.18,
    unit: "$tn",
    frequency: "Weekly",
    source: {
      name: "Federal Reserve via FRED",
      url: "https://fred.stlouisfed.org/series/WALCL",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "The Fed balance sheet captures the size of assets the central bank is holding.",
      "Use it to judge whether quantitative tightening or easing is adding or draining system liquidity over time.",
      "Watch QT pace changes, reserves, and Treasury cash movements because balance sheet size alone is incomplete."
    ),
    regimeTag: "QT still active",
    summary: "Liquidity is no longer abundant, but the drain is manageable.",
    advancedSummary:
      "Balance sheet runoff matters most when reserves are scarce or credit spreads are already widening.",
    watchList: ["Bank reserves", "TGA", "Repo market stress"],
    signalScore: -0.3,
    tone: "neutral",
    releaseCadence: "Weekly, Thursdays",
    provider: { type: "fred", seriesId: "WALCL" },
    trendSlope: -0.01,
    volatility: 0.01,
    minValue: 3,
    searchTerms: ["quantitative tightening", "walcl"]
  },
  {
    slug: "rrp-balance",
    name: "Overnight Reverse Repo",
    shortName: "RRP",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 0.24,
    priorValue: 0.29,
    unit: "$tn",
    frequency: "Daily",
    source: {
      name: "New York Fed via FRED",
      url: "https://fred.stlouisfed.org/series/RRPONTSYD",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "The reverse repo facility shows how much cash money funds are parking at the Fed overnight.",
      "Use it as a liquidity buffer gauge. Falling RRP can temporarily cushion QT because cash is moving back into the market.",
      "Watch reserves and bill issuance once the RRP cushion gets small."
    ),
    regimeTag: "buffer shrinking",
    summary: "The system still has a buffer, but it is getting thinner.",
    advancedSummary:
      "Markets stop ignoring QT when the RRP offset fades and reserves become the marginal absorber.",
    watchList: ["Reserves", "Bill supply", "Repo rates"],
    signalScore: 0.2,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "RRPONTSYD" },
    trendSlope: -0.01,
    volatility: 0.01,
    minValue: 0,
    searchTerms: ["reverse repo", "money funds", "rrp"]
  },
  {
    slug: "tga-balance",
    name: "Treasury General Account",
    shortName: "TGA",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 0.72,
    priorValue: 0.65,
    unit: "$tn",
    frequency: "Daily",
    source: {
      name: "Treasury via FRED",
      url: "https://fred.stlouisfed.org/series/WTREGEN",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "The Treasury General Account is the US government's cash balance at the Fed.",
      "Use it because Treasury cash rebuilding usually drains liquidity, while spending it injects liquidity back into markets.",
      "Watch debt issuance and tax dates because they swing the TGA quickly."
    ),
    regimeTag: "short-term drain",
    summary: "Treasury cash rebuilding is a mild liquidity headwind right now.",
    advancedSummary:
      "TGA swings can dominate weekly liquidity changes even when the policy narrative is unchanged.",
    watchList: ["Auction size", "Tax dates", "Net liquidity"],
    signalScore: -0.3,
    tone: "negative",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "WTREGEN" },
    trendSlope: 0.01,
    volatility: 0.02,
    minValue: 0.05,
    searchTerms: ["treasury cash", "government account"]
  },
  {
    slug: "net-liquidity",
    name: "Net Liquidity",
    shortName: "Net Liquidity",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 6.16,
    priorValue: 6.24,
    unit: "$tn",
    frequency: "Daily",
    source: {
      name: "Derived Fed-TGA-RRP model",
      access: "licensed-manual"
    },
    tooltips: liquidityTooltip(
      "Net liquidity is a practical framework that combines the Fed balance sheet, TGA, and RRP into one market-usable signal.",
      "Use it to track the aggregate liquidity impulse hitting risk assets. Rising net liquidity tends to support beta and duration, while falling liquidity makes leadership narrower.",
      "Watch whether reserves and credit spreads confirm the move."
    ),
    regimeTag: "slight squeeze",
    summary: "The liquidity pulse has softened even though it is not in crisis territory.",
    advancedSummary:
      "This framework is useful because it captures plumbing changes that the headline policy rate misses.",
    watchList: ["TGA direction", "RRP floor", "Credit spreads"],
    signalScore: -0.2,
    tone: "neutral",
    releaseCadence: "Daily, model-driven",
    provider: { type: "manual" },
    trendSlope: -0.01,
    volatility: 0.01,
    minValue: 3,
    searchTerms: ["liquidity impulse", "fed minus tga rrp"]
  },
  {
    slug: "financial-conditions-index",
    name: "Financial Conditions Index",
    shortName: "FCI",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: -0.34,
    priorValue: -0.28,
    unit: "index",
    frequency: "Weekly",
    source: {
      name: "Chicago Fed via FRED",
      url: "https://fred.stlouisfed.org/series/NFCI",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "A financial conditions index combines rates, spreads, the dollar, and equity signals into one ease-or-tightness measure.",
      "Use it to see the market's macro operating environment. Easier conditions support growth, but can also slow disinflation if they ease too much.",
      "Watch the dollar, credit spreads, and rate volatility inside the index."
    ),
    regimeTag: "not restrictive enough to break growth",
    summary: "Conditions are not easy, but they are far from stress territory.",
    advancedSummary:
      "What matters is the direction and speed of tightening, especially when growth is already decelerating.",
    watchList: ["HY spreads", "DXY", "MOVE"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Weekly",
    provider: { type: "fred", seriesId: "NFCI" },
    trendSlope: -0.01,
    volatility: 0.01,
    minValue: -2,
    searchTerms: ["financial conditions", "fci"]
  }
];

export const policyLiquidityIndicators = buildIndicators(blueprints);
