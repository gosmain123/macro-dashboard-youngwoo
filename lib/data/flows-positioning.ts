import { buildIndicators, flowsTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "thirteen-f-tracker",
    name: "13F Tracker",
    shortName: "13F",
    module: "flows-positioning",
    dimension: "risk-appetite",
    currentValue: 58,
    priorValue: 55,
    unit: "pts",
    frequency: "Quarterly",
    source: {
      name: "Manual 13F aggregation",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "The 13F tracker aggregates large institutional holdings disclosures to show where professional capital is leaning.",
      "Use it to identify crowded leadership and slow-moving factor exposure, not real-time trading shifts.",
      "Watch whether new ownership concentration is rising in the same themes everyone already loves."
    ),
    regimeTag: "crowding building",
    summary: "Institutional positioning is supportive, but crowding is no longer light.",
    advancedSummary:
      "13F data is delayed, so it is most useful for structural positioning rather than event trading.",
    watchList: ["Top holdings overlap", "Crowding flags", "ETF flows"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Quarterly, with lag",
    provider: { type: "manual" },
    trendSlope: 0.3,
    volatility: 0.4,
    minValue: 0,
    searchTerms: ["hedge fund holdings", "institutional ownership"]
  },
  {
    slug: "cftc-cot",
    name: "CFTC Commitment of Traders",
    shortName: "COT",
    module: "flows-positioning",
    dimension: "risk-appetite",
    currentValue: 61,
    priorValue: 57,
    unit: "pts",
    frequency: "Weekly",
    source: {
      name: "CFTC / internal normalization",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "COT reports show speculative and commercial futures positioning across major macro markets.",
      "Use it to spot stretched consensus in rates, equities, FX, or commodities before the narrative reverses.",
      "Watch whether price is still confirming the positioning trend or starting to diverge."
    ),
    regimeTag: "spec positioning extended",
    summary: "Speculators are leaning risk-on, which helps until it becomes too crowded.",
    advancedSummary:
      "Positioning extremes are not timing tools by themselves; the signal improves when price action stops confirming them.",
    watchList: ["Rates futures", "Dollar positioning", "Price divergence"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Weekly, Fridays",
    provider: { type: "manual" },
    trendSlope: 0.3,
    volatility: 0.5,
    minValue: 0,
    searchTerms: ["commitment of traders", "futures positioning"]
  },
  {
    slug: "etf-flows",
    name: "ETF Flows",
    shortName: "ETF Flows",
    module: "flows-positioning",
    dimension: "risk-appetite",
    currentValue: 12.6,
    priorValue: 10.4,
    unit: "$bn",
    frequency: "Daily",
    source: {
      name: "Fund flow aggregator",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "ETF flows track how much capital is moving into or out of exchange-traded funds across major asset classes.",
      "Use them to see whether investor demand is broadening or fading. Flows can reinforce momentum when macro conditions are already supportive.",
      "Watch whether flows are concentrated in one theme or spreading across cyclicals, duration, and global assets."
    ),
    regimeTag: "inflows supportive",
    summary: "Investor cash is still following the constructive narrative.",
    advancedSummary:
      "Flows matter most when they either confirm or clearly contradict the macro signal coming from rates and credit.",
    watchList: ["Flow breadth", "Sector concentration", "Bond fund demand"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "manual" },
    trendSlope: 0.3,
    volatility: 0.6,
    minValue: -30,
    searchTerms: ["fund flows", "passive demand"]
  },
  {
    slug: "buyback-window",
    name: "Buyback Window",
    shortName: "Buybacks",
    module: "flows-positioning",
    dimension: "risk-appetite",
    currentValue: 72,
    priorValue: 68,
    unit: "%",
    frequency: "Weekly",
    source: {
      name: "Corporate desk calendar",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "The buyback window estimates how much of the corporate repurchase bid is open versus in blackout.",
      "Use it to judge whether a steady mechanical equity bid is active beneath the market.",
      "Watch earnings season because blackout periods temporarily remove this support."
    ),
    regimeTag: "corporate bid open",
    summary: "A meaningful corporate demand tailwind is currently available.",
    advancedSummary:
      "Buybacks do not override bad macro, but they can dampen drawdowns when the macro tape is only mildly negative.",
    watchList: ["Earnings blackout", "Volume support", "ETF flows"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Weekly estimate",
    provider: { type: "manual" },
    trendSlope: 0.8,
    volatility: 1.2,
    minValue: 0,
    searchTerms: ["repurchases", "corporate bid"]
  },
  {
    slug: "crowding-flags",
    name: "Crowding Flags",
    shortName: "Crowding",
    module: "flows-positioning",
    dimension: "risk-appetite",
    currentValue: 38,
    priorValue: 34,
    unit: "pts",
    frequency: "Weekly",
    source: {
      name: "Internal factor crowding model",
      access: "licensed-manual"
    },
    tooltips: flowsTooltip(
      "Crowding flags summarize whether positioning is becoming one-sided in themes, sectors, or factors.",
      "Use them as a risk-management overlay. High crowding means good macro news may already be priced, while bad news can trigger sharper unwinds.",
      "Watch breadth and option skew when crowding rises."
    ),
    regimeTag: "some complacency",
    summary: "The tape is constructive, but complacency is building.",
    advancedSummary:
      "Crowding is most dangerous when liquidity is tightening and leadership narrows at the same time.",
    watchList: ["Breadth", "Skew", "Volume concentration"],
    signalScore: -0.2,
    tone: "negative",
    releaseCadence: "Weekly",
    provider: { type: "manual" },
    trendSlope: 0.4,
    volatility: 0.5,
    minValue: 0,
    searchTerms: ["positioning risk", "factor crowding"]
  }
];

export const flowIndicators = buildIndicators(blueprints);
