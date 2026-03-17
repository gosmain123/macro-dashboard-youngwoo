import { buildIndicators, inflationTooltip, laborTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "cpi-headline",
    name: "CPI Headline",
    shortName: "Headline CPI",
    module: "inflation",
    dimension: "inflation",
    currentValue: 3.1,
    priorValue: 3.3,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/CPIAUCSL",
      access: "official-free"
    },
    tooltips: inflationTooltip(
      "The all-items Consumer Price Index measures the overall change in prices paid by urban consumers.",
      "Use the year-over-year trend to judge the broad disinflation path, then confirm with the three-month annualized pace before calling a turn.",
      "Watch core CPI, oil, and shelter because headline can swing sharply on energy."
    ),
    regimeTag: "disinflation",
    summary: "Broad inflation is cooling, but the last mile still depends on services.",
    advancedSummary:
      "Goods disinflation is doing most of the work. Durable easing needs slower shelter and a softer services basket.",
    watchList: ["Shelter rollover", "Gasoline base effects", "Three-month annualized CPI"],
    signalScore: -0.9,
    tone: "positive",
    overlays: ["Three-month annualized CPI"],
    releaseCadence: "Monthly, usually mid-month",
    provider: { type: "fred", seriesId: "CPIAUCSL" },
    trendSlope: -0.06,
    volatility: 0.04,
    minValue: 0.5,
    searchTerms: ["consumer prices", "headline inflation"]
  },
  {
    slug: "core-cpi",
    name: "Core CPI",
    shortName: "Core CPI",
    module: "inflation",
    dimension: "inflation",
    currentValue: 3.4,
    priorValue: 3.6,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/CPILFESL",
      access: "official-free"
    },
    tooltips: inflationTooltip(
      "Core CPI strips out food and energy to reveal underlying inflation pressure.",
      "Use it to assess sticky inflation. If core is slowing while labor stays healthy, markets usually gain confidence in a soft landing.",
      "Watch services ex housing and average hourly earnings for persistence."
    ),
    regimeTag: "sticky but easing",
    summary: "Underlying inflation is moderating, but not fast enough for easy policy confidence.",
    advancedSummary:
      "Housing and labor-linked services remain the key friction points. A cleaner downtrend matters more than one soft print.",
    watchList: ["Supercore", "Rent measures", "Wage momentum"],
    signalScore: -0.6,
    tone: "positive",
    overlays: ["Core services"],
    releaseCadence: "Monthly, usually mid-month",
    provider: { type: "fred", seriesId: "CPILFESL" },
    trendSlope: -0.05,
    volatility: 0.03,
    minValue: 0.5,
    searchTerms: ["core inflation", "sticky prices"]
  },
  {
    slug: "ppi-final-demand",
    name: "PPI Final Demand",
    shortName: "PPI",
    module: "inflation",
    dimension: "inflation",
    currentValue: 2.2,
    priorValue: 2.4,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/PPIACO",
      access: "official-free"
    },
    tooltips: inflationTooltip(
      "Producer Price Index tracks price changes received by domestic producers for final demand.",
      "Use it as an early signal for pipeline inflation. A renewed PPI surge can feed into CPI and margins with a lag.",
      "Watch goods-sensitive categories, import prices, and shipping costs."
    ),
    regimeTag: "pipeline calm",
    summary: "Pipeline price pressure is no longer accelerating.",
    advancedSummary:
      "The producer side matters most when commodity rebounds or supply shocks threaten to bleed into consumer prices.",
    watchList: ["Commodity complex", "Import prices", "Goods margins"],
    signalScore: -0.5,
    tone: "positive",
    releaseCadence: "Monthly, usually before CPI",
    provider: { type: "fred", seriesId: "PPIACO" },
    trendSlope: -0.03,
    volatility: 0.05,
    minValue: -1,
    searchTerms: ["producer prices", "pipeline inflation"]
  },
  {
    slug: "core-pce",
    name: "Core PCE",
    shortName: "Core PCE",
    module: "inflation",
    dimension: "inflation",
    currentValue: 2.8,
    priorValue: 2.9,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BEA via FRED",
      url: "https://fred.stlouisfed.org/series/PCEPILFE",
      access: "official-free"
    },
    tooltips: inflationTooltip(
      "Core Personal Consumption Expenditures excludes food and energy and is the Fed's preferred inflation gauge.",
      "Use it to line up with Fed reaction function. If core PCE keeps drifting lower, policymakers can ease without looking reckless.",
      "Watch the monthly control group, services inflation, and revisions."
    ),
    regimeTag: "Fed-friendly cooling",
    summary: "The inflation measure the Fed cares most about is moving in the right direction.",
    advancedSummary:
      "Sustained progress here matters more than noisy CPI components because it maps directly to policy language.",
    watchList: ["Monthly core PCE", "PCE services ex housing", "Fed messaging"],
    signalScore: -0.8,
    tone: "positive",
    overlays: ["Fed target"],
    releaseCadence: "Monthly, late month",
    provider: { type: "fred", seriesId: "PCEPILFE" },
    trendSlope: -0.04,
    volatility: 0.02,
    minValue: 0.5,
    searchTerms: ["pce", "fed inflation gauge"]
  },
  {
    slug: "avg-hourly-earnings",
    name: "Average Hourly Earnings",
    shortName: "AHE",
    module: "inflation",
    dimension: "labor",
    currentValue: 3.8,
    priorValue: 4.0,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/CES0500000003",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Average hourly earnings tracks wage growth for private payroll workers.",
      "Use it as the cleanest wage-pressure proxy in the monthly jobs report. Cooling wages support disinflation without requiring job losses.",
      "Watch average hours, payroll breadth, and the Atlanta Fed wage tracker."
    ),
    regimeTag: "wage cooling",
    summary: "Wage growth is easing enough to reduce inflation pressure without signaling a hard landing yet.",
    advancedSummary:
      "Markets prefer wage cooling driven by better labor supply rather than collapsing labor demand.",
    watchList: ["Payroll breadth", "Hours worked", "Quits rate"],
    signalScore: -0.4,
    tone: "positive",
    releaseCadence: "Monthly, first Friday",
    provider: { type: "fred", seriesId: "CES0500000003" },
    trendSlope: -0.05,
    volatility: 0.04,
    minValue: 1,
    searchTerms: ["wages", "earnings", "pay growth"]
  },
  {
    slug: "five-year-breakeven",
    name: "5Y Breakeven Inflation",
    shortName: "5Y Breakeven",
    module: "inflation",
    dimension: "inflation",
    currentValue: 2.3,
    priorValue: 2.2,
    unit: "%",
    frequency: "Daily",
    source: {
      name: "FRED",
      url: "https://fred.stlouisfed.org/series/T5YIE",
      access: "official-free"
    },
    tooltips: inflationTooltip(
      "The five-year breakeven is the bond market's implied average inflation expectation over the next five years.",
      "Use it to compare survey and market inflation expectations. Stable breakevens help risk assets because they imply inflation is still anchored.",
      "Watch real yields and oil alongside breakevens to separate inflation fear from growth stress."
    ),
    regimeTag: "anchored expectations",
    summary: "The bond market still believes medium-term inflation will stay under control.",
    advancedSummary:
      "A sharp rise in breakevens with falling real yields usually signals inflation fear. A drop with rising real yields can be growth stress instead.",
    watchList: ["10Y real yields", "Oil trend", "Treasury term premium"],
    signalScore: -0.2,
    tone: "neutral",
    releaseCadence: "Daily",
    provider: { type: "fred", seriesId: "T5YIE" },
    trendSlope: 0.01,
    volatility: 0.03,
    minValue: 1,
    searchTerms: ["inflation expectations", "breakeven"]
  },
  {
    slug: "shelter-inflation",
    name: "Shelter Inflation",
    shortName: "Shelter",
    module: "inflation",
    dimension: "inflation",
    currentValue: 4.9,
    priorValue: 5.2,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS derived feed",
      access: "licensed-manual"
    },
    tooltips: inflationTooltip(
      "Shelter inflation captures rent and owners' equivalent rent inside CPI.",
      "Use it because shelter is a large CPI weight. It often lags real-time rent data, so it can keep headline inflation sticky after the economy has cooled.",
      "Watch market rent trackers and services ex housing for evidence that official shelter will keep rolling over."
    ),
    regimeTag: "lagging lower",
    summary: "Shelter remains elevated, but the direction is finally helping rather than hurting disinflation.",
    advancedSummary:
      "This is one of the most lagged pieces of CPI, so the level matters less than whether the rollover is durable.",
    watchList: ["Private rent trackers", "OER momentum", "Services ex housing"],
    signalScore: -0.5,
    tone: "positive",
    releaseCadence: "Monthly, with CPI",
    provider: { type: "manual" },
    trendSlope: -0.08,
    volatility: 0.05,
    minValue: 1,
    searchTerms: ["rent inflation", "owners equivalent rent"]
  },
  {
    slug: "services-ex-housing",
    name: "Services ex Housing",
    shortName: "Supercore",
    module: "inflation",
    dimension: "inflation",
    currentValue: 3.7,
    priorValue: 3.9,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "Derived macro feed",
      access: "licensed-manual"
    },
    tooltips: inflationTooltip(
      "Services ex housing isolates labor-heavy services prices after removing shelter.",
      "Use it as the cleanest gauge of labor-linked inflation persistence. The Fed watches this closely when deciding if wage pressure is really easing.",
      "Watch wages, job openings, and healthcare or transport services."
    ),
    regimeTag: "last mile",
    summary: "The hardest part of inflation is easing, but it still needs more progress.",
    advancedSummary:
      "This series is where the final battle against sticky inflation often shows up first.",
    watchList: ["AHE", "JOLTS openings", "Core PCE services"],
    signalScore: -0.3,
    tone: "neutral",
    releaseCadence: "Monthly, derived after CPI",
    provider: { type: "manual" },
    trendSlope: -0.05,
    volatility: 0.04,
    minValue: 1,
    searchTerms: ["supercore", "services inflation"]
  }
];

export const inflationIndicators = buildIndicators(blueprints);
