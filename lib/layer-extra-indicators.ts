import {
  buildIndicators,
  flowsTooltip,
  globalTooltip,
  liquidityTooltip,
  ratesTooltip,
  type IndicatorBlueprint
} from "@/lib/data/helpers";
import type { MacroIndicator } from "@/types/macro";

const liquiditySupplementalBlueprints: IndicatorBlueprint[] = [
  {
    slug: "reserve-balances",
    name: "Reserve Balances",
    shortName: "Reserves",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 3.34,
    priorValue: 3.29,
    unit: "$tn",
    frequency: "Weekly",
    source: {
      name: "Federal Reserve reserve balances",
      url: "https://fred.stlouisfed.org/series/WRESBAL",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "Reserve balances are the cash buffers banks hold at the Fed.",
      "Use them to judge whether QT and funding pressure are starting to pinch the banking system.",
      "Watch reserves alongside RRP, repo stress, and credit spreads."
    ),
    regimeTag: "buffers still available",
    summary: "Bank reserves are still adequate, but this is a key pressure point if liquidity tightens further.",
    advancedSummary:
      "Markets often ignore balance sheet runoff until reserves start to feel scarce at the margin.",
    watchList: ["RRP", "Repo rates", "Credit spreads"],
    signalScore: 0.2,
    tone: "neutral",
    releaseCadence: "Weekly",
    provider: { type: "manual" },
    trendSlope: 0.01,
    volatility: 0.01,
    minValue: 1,
    searchTerms: ["bank reserves", "reserve balances"]
  },
  {
    slug: "bank-credit-growth",
    name: "Bank Credit Growth",
    shortName: "Bank Credit",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 3.2,
    priorValue: 2.8,
    unit: "%",
    frequency: "Weekly",
    source: {
      name: "Commercial bank credit",
      url: "https://fred.stlouisfed.org/series/TOTBKCR",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "Bank credit growth shows whether private credit creation is still supporting the economy.",
      "Use it to see whether liquidity is actually reaching households and businesses rather than staying trapped in markets.",
      "Watch loan growth together with standards and credit spreads."
    ),
    regimeTag: "credit still flowing",
    summary: "Private credit growth is still positive enough to cushion a mixed macro backdrop.",
    advancedSummary:
      "A real liquidity slowdown is usually more convincing when bank credit growth and survey standards weaken together.",
    watchList: ["Loan standards", "HY spreads", "Regional banks"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Weekly",
    provider: { type: "manual" },
    trendSlope: 0.03,
    volatility: 0.04,
    minValue: -8,
    searchTerms: ["loan growth", "bank lending"]
  },
  {
    slug: "loan-standards",
    name: "Loan Standards",
    shortName: "Loan Standards",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 18,
    priorValue: 21,
    unit: "pts",
    unitLabel: "Net tightening %",
    frequency: "Quarterly",
    source: {
      name: "Fed SLOOS",
      url: "https://www.federalreserve.gov/data/sloos.htm",
      access: "official-free"
    },
    tooltips: liquidityTooltip(
      "Loan standards show whether banks are tightening or easing credit availability.",
      "Use them as the bridge between financial conditions and future growth. Tighter standards often slow activity with a lag.",
      "Watch whether tougher standards line up with weaker bank credit and wider HY spreads."
    ),
    regimeTag: "still somewhat tight",
    summary: "Credit availability is no longer tightening aggressively, but it is not wide open either.",
    advancedSummary:
      "Standards often matter more than headline rates because they determine who can actually borrow.",
    watchList: ["Bank credit growth", "HY spreads", "Small caps"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Quarterly",
    provider: { type: "manual" },
    trendSlope: -0.4,
    volatility: 0.6,
    minValue: -20,
    searchTerms: ["sloos", "credit availability", "loan standards"]
  }
];

const globalSpilloverBlueprints: IndicatorBlueprint[] = [
  {
    slug: "eurusd",
    name: "EURUSD",
    shortName: "EURUSD",
    module: "global",
    dimension: "liquidity",
    currentValue: 1.09,
    priorValue: 1.08,
    unit: "pts",
    unitLabel: "FX rate",
    frequency: "Daily",
    source: {
      name: "Blended FX spot feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "EURUSD shows how the dollar is trading against the euro, the largest weight in broad dollar indices.",
      "Use it to see whether dollar moves are broad or being driven by one major cross.",
      "Watch ECB expectations and relative growth data."
    ),
    regimeTag: "dollar not surging",
    summary: "EURUSD is not pointing to a fresh global dollar tightening shock.",
    advancedSummary:
      "A broad dollar squeeze is more convincing when EURUSD, USDJPY, and USDCNH all lean the same way.",
    watchList: ["DXY", "ECB pricing", "US yields"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.002,
    volatility: 0.003,
    minValue: 0.9,
    searchTerms: ["euro dollar", "eurusd"]
  },
  {
    slug: "usdjpy",
    name: "USDJPY",
    shortName: "USDJPY",
    module: "global",
    dimension: "liquidity",
    currentValue: 149.4,
    priorValue: 148.7,
    unit: "pts",
    unitLabel: "FX rate",
    frequency: "Daily",
    source: {
      name: "Blended FX spot feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "USDJPY is a key pressure valve for global rates, carry trades, and Japanese policy spillovers.",
      "Use it to track whether global liquidity is being helped by yen weakness or threatened by a BoJ-driven reversal.",
      "Watch the BoJ, US real yields, and carry positioning."
    ),
    regimeTag: "carry still intact",
    summary: "USDJPY still points to a live carry backdrop rather than a forced unwind.",
    advancedSummary:
      "Sharp yen moves often matter more for global risk than the headline macro story suggests.",
    watchList: ["BoJ", "Global duration", "Carry unwind risk"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.08,
    volatility: 0.12,
    minValue: 100,
    searchTerms: ["yen", "usd jpy", "carry"]
  },
  {
    slug: "usdcnh",
    name: "USDCNH",
    shortName: "USDCNH",
    module: "global",
    dimension: "growth",
    currentValue: 7.19,
    priorValue: 7.22,
    unit: "pts",
    unitLabel: "FX rate",
    frequency: "Daily",
    source: {
      name: "Offshore yuan feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "USDCNH is a fast read on China-sensitive growth and dollar pressure in Asia.",
      "Use it because a weaker yuan can signal softer China demand, tighter global conditions, or both.",
      "Watch China PMIs, metals, and the broad dollar."
    ),
    regimeTag: "china pressure contained",
    summary: "USDCNH is not signaling a fresh China-linked tightening impulse right now.",
    advancedSummary:
      "The yuan often matters as a signal before Western macro desks fully reprice the China story.",
    watchList: ["China PMI", "Copper", "DXY"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: -0.01,
    volatility: 0.02,
    minValue: 6,
    searchTerms: ["yuan", "china fx", "usd cnh"]
  },
  {
    slug: "natural-gas",
    name: "Natural Gas",
    shortName: "Nat Gas",
    module: "global",
    dimension: "inflation",
    currentValue: 2.1,
    priorValue: 1.9,
    unit: "usd",
    unitLabel: "USD/mmBtu",
    frequency: "Daily",
    source: {
      name: "Energy market feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "Natural gas is a volatile but important input into global energy costs and industrial margins.",
      "Use it as a spillover check when energy-driven inflation risk is broadening beyond oil.",
      "Watch Europe, weather shocks, and industrial demand."
    ),
    regimeTag: "energy noise manageable",
    summary: "Natural gas is firm, but not yet signaling a broader energy shock on its own.",
    advancedSummary:
      "Energy spillovers matter more when oil, gas, and the dollar all point in the same direction.",
    watchList: ["Oil", "Europe", "Utility inflation"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.04,
    volatility: 0.08,
    minValue: 0.5,
    searchTerms: ["gas prices", "energy spillover"]
  },
  {
    slug: "copper",
    name: "Copper",
    shortName: "Copper",
    module: "global",
    dimension: "growth",
    currentValue: 4.08,
    priorValue: 4.01,
    unit: "usd",
    unitLabel: "USD/lb",
    frequency: "Daily",
    source: {
      name: "Industrial metals feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "Copper is one of the market's quickest checks on global industrial demand.",
      "Use it to see whether growth optimism is broadening beyond domestic data.",
      "Watch China PMIs, the dollar, and the copper-gold ratio."
    ),
    regimeTag: "global demand steadier",
    summary: "Copper is not contradicting the idea of a steadier global growth backdrop.",
    advancedSummary:
      "Copper works best when it confirms PMIs and rates rather than replacing them.",
    watchList: ["China PMI", "Dollar", "10Y yields"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.03,
    volatility: 0.04,
    minValue: 1.5,
    searchTerms: ["industrial metals", "global growth", "copper"]
  }
];

const policyExpectationBlueprints: IndicatorBlueprint[] = [
  {
    slug: "sofr-implied-cuts",
    name: "SOFR-Implied Cuts (12M)",
    shortName: "Implied Cuts",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 68,
    priorValue: 61,
    unit: "bps",
    frequency: "Daily",
    source: {
      name: "SOFR / futures composite",
      access: "licensed-manual"
    },
    tooltips: ratesTooltip(
      "This tracks how many basis points of easing the market is pricing over the next year.",
      "Use it to see whether rates are moving because the market expects the Fed path to change.",
      "Watch it with the 2Y, claims, and core inflation."
    ),
    regimeTag: "easing still priced",
    summary: "Markets still expect easing over the next year, though the path can move sharply after key prints.",
    advancedSummary:
      "Policy repricing matters most when the change is fast enough to hit the front end and risk assets together.",
    watchList: ["2Y", "Core PCE", "Claims"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 1.2,
    volatility: 1.5,
    minValue: -50,
    searchTerms: ["fed cuts", "sofr futures", "implied easing"]
  },
  {
    slug: "terminal-rate-pricing",
    name: "Terminal Rate Pricing",
    shortName: "Terminal Rate",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 4.45,
    priorValue: 4.52,
    unit: "%",
    frequency: "Daily",
    source: {
      name: "Rates market terminal estimate",
      access: "licensed-manual"
    },
    tooltips: ratesTooltip(
      "Terminal rate pricing estimates where the market thinks the policy path peaks or settles in the cycle.",
      "Use it to separate small day-to-day rate moves from genuine policy-path repricing.",
      "Watch terminal pricing with 2Y yields and core inflation."
    ),
    regimeTag: "policy ceiling easing",
    summary: "The market is not pushing the expected policy ceiling back higher right now.",
    advancedSummary:
      "When terminal pricing rises with real yields, duration usually feels it quickly.",
    watchList: ["2Y", "Real yields", "Core inflation"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: -0.01,
    volatility: 0.02,
    minValue: 0,
    searchTerms: ["terminal rate", "policy path"]
  },
  {
    slug: "next-three-fomc-path",
    name: "Next 3 FOMC Implied Path",
    shortName: "Next 3 FOMC",
    module: "policy-liquidity",
    dimension: "liquidity",
    currentValue: 4.58,
    priorValue: 4.63,
    unit: "%",
    frequency: "Daily",
    source: {
      name: "Implied FOMC path model",
      access: "licensed-manual"
    },
    tooltips: ratesTooltip(
      "This smooths market pricing for the next three FOMC meetings into one path estimate.",
      "Use it to see whether a print changed near-term Fed expectations or only the long end.",
      "Watch how it moves relative to the 2Y and the curve."
    ),
    regimeTag: "near-term path softer",
    summary: "Near-term Fed pricing is leaning slightly softer, but it can change quickly after data.",
    advancedSummary:
      "A sharp change in the near-term path usually matters more for equities than a small move in the far end.",
    watchList: ["2Y", "Curve", "Payrolls"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: -0.01,
    volatility: 0.02,
    minValue: 0,
    searchTerms: ["fomc path", "meeting pricing", "implied path"]
  }
];

const positioningSupplementalBlueprints: IndicatorBlueprint[] = [
  {
    slug: "equal-weight-vs-cap-weight",
    name: "Equal-Weight vs Cap-Weight",
    shortName: "Equal vs Cap",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 0.98,
    priorValue: 0.96,
    unit: "x",
    frequency: "Daily",
    source: {
      name: "Relative index basket",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "This ratio compares broad equal-weight participation against cap-weight concentration.",
      "Use it to see whether the tape is broadening or staying dependent on mega-cap leadership.",
      "Watch breadth and small caps for confirmation."
    ),
    regimeTag: "broadening underneath",
    summary: "The tape is getting a bit less top-heavy, which makes risk appetite healthier.",
    advancedSummary:
      "Broadening leadership is usually more durable than a rally driven by one crowded pocket.",
    watchList: ["Breadth", "Small caps", "Crowding"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.004,
    volatility: 0.005,
    minValue: 0.7,
    searchTerms: ["equal weight", "cap weight", "leadership breadth"]
  },
  {
    slug: "small-caps-vs-large-caps",
    name: "Small Caps vs Large Caps",
    shortName: "Small vs Large",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 0.82,
    priorValue: 0.8,
    unit: "x",
    frequency: "Daily",
    source: {
      name: "Relative index basket",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "This compares small-cap performance with large-cap performance.",
      "Use it as a reality check on risk appetite and domestic growth confidence.",
      "Watch credit spreads and the 2Y when small caps start to move."
    ),
    regimeTag: "beta trying to confirm",
    summary: "Small caps are improving enough to suggest risk appetite is not purely defensive.",
    advancedSummary:
      "Small caps matter because they are more sensitive to financing costs and domestic growth.",
    watchList: ["HY spreads", "Breadth", "2Y yield"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.003,
    volatility: 0.005,
    minValue: 0.5,
    searchTerms: ["small caps", "risk appetite", "domestic beta"]
  }
];

export const liquiditySupplementalIndicators: MacroIndicator[] = buildIndicators(liquiditySupplementalBlueprints);
export const globalSpilloverIndicators: MacroIndicator[] = buildIndicators(globalSpilloverBlueprints);
export const policyExpectationIndicators: MacroIndicator[] = buildIndicators(policyExpectationBlueprints);
export const positioningSupplementalIndicators: MacroIndicator[] = buildIndicators(positioningSupplementalBlueprints);
