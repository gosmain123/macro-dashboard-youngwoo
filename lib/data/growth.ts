import { buildIndicators, growthTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "gdp-nowcast",
    name: "GDP Nowcast",
    shortName: "GDP Now",
    module: "growth",
    dimension: "growth",
    currentValue: 2.1,
    priorValue: 2.0,
    unit: "%",
    frequency: "Weekly",
    source: {
      name: "Atlanta Fed / internal blended nowcast",
      access: "licensed-manual"
    },
    tooltips: growthTooltip(
      "A nowcast estimates current-quarter GDP before the official release arrives.",
      "Use it as a live scorecard for growth momentum. Rising nowcasts support cyclicals and higher yields if inflation is not collapsing.",
      "Watch retail sales, industrial production, and inventory-heavy releases that can swing the estimate."
    ),
    regimeTag: "soft landing",
    summary: "Growth is still positive and avoiding a sharp downshift.",
    advancedSummary:
      "Nowcasts are noisy. The direction matters more than one weekly jump because the model reacts mechanically to incoming releases.",
    watchList: ["Retail control group", "Industrial production", "Inventories"],
    signalScore: 0.8,
    tone: "positive",
    releaseCadence: "Weekly and after major releases",
    provider: { type: "manual" },
    trendSlope: 0.03,
    volatility: 0.04,
    minValue: -3,
    searchTerms: ["gdp forecast", "growth nowcast"]
  },
  {
    slug: "ism-manufacturing",
    name: "ISM Manufacturing PMI",
    shortName: "ISM Mfg",
    module: "growth",
    dimension: "growth",
    currentValue: 50.8,
    priorValue: 49.9,
    unit: "index",
    frequency: "Monthly",
    source: {
      name: "ISM survey feed",
      access: "licensed-manual"
    },
    tooltips: growthTooltip(
      "The manufacturing PMI surveys whether factory activity is expanding or contracting around the 50 mark.",
      "Use it as an early-cycle signal. A move back above 50 often helps cyclicals, small caps, and industrials if credit is also stable.",
      "Watch new orders, inventories, and export orders for confirmation."
    ),
    regimeTag: "factory stabilization",
    summary: "Manufacturing is improving from contractionary levels.",
    advancedSummary:
      "The new orders versus inventories spread matters more than the headline when judging whether the rebound is real.",
    watchList: ["New orders", "Prices paid", "Export demand"],
    signalScore: 0.7,
    tone: "positive",
    releaseCadence: "Monthly, first business day",
    provider: { type: "manual" },
    trendSlope: 0.2,
    volatility: 0.25,
    minValue: 35,
    searchTerms: ["pmi", "factory survey", "manufacturing"]
  },
  {
    slug: "ism-services",
    name: "ISM Services PMI",
    shortName: "ISM Services",
    module: "growth",
    dimension: "growth",
    currentValue: 52.4,
    priorValue: 52.0,
    unit: "index",
    frequency: "Monthly",
    source: {
      name: "ISM survey feed",
      access: "licensed-manual"
    },
    tooltips: growthTooltip(
      "The services PMI tracks whether service-sector activity is expanding or contracting around the 50 line.",
      "Use it because services dominate the US economy. Stable services usually keeps recession fears contained.",
      "Watch business activity, new orders, and employment subindexes."
    ),
    regimeTag: "steady expansion",
    summary: "The largest part of the economy is still expanding.",
    advancedSummary:
      "A services PMI above 50 with cooling prices is one of the cleanest soft-landing combinations.",
    watchList: ["Services prices", "Employment subindex", "Consumer spending"],
    signalScore: 0.8,
    tone: "positive",
    releaseCadence: "Monthly, first week",
    provider: { type: "manual" },
    trendSlope: 0.12,
    volatility: 0.2,
    minValue: 40,
    searchTerms: ["services pmi", "non-manufacturing"]
  },
  {
    slug: "retail-sales",
    name: "Retail Sales Control Group",
    shortName: "Retail Sales",
    module: "growth",
    dimension: "growth",
    currentValue: 3.1,
    priorValue: 2.8,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "Census via FRED",
      url: "https://fred.stlouisfed.org/series/RSXFS",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Retail sales measure nominal consumer spending at stores, restaurants, and online merchants.",
      "Use the control group to judge real consumption momentum. Strong spending supports growth but can also slow the disinflation process if it is too hot.",
      "Watch revisions, real income, and credit card stress."
    ),
    regimeTag: "consumer resilient",
    summary: "Consumers are still spending enough to keep recession fears in check.",
    advancedSummary:
      "Strong nominal retail data matters less if it is inflation-driven, so pair it with real wage growth and sentiment.",
    watchList: ["Real disposable income", "Consumer sentiment", "Credit delinquencies"],
    signalScore: 0.6,
    tone: "positive",
    releaseCadence: "Monthly, mid-month",
    provider: { type: "fred", seriesId: "RSXFS" },
    trendSlope: 0.04,
    volatility: 0.06,
    minValue: -8,
    searchTerms: ["consumer spending", "control group"]
  },
  {
    slug: "industrial-production",
    name: "Industrial Production",
    shortName: "Industrial Prod",
    module: "growth",
    dimension: "growth",
    currentValue: 1.2,
    priorValue: 0.8,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "Fed via FRED",
      url: "https://fred.stlouisfed.org/series/INDPRO",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Industrial production measures real output across factories, mines, and utilities.",
      "Use it to confirm whether manufacturing PMIs are translating into actual output rather than sentiment alone.",
      "Watch capacity utilization, durable goods, and electricity-sensitive swings."
    ),
    regimeTag: "production firming",
    summary: "Hard activity data is improving, not just surveys.",
    advancedSummary:
      "This is most useful when it confirms the PMI cycle and broadens beyond one volatile sector.",
    watchList: ["Capacity utilization", "Durables ex-defense", "Inventories"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Monthly, around the 15th",
    provider: { type: "fred", seriesId: "INDPRO" },
    trendSlope: 0.05,
    volatility: 0.04,
    minValue: -10,
    searchTerms: ["factory output", "industrial activity"]
  },
  {
    slug: "durable-goods",
    name: "Durable Goods Orders ex Transportation",
    shortName: "Durables",
    module: "growth",
    dimension: "growth",
    currentValue: 1.6,
    priorValue: 1.1,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "Census via FRED",
      url: "https://fred.stlouisfed.org/series/NEWORDER",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Durable goods orders track business demand for long-lived manufactured items.",
      "Use the ex-transportation detail to judge core capex demand. Strong orders can front-run an industrial rebound and better earnings breadth.",
      "Watch core capital goods shipments and regional Fed surveys."
    ),
    regimeTag: "capex improving",
    summary: "Business equipment demand is starting to lean constructive again.",
    advancedSummary:
      "This release is noisy, so persistent improvement in core capex lines matters more than headline aircraft swings.",
    watchList: ["Core capital goods", "Regional surveys", "Corporate confidence"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Monthly, late month",
    provider: { type: "fred", seriesId: "NEWORDER" },
    trendSlope: 0.05,
    volatility: 0.08,
    minValue: -12,
    searchTerms: ["capex", "business investment", "factory orders"]
  },
  {
    slug: "housing-starts",
    name: "Housing Starts",
    shortName: "Starts",
    module: "growth",
    dimension: "growth",
    currentValue: 1.38,
    priorValue: 1.33,
    unit: "m",
    frequency: "Monthly",
    source: {
      name: "Census via FRED",
      url: "https://fred.stlouisfed.org/series/HOUST",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Housing starts count the annualized pace of new residential construction projects.",
      "Use housing as an early-rate-sensitive growth gauge. Starts usually recover before broader activity if financing conditions improve.",
      "Watch permits, mortgage rates, and builder sentiment."
    ),
    regimeTag: "rate-sensitive rebound",
    summary: "Housing is stabilizing instead of dragging on growth.",
    advancedSummary:
      "The housing cycle matters because it spills into labor, materials demand, and household confidence.",
    watchList: ["Permits", "Mortgage rates", "Builder confidence"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Monthly, around the 18th",
    provider: { type: "fred", seriesId: "HOUST" },
    trendSlope: 0.01,
    volatility: 0.03,
    minValue: 0.5,
    searchTerms: ["construction", "housing cycle"]
  },
  {
    slug: "building-permits",
    name: "Building Permits",
    shortName: "Permits",
    module: "growth",
    dimension: "growth",
    currentValue: 1.44,
    priorValue: 1.4,
    unit: "m",
    frequency: "Monthly",
    source: {
      name: "Census via FRED",
      url: "https://fred.stlouisfed.org/series/PERMIT",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Building permits measure authorized future housing construction.",
      "Use permits as the cleaner leading housing signal because they tend to move before starts and are less weather-distorted.",
      "Watch mortgage applications and homebuilder commentary."
    ),
    regimeTag: "forward housing stabilizing",
    summary: "The leading housing signal is leaning better, not worse.",
    advancedSummary:
      "A firm permits trend with lower mortgage rates is often an early cycle tailwind.",
    watchList: ["Mortgage applications", "Builder sentiment", "Starts follow-through"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Monthly, around the 18th",
    provider: { type: "fred", seriesId: "PERMIT" },
    trendSlope: 0.01,
    volatility: 0.02,
    minValue: 0.5,
    searchTerms: ["permits", "future construction"]
  },
  {
    slug: "leading-economic-index",
    name: "Leading Economic Index",
    shortName: "LEI",
    module: "growth",
    dimension: "growth",
    currentValue: -0.6,
    priorValue: -0.8,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "Conference Board feed",
      access: "licensed-manual"
    },
    tooltips: growthTooltip(
      "The LEI combines multiple leading indicators designed to flag turning points in the business cycle.",
      "Use it as a broad cross-check rather than a trading signal. Persistent improvement lowers recession probability even if single releases wobble.",
      "Watch the diffusion across components, not just the headline change."
    ),
    regimeTag: "still cautious",
    summary: "Leading data is less negative, but not yet decisively expansionary.",
    advancedSummary:
      "LEI works best when it confirms the message from the curve, claims, and PMIs rather than in isolation.",
    watchList: ["Yield curve", "Claims trend", "New orders"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Monthly, late month",
    provider: { type: "manual" },
    trendSlope: 0.04,
    volatility: 0.05,
    minValue: -5,
    searchTerms: ["conference board", "leading indicators"]
  },
  {
    slug: "consumer-sentiment",
    name: "Consumer Sentiment",
    shortName: "Sentiment",
    module: "growth",
    dimension: "growth",
    currentValue: 76.4,
    priorValue: 74.2,
    unit: "pts",
    frequency: "Monthly",
    source: {
      name: "University of Michigan via FRED",
      url: "https://fred.stlouisfed.org/series/UMCSENT",
      access: "official-free"
    },
    tooltips: growthTooltip(
      "Consumer sentiment surveys how households feel about current and future economic conditions.",
      "Use it to gauge spending resilience and inflation psychology. Sentiment improvements help cyclicals if income and jobs stay solid.",
      "Watch inflation expectations and labor market perceptions inside the survey."
    ),
    regimeTag: "confidence rebuilding",
    summary: "Households are feeling less defensive than they were.",
    advancedSummary:
      "Sentiment can diverge from spending for months, so it is best used as a confirmation tool.",
    watchList: ["Inflation expectations", "Labor differentials", "Retail follow-through"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "Twice monthly",
    provider: { type: "fred", seriesId: "UMCSENT" },
    trendSlope: 0.2,
    volatility: 0.4,
    minValue: 40,
    searchTerms: ["michigan sentiment", "consumer mood"]
  }
];

export const growthIndicators = buildIndicators(blueprints);
