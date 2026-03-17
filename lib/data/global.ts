import { buildIndicators, globalTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "china-pmi",
    name: "China PMI",
    shortName: "China PMI",
    module: "global",
    dimension: "growth",
    currentValue: 50.7,
    priorValue: 50.3,
    unit: "index",
    frequency: "Monthly",
    source: {
      name: "NBS / Caixin blended feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "China PMI surveys the direction of Chinese manufacturing and services activity around the 50 expansion threshold.",
      "Use it because China still matters for commodities, cyclicals, and global trade sentiment.",
      "Watch property policy, credit impulse, and metals prices."
    ),
    regimeTag: "external demand stabilizing",
    summary: "China is no longer a clear drag on the global cyclical story.",
    advancedSummary:
      "The quality of the improvement matters. Domestic stimulus-led rebounds do not always translate into durable global demand.",
    watchList: ["Credit impulse", "Copper", "Export orders"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "Monthly",
    provider: { type: "manual" },
    trendSlope: 0.12,
    volatility: 0.18,
    minValue: 40,
    searchTerms: ["china growth", "asia pmi"]
  },
  {
    slug: "eurozone-pmi",
    name: "Eurozone PMI",
    shortName: "Eurozone PMI",
    module: "global",
    dimension: "growth",
    currentValue: 49.8,
    priorValue: 49.1,
    unit: "index",
    frequency: "Monthly",
    source: {
      name: "HCOB / S&P Global feed",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "Eurozone PMI tracks whether euro area activity is expanding or contracting.",
      "Use it to judge whether global manufacturing and trade are broadening beyond the US.",
      "Watch German new orders, ECB policy, and energy-sensitive sectors."
    ),
    regimeTag: "near stabilization",
    summary: "Europe is still soft, but the downtrend is becoming less severe.",
    advancedSummary:
      "A move back through 50 would matter more for global cyclicals than for domestic defensives.",
    watchList: ["German manufacturing", "ECB lending", "Energy prices"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Monthly",
    provider: { type: "manual" },
    trendSlope: 0.1,
    volatility: 0.14,
    minValue: 40,
    searchTerms: ["europe pmi", "euro area activity"]
  },
  {
    slug: "boj-policy",
    name: "BoJ Policy Stance",
    shortName: "BoJ",
    module: "global",
    dimension: "liquidity",
    currentValue: 48,
    priorValue: 46,
    unit: "pts",
    frequency: "Monthly",
    source: {
      name: "BoJ policy tracker",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "This tracker summarizes whether the Bank of Japan is becoming more or less accommodative.",
      "Use it because shifts in Japanese policy can move global bond yields, the yen, and carry trades quickly.",
      "Watch JGB yields, the yen, and reserve manager commentary."
    ),
    regimeTag: "still gradual normalization",
    summary: "Japan is normalizing slowly enough to avoid global shock for now.",
    advancedSummary:
      "The risk is not simply higher JGB yields. It is the global unwind of leveraged carry if policy surprises hawkishly.",
    watchList: ["USDJPY", "Global duration", "BoJ meeting tone"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "After major BoJ meetings",
    provider: { type: "manual" },
    trendSlope: 0.2,
    volatility: 0.3,
    minValue: 0,
    searchTerms: ["bank of japan", "yen carry"]
  },
  {
    slug: "major-central-bank-tracker",
    name: "Major Central Bank Tracker",
    shortName: "Central Banks",
    module: "global",
    dimension: "liquidity",
    currentValue: 61,
    priorValue: 58,
    unit: "pts",
    frequency: "Weekly",
    source: {
      name: "Manual policy composite",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "This composite scores how major central banks are shifting between easing, holding, and tightening.",
      "Use it to see whether global policy is turning into a tailwind or headwind for liquidity at the same time.",
      "Watch if the Fed, ECB, and BoJ start moving in different directions."
    ),
    regimeTag: "global easing bias",
    summary: "Global policy is becoming less restrictive on net.",
    advancedSummary:
      "Synchronized easing matters more for cross-asset risk-taking than isolated cuts from one region.",
    watchList: ["Fed path", "ECB path", "BoJ divergence"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Weekly composite",
    provider: { type: "manual" },
    trendSlope: 0.3,
    volatility: 0.4,
    minValue: 0,
    searchTerms: ["global policy", "central bank composite"]
  },
  {
    slug: "global-growth-cross-check",
    name: "Global Growth Cross-Check",
    shortName: "Global Cross-Check",
    module: "global",
    dimension: "growth",
    currentValue: 57,
    priorValue: 54,
    unit: "pts",
    frequency: "Weekly",
    source: {
      name: "Internal global growth dashboard",
      access: "licensed-manual"
    },
    tooltips: globalTooltip(
      "This score blends PMIs, trade data, commodity demand, and financial conditions into one global growth confirmation gauge.",
      "Use it to avoid making a domestic macro call that is contradicted by the rest of the world.",
      "Watch whether commodities, freight, and export orders all move together."
    ),
    regimeTag: "broader confirmation",
    summary: "The global picture is increasingly consistent with a mild cyclical upturn.",
    advancedSummary:
      "Cross-checks matter because single-country narratives often fail when the international backdrop is moving the other way.",
    watchList: ["PMI breadth", "Trade volumes", "Commodity demand"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Weekly composite",
    provider: { type: "manual" },
    trendSlope: 0.4,
    volatility: 0.5,
    minValue: 0,
    searchTerms: ["world growth", "global macro confirmation"]
  }
];

export const globalIndicators = buildIndicators(blueprints);
