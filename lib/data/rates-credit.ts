import { buildIndicators, ratesTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "us-2y-treasury",
    name: "US 2Y Treasury Yield",
    shortName: "2Y Yield",
    module: "rates-credit",
    dimension: "liquidity",
    currentValue: 4.28,
    priorValue: 4.34,
    unit: "%",
    unitLabel: "Yield %",
    frequency: "Daily",
    source: {
      name: "Treasury via FRED",
      url: "https://fred.stlouisfed.org/series/DGS2",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The two-year Treasury yield is highly sensitive to Fed expectations over the near term.",
      "Use it as the fastest policy repricing barometer. Lower 2Y yields usually help long-duration assets if growth is not rolling over fast.",
      "Watch fed funds futures and core inflation data for the next move."
    ),
    regimeTag: "less hawkish pricing",
    summary: "Near-term policy expectations have cooled somewhat.",
    advancedSummary:
      "A falling 2Y with stable credit is constructive. A falling 2Y with widening spreads usually means growth fear instead.",
    watchList: ["Fed pricing", "Core PCE", "Payroll surprises"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "DGS2" },
    trendSlope: -0.01,
    volatility: 0.02,
    minValue: 0.1,
    searchTerms: ["front-end yield", "2 year treasury"]
  },
  {
    slug: "us-10y-treasury",
    name: "US 10Y Treasury Yield",
    shortName: "10Y Yield",
    module: "rates-credit",
    dimension: "liquidity",
    currentValue: 4.02,
    priorValue: 4.08,
    unit: "%",
    unitLabel: "Yield %",
    frequency: "Daily",
    source: {
      name: "Treasury via FRED",
      url: "https://fred.stlouisfed.org/series/DGS10",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The 10-year Treasury yield is the benchmark long-term risk-free rate for many asset valuations.",
      "Use it to judge the market's view on growth, inflation, and term premium all at once. It matters directly for equity duration and mortgage rates.",
      "Watch real yields and auction demand to understand what is driving the move."
    ),
    regimeTag: "valuation pressure easing",
    summary: "Long-end rates are not pushing harder against valuations right now.",
    advancedSummary:
      "A lower 10Y driven by real yields is more supportive for equities than one driven solely by lower breakevens.",
    watchList: ["Real yields", "Auction tails", "Fiscal supply"],
    signalScore: 0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "DGS10" },
    trendSlope: -0.01,
    volatility: 0.02,
    minValue: 0.2,
    searchTerms: ["long bond", "10 year treasury"]
  },
  {
    slug: "curve-2s10s",
    name: "2s10s Curve",
    shortName: "2s10s",
    module: "rates-credit",
    dimension: "growth",
    currentValue: -26,
    priorValue: -26,
    unit: "bps",
    unitLabel: "bps",
    frequency: "Daily",
    source: {
      name: "Treasury curve via FRED",
      url: "https://fred.stlouisfed.org/series/T10Y2Y",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The 2s10s curve is the spread between 10-year and 2-year Treasury yields.",
      "Use it as a cycle gauge. Deep inversion often reflects restrictive policy, while steepening can mean either normalization or recession stress depending on why it happens.",
      "Watch whether steepening comes from lower front-end yields or higher long-end yields."
    ),
    regimeTag: "less inverted",
    summary: "The curve remains restrictive but is no longer as deeply distorted.",
    advancedSummary:
      "Bull steepening usually helps risk assets more than bear steepening because the former implies easier policy expectations.",
    watchList: ["Front-end repricing", "Credit spreads", "3m10y curve"],
    signalScore: 0.2,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "T10Y2Y" },
    trendSlope: 0.5,
    volatility: 0.8,
    minValue: -150,
    searchTerms: ["yield curve", "2s 10s", "curve inversion"]
  },
  {
    slug: "curve-3m10y",
    name: "3m10y Curve",
    shortName: "3m10y",
    module: "rates-credit",
    dimension: "growth",
    currentValue: -58,
    priorValue: -64,
    unit: "bps",
    unitLabel: "bps",
    frequency: "Daily",
    source: {
      name: "Treasury curve via FRED",
      url: "https://fred.stlouisfed.org/series/T10Y3M",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The 3m10y curve compares short policy-sensitive bills with the 10-year yield.",
      "Use it because it has a strong historical relationship with recession risk, especially when inversion persists for months.",
      "Watch whether normalization is driven by rate cuts or by inflation fear."
    ),
    regimeTag: "still cautionary",
    summary: "The recession-warning curve is less inverted but still not fully healed.",
    advancedSummary:
      "This curve matters most alongside claims, LEI, and credit spreads rather than as a standalone trigger.",
    watchList: ["Claims", "LEI", "Fed cuts"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "T10Y3M" },
    trendSlope: 0.6,
    volatility: 0.9,
    minValue: -200,
    searchTerms: ["3m 10y", "recession curve"]
  },
  {
    slug: "ig-spreads",
    name: "Investment Grade Spreads",
    shortName: "IG Spreads",
    module: "rates-credit",
    dimension: "risk-appetite",
    currentValue: 102,
    priorValue: 105,
    unit: "bps",
    unitLabel: "bps",
    frequency: "Daily",
    source: {
      name: "ICE BofA via FRED",
      url: "https://fred.stlouisfed.org/series/BAMLC0A0CM",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "Investment-grade spreads show how much extra yield strong corporates pay over Treasuries.",
      "Use them to gauge whether credit markets are validating the soft-landing story. Tight spreads support equities and cyclical credit.",
      "Watch earnings revisions and HY spreads for deterioration that starts beneath the surface."
    ),
    regimeTag: "credit calm",
    summary: "High-quality credit markets are still comfortable with the macro backdrop.",
    advancedSummary:
      "Spreads matter because credit is often earlier than equities when growth risk begins to widen.",
    watchList: ["HY spreads", "Bank lending surveys", "Default rates"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "BAMLC0A0CM" },
    trendSlope: -0.5,
    volatility: 1,
    minValue: 60,
    searchTerms: ["corporate spreads", "investment grade credit"]
  },
  {
    slug: "hy-spreads",
    name: "High Yield Spreads",
    shortName: "HY Spreads",
    module: "rates-credit",
    dimension: "risk-appetite",
    currentValue: 356,
    priorValue: 369,
    unit: "bps",
    unitLabel: "bps",
    frequency: "Daily",
    source: {
      name: "ICE BofA via FRED",
      url: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "High-yield spreads show the extra yield paid by lower-rated borrowers over Treasuries.",
      "Use them as a live macro stress gauge. Wider HY spreads usually mean investors are preparing for slower growth or tighter liquidity.",
      "Watch default commentary, CCC performance, and bank stress."
    ),
    regimeTag: "risk still open",
    summary: "Credit stress is not yet flashing recession trouble.",
    advancedSummary:
      "HY spreads widening while equities stay calm is one of the cleaner early warnings to respect.",
    watchList: ["CCC tier", "Defaults", "Small-cap leadership"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "BAMLH0A0HYM2" },
    trendSlope: -1,
    volatility: 2,
    minValue: 250,
    searchTerms: ["junk spreads", "high yield credit"]
  },
  {
    slug: "mortgage-rates",
    name: "30Y Mortgage Rate",
    shortName: "Mortgage Rate",
    module: "rates-credit",
    dimension: "growth",
    currentValue: 6.38,
    priorValue: 6.49,
    unit: "%",
    unitLabel: "Mortgage rate %",
    frequency: "Weekly",
    source: {
      name: "Freddie Mac via FRED",
      url: "https://fred.stlouisfed.org/series/MORTGAGE30US",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The 30-year mortgage rate measures the borrowing cost faced by homebuyers in the US housing market.",
      "Use it as the transmission channel from bond yields to real-economy demand. Lower mortgage rates support housing activity quickly.",
      "Watch purchase applications and builder sentiment after each major rate move."
    ),
    regimeTag: "housing relief",
    summary: "Mortgage costs are no longer rising into the housing market.",
    advancedSummary:
      "This is one of the most visible ways macro policy reaches households.",
    watchList: ["Purchase apps", "Permits", "Homebuilder equities"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Weekly",
    provider: { type: "fred", seriesId: "MORTGAGE30US" },
    trendSlope: -0.03,
    volatility: 0.04,
    minValue: 2,
    searchTerms: ["home loan rate", "housing financing"]
  },
  {
    slug: "ten-year-real-yield",
    name: "10Y Real Yield",
    shortName: "Real Yield",
    module: "rates-credit",
    dimension: "liquidity",
    currentValue: 1.68,
    priorValue: 1.74,
    unit: "%",
    unitLabel: "Yield %",
    frequency: "Daily",
    source: {
      name: "FRED",
      url: "https://fred.stlouisfed.org/series/DFII10",
      access: "official-free"
    },
    tooltips: ratesTooltip(
      "The 10-year real yield is the inflation-adjusted return on US Treasuries.",
      "Use it as the cleanest valuation pressure gauge for long-duration assets. Higher real yields usually compress equity multiples and tighten financial conditions.",
      "Watch breakevens and the 10Y nominal yield to separate growth fear from real-rate pressure."
    ),
    regimeTag: "valuation pressure softer",
    summary: "Real-rate headwinds have eased a bit.",
    advancedSummary:
      "This is the rate series growth investors should respect most because it directly changes the discount rate.",
    watchList: ["Tech leadership", "Breakevens", "Fed repricing"],
    signalScore: 0.2,
    tone: "positive",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "DFII10" },
    trendSlope: -0.02,
    volatility: 0.02,
    minValue: -2,
    searchTerms: ["tips yield", "inflation-adjusted yield"]
  }
];

export const ratesCreditIndicators = buildIndicators(blueprints);
