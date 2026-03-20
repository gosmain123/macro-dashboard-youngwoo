import { buildIndicators, internalsTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "vix",
    name: "VIX",
    shortName: "VIX",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 14.8,
    priorValue: 15.6,
    unit: "pts",
    unitLabel: "Index level",
    frequency: "Daily",
    source: {
  name: "FRED CBOE VIX",
  url: "https://fred.stlouisfed.org/series/VIXCLS",
  access: "official-free"
},
    tooltips: internalsTooltip(
      "The VIX measures the implied volatility priced into S&P 500 options over the next 30 days.",
      "Use it as the market's fear gauge. A low VIX supports risk appetite, but an extremely low VIX can also signal complacency.",
      "Watch whether VIX rises alongside widening credit spreads or just into event risk."
    ),
    regimeTag: "contained volatility",
    summary: "Equity volatility is subdued and supportive of risk-taking.",
    advancedSummary:
      "A low VIX is healthiest when breadth is also strong. Narrow leadership with a low VIX is less trustworthy.",
    watchList: ["Breadth", "HY spreads", "Event calendar"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Intraday",
    provider: { type: "fred", seriesId: "VIXCLS" },
    trendSlope: -0.1,
    volatility: 0.3,
    minValue: 9,
    searchTerms: ["equity vol", "fear gauge"]
  },
  {
    slug: "move-index",
    name: "MOVE Index",
    shortName: "MOVE",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 92,
    priorValue: 96,
    unit: "pts",
    unitLabel: "Index level",
    frequency: "Daily",
    source: {
      name: "ICE / Treasury volatility feed",
      access: "licensed-manual"
    },
    tooltips: internalsTooltip(
      "The MOVE index measures implied volatility in the Treasury market.",
      "Use it because rate volatility is often the hidden driver of equity multiple compression and cross-asset stress.",
      "Watch the 2Y yield and auction calendar when MOVE spikes."
    ),
    regimeTag: "rate vol cooling",
    summary: "Treasury market volatility is no longer the main macro problem.",
    advancedSummary:
      "Risk assets usually struggle more with rising MOVE than with a modest rise in nominal yields alone.",
    watchList: ["2Y yield", "Auction tails", "Fed communication"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: -0.8,
    volatility: 1.6,
    minValue: 60,
    searchTerms: ["rate volatility", "treasury vol"]
  },
  {
    slug: "dxy",
    name: "US Dollar Index",
    shortName: "DXY",
    module: "market-internals",
    dimension: "liquidity",
    currentValue: 102.4,
    priorValue: 103.1,
    unit: "pts",
    unitLabel: "Index level",
    frequency: "Daily",
    source: {
      name: "ICE / blended FX feed",
      access: "licensed-manual"
    },
    tooltips: internalsTooltip(
      "DXY is a broad index of the US dollar against major developed-market currencies.",
      "Use it because a stronger dollar often tightens global liquidity and weighs on commodities, EM assets, and multinational earnings.",
      "Watch real yields and overseas growth differentials for the next move."
    ),
    regimeTag: "liquidity less tight",
    summary: "The dollar is not intensifying global tightening pressure.",
    advancedSummary:
      "A softer dollar can help global beta and commodities as long as it is not falling because US growth is collapsing.",
    watchList: ["Real yields", "China PMI", "Oil"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: -0.08,
    volatility: 0.12,
    minValue: 85,
    searchTerms: ["dollar", "usd index", "fx conditions"]
  },
  {
    slug: "wti-oil",
    name: "WTI Crude Oil",
    shortName: "Oil",
    module: "market-internals",
    dimension: "inflation",
    currentValue: 76.4,
    priorValue: 74.8,
    unit: "usd",
    unitLabel: "Daily close",
    frequency: "Daily",
    source: {
      name: "FRED WTI spot",
      url: "https://fred.stlouisfed.org/series/DCOILWTICO",
      access: "official-free"
    },
    tooltips: internalsTooltip(
      "WTI crude is the benchmark price for US oil.",
      "Use oil as both an inflation and growth input. Rising oil can support energy equities but complicate the disinflation path.",
      "Watch breakevens, gasoline prices, and geopolitical supply risk."
    ),
    regimeTag: "watch inflation tail",
    summary: "Oil is firm enough to keep the inflation conversation alive.",
    advancedSummary:
      "The macro message depends on why oil is rising. Supply shocks are worse for risk assets than demand-led increases.",
    watchList: ["Breakevens", "Gasoline", "Energy equities"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "DCOILWTICO" },
    trendSlope: 0.3,
    volatility: 0.5,
    minValue: 30,
    searchTerms: ["crude", "energy prices"]
  },
  {
    slug: "gold",
    name: "Gold",
    shortName: "Gold",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 2215,
    priorValue: 2192,
    unit: "usd/oz",
    unitLabel: "USD per ounce",
    frequency: "Daily",
    source: {
      name: "FRED / market feed",
      url: "https://fred.stlouisfed.org/series/GOLDAMGBD228NLBM",
      access: "official-free"
    },
    tooltips: internalsTooltip(
      "Gold is a defensive hard asset that often reacts to real yields, the dollar, and macro uncertainty.",
      "Use it as a cross-check on monetary confidence. Gold strength with falling real yields is typically benign; gold strength with rising stress can be more defensive.",
      "Watch real yields and the dollar before assigning one simple meaning to the move."
    ),
    regimeTag: "defensive hedge still wanted",
    summary: "Investors still want some macro hedging even in a constructive backdrop.",
    advancedSummary:
      "Gold working alongside risk assets can signal easier liquidity rather than outright fear.",
    watchList: ["Real yields", "Dollar", "Central bank demand"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "GOLDAMGBD228NLBM" },
    trendSlope: 2,
    volatility: 4,
    minValue: 800,
    searchTerms: ["precious metals", "safe haven"]
  },
  {
    slug: "copper-gold-ratio",
    name: "Copper / Gold Ratio",
    shortName: "Cu/Au Ratio",
    module: "market-internals",
    dimension: "growth",
    currentValue: 0.0046,
    priorValue: 0.0045,
    unit: "x",
    frequency: "Daily",
    source: {
      name: "Derived commodity ratio",
      access: "licensed-manual"
    },
    tooltips: internalsTooltip(
      "The copper-to-gold ratio compares a growth-sensitive metal with a defensive one.",
      "Use it as a quick risk and growth pulse. A rising ratio usually points to stronger cyclical confidence and firmer yields.",
      "Watch PMIs and long yields for confirmation."
    ),
    regimeTag: "cyclical tone better",
    summary: "The commodity complex is not screaming recession right now.",
    advancedSummary:
      "This ratio works best as a confirmatory market signal rather than a standalone forecast.",
    watchList: ["China PMI", "10Y yields", "Industrial metals"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.00002,
    volatility: 0.00003,
    minValue: 0.001,
    searchTerms: ["copper gold", "cyclical ratio"]
  },
  {
    slug: "breadth",
    name: "Breadth",
    shortName: "Breadth",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 63,
    priorValue: 59,
    unit: "%",
    frequency: "Daily",
    source: {
      name: "Internal breadth model",
      access: "licensed-manual"
    },
    tooltips: internalsTooltip(
      "Breadth measures how many stocks are participating in the market's move instead of a small leadership group doing all the work.",
      "Use improving breadth as a quality check on risk appetite. Broad participation makes rallies healthier and more durable.",
      "Watch equal-weight indexes and small caps for confirmation."
    ),
    regimeTag: "participation broadening",
    summary: "The rally is broader than a single crowded theme.",
    advancedSummary:
      "Breadth improvement matters most after narrow markets because it reduces fragility.",
    watchList: ["Equal-weight performance", "Small caps", "Advance-decline lines"],
    signalScore: 0.6,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.5,
    volatility: 1,
    minValue: 10,
    searchTerms: ["advance decline", "participation", "market breadth"]
  },
  {
    slug: "cyclical-vs-defensive",
    name: "Cyclical vs Defensive Leadership",
    shortName: "Leadership",
    module: "market-internals",
    dimension: "risk-appetite",
    currentValue: 1.12,
    priorValue: 1.08,
    unit: "x",
    frequency: "Daily",
    source: {
      name: "Relative performance basket",
      access: "licensed-manual"
    },
    tooltips: internalsTooltip(
      "This ratio compares cyclically sensitive sectors with defensive sectors.",
      "Use it to see whether investors are leaning into growth confidence or hiding in safety. Rising cyclicals usually confirm a constructive macro view.",
      "Watch yields and PMIs because a false breakout often fails without them."
    ),
    regimeTag: "risk-on leadership",
    summary: "Leadership is leaning toward growth rather than defense.",
    advancedSummary:
      "Leadership rotations matter because they often turn before the headline index does.",
    watchList: ["PMIs", "10Y yield", "Breadth"],
    signalScore: 0.7,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.01,
    volatility: 0.01,
    minValue: 0.5,
    searchTerms: ["sector leadership", "cyclical defensive"]
  }
];

export const marketInternalIndicators = buildIndicators(blueprints);
