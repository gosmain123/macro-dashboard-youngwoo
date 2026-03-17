import { buildIndicators, laborTooltip, type IndicatorBlueprint } from "@/lib/data/helpers";

const blueprints: IndicatorBlueprint[] = [
  {
    slug: "nonfarm-payrolls",
    name: "Nonfarm Payrolls",
    shortName: "Payrolls",
    module: "labor",
    dimension: "labor",
    currentValue: 182,
    priorValue: 171,
    unit: "k",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/PAYEMS",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Nonfarm payrolls measure the monthly change in employment across most of the economy.",
      "Use payrolls to judge labor demand. Moderate job creation is ideal because it supports growth without reigniting wage pressure.",
      "Watch revisions, average hours, and the unemployment rate rather than reacting to the headline alone."
    ),
    regimeTag: "healthy hiring",
    summary: "Job growth is cooling from boom levels but remains expansionary.",
    advancedSummary:
      "The best setup for markets is steady payroll growth with falling openings and stable unemployment.",
    watchList: ["Revisions", "Unemployment rate", "Hours worked"],
    signalScore: 0.6,
    tone: "positive",
    releaseCadence: "Monthly, first Friday",
    provider: { type: "fred", seriesId: "PAYEMS" },
    trendSlope: 2,
    volatility: 6,
    minValue: -300,
    searchTerms: ["jobs report", "nfp"]
  },
  {
    slug: "unemployment-rate",
    name: "Unemployment Rate",
    shortName: "Unemployment",
    module: "labor",
    dimension: "labor",
    currentValue: 4.1,
    priorValue: 4,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/UNRATE",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "The unemployment rate measures the share of the labor force actively seeking work but not employed.",
      "Use it to spot slack emerging in the labor market. A gentle rise is manageable; a fast rise usually changes the whole macro regime.",
      "Watch participation, claims, and payroll revisions."
    ),
    regimeTag: "gentle rebalancing",
    summary: "Labor slack is rising only gradually, not abruptly.",
    advancedSummary:
      "What matters is speed. A slow drift higher is compatible with soft landing, while a sudden jump is not.",
    watchList: ["Initial claims", "Participation rate", "Sahm-style risk checks"],
    signalScore: -0.2,
    tone: "neutral",
    releaseCadence: "Monthly, first Friday",
    provider: { type: "fred", seriesId: "UNRATE" },
    trendSlope: 0.02,
    volatility: 0.03,
    minValue: 2,
    searchTerms: ["jobless rate", "labor slack"]
  },
  {
    slug: "participation-rate",
    name: "Labor Force Participation Rate",
    shortName: "Participation",
    module: "labor",
    dimension: "labor",
    currentValue: 62.8,
    priorValue: 62.7,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/CIVPART",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Participation measures the share of the working-age population either employed or looking for work.",
      "Use higher participation as a supply-side release valve. It lets hiring continue without the same inflation pressure from worker scarcity.",
      "Watch prime-age participation and whether wage growth cools alongside improvement."
    ),
    regimeTag: "supply improving",
    summary: "Labor supply is helping the economy cool gracefully.",
    advancedSummary:
      "This is one of the cleanest soft-landing supports because it improves labor balance without demand destruction.",
    watchList: ["Prime-age participation", "Wage growth", "Openings-to-unemployed ratio"],
    signalScore: 0.5,
    tone: "positive",
    releaseCadence: "Monthly, first Friday",
    provider: { type: "fred", seriesId: "CIVPART" },
    trendSlope: 0.02,
    volatility: 0.02,
    minValue: 55,
    searchTerms: ["labor supply", "participation"]
  },
  {
    slug: "initial-claims",
    name: "Initial Jobless Claims",
    shortName: "Initial Claims",
    module: "labor",
    dimension: "labor",
    currentValue: 224,
    priorValue: 229,
    unit: "k",
    frequency: "Weekly",
    source: {
      name: "DOL via FRED",
      url: "https://fred.stlouisfed.org/series/ICSA",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Initial claims count new filings for unemployment benefits.",
      "Use claims as the fastest labor stress gauge. Rising claims usually show up before payrolls deteriorate materially.",
      "Watch the four-week average and whether continuing claims confirm the move."
    ),
    regimeTag: "no crack yet",
    summary: "Layoff pressure remains contained.",
    advancedSummary:
      "Claims are noisy week to week, so the trend and geographic spread matter more than one spike.",
    watchList: ["Four-week average", "Continuing claims", "Hiring intentions"],
    signalScore: 0.4,
    tone: "positive",
    releaseCadence: "Weekly, Thursdays",
    provider: { type: "fred", seriesId: "ICSA" },
    trendSlope: -0.2,
    volatility: 2,
    minValue: 150,
    searchTerms: ["jobless claims", "weekly layoffs"]
  },
  {
    slug: "continuing-claims",
    name: "Continuing Claims",
    shortName: "Continuing Claims",
    module: "labor",
    dimension: "labor",
    currentValue: 1.84,
    priorValue: 1.85,
    unit: "m",
    frequency: "Weekly",
    source: {
      name: "DOL via FRED",
      url: "https://fred.stlouisfed.org/series/CCSA",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Continuing claims measure how many people remain on unemployment benefits after the first filing.",
      "Use it to judge whether unemployed workers are finding jobs quickly. A higher level can signal slower rehiring even if layoffs are not exploding.",
      "Watch initial claims and hiring surveys for confirmation."
    ),
    regimeTag: "reemployment slightly slower",
    summary: "The labor market is cooling at the margin, not unraveling.",
    advancedSummary:
      "This series often turns before payroll weakness becomes obvious, especially late in the cycle.",
    watchList: ["Initial claims", "Temporary help jobs", "Hiring rates"],
    signalScore: -0.1,
    tone: "neutral",
    releaseCadence: "Weekly, Thursdays",
    provider: { type: "fred", seriesId: "CCSA" },
    trendSlope: 0.004,
    volatility: 0.01,
    minValue: 1,
    searchTerms: ["continuing unemployment", "claims level"]
  },
  {
    slug: "jolts-openings",
    name: "JOLTS Job Openings",
    shortName: "JOLTS Openings",
    module: "labor",
    dimension: "labor",
    currentValue: 8.4,
    priorValue: 8.6,
    unit: "m",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/JTSJOL",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "JOLTS openings estimate posted job vacancies across the economy.",
      "Use falling openings as a cleaner labor-cooling signal than layoffs. It reduces wage pressure without necessarily hurting households immediately.",
      "Watch quits, hires, and the openings-to-unemployed ratio."
    ),
    regimeTag: "cooler demand for workers",
    summary: "Labor demand is easing in a mostly healthy way.",
    advancedSummary:
      "This is one of the better soft-landing signals because openings can fall materially before unemployment rises.",
    watchList: ["Quits rate", "Payrolls", "Openings-to-unemployed"],
    signalScore: -0.5,
    tone: "positive",
    releaseCadence: "Monthly, early month",
    provider: { type: "fred", seriesId: "JTSJOL" },
    trendSlope: -0.06,
    volatility: 0.05,
    minValue: 4,
    searchTerms: ["job openings", "vacancies", "jolts"]
  },
  {
    slug: "quits-rate",
    name: "Quits Rate",
    shortName: "Quits",
    module: "labor",
    dimension: "labor",
    currentValue: 2.1,
    priorValue: 2.2,
    unit: "%",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/JTSQUR",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "The quits rate measures how willingly workers are leaving jobs on their own.",
      "Use it as a confidence and wage-bargaining proxy. A lower quits rate usually means workers feel less pricing power in the labor market.",
      "Watch openings and wage growth to see if labor bargaining power is fading smoothly."
    ),
    regimeTag: "bargaining power cooling",
    summary: "Workers are a bit less willing to jump jobs, which helps wage pressure cool.",
    advancedSummary:
      "A falling quits rate is healthy if payroll growth stays positive. It is more concerning when it drops alongside rising claims.",
    watchList: ["AHE", "Openings", "Hiring rate"],
    signalScore: -0.3,
    tone: "positive",
    releaseCadence: "Monthly, early month",
    provider: { type: "fred", seriesId: "JTSQUR" },
    trendSlope: -0.02,
    volatility: 0.02,
    minValue: 1,
    searchTerms: ["job hopping", "worker confidence"]
  },
  {
    slug: "average-weekly-hours",
    name: "Average Weekly Hours",
    shortName: "Hours Worked",
    module: "labor",
    dimension: "labor",
    currentValue: 34.4,
    priorValue: 34.3,
    unit: "hours",
    frequency: "Monthly",
    source: {
      name: "BLS via FRED",
      url: "https://fred.stlouisfed.org/series/AWHAETP",
      access: "official-free"
    },
    tooltips: laborTooltip(
      "Average weekly hours tracks how long employees are working before firms change headcount aggressively.",
      "Use it as an early-cycle labor indicator. Firms often cut hours first, then payrolls if demand worsens.",
      "Watch temporary help, payroll breadth, and claims for escalation."
    ),
    regimeTag: "hours stabilizing",
    summary: "Employers are not broadly slashing labor demand.",
    advancedSummary:
      "A rebound in hours often precedes firmer production and payroll momentum.",
    watchList: ["Temp help jobs", "Industrial production", "Claims"],
    signalScore: 0.3,
    tone: "positive",
    releaseCadence: "Monthly, first Friday",
    provider: { type: "fred", seriesId: "AWHAETP" },
    trendSlope: 0.01,
    volatility: 0.02,
    minValue: 30,
    searchTerms: ["hours worked", "weekly hours"]
  }
];

export const laborIndicators = buildIndicators(blueprints);
