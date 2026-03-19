import type { WorkflowHeadlineItem } from "@/types/macro";

export type ReleaseSnapshotInput = {
  indicatorSlug: string;
  releaseDate: string;
  sourceName: string;
  sourceUrl: string;
  consensusValue?: number | null;
  revisedFrom?: number | null;
  revisedTo?: number | null;
  linkedIndicators: string[];
  whyItMatters: string;
};

export const releaseSnapshotInputs: ReleaseSnapshotInput[] = [
  {
    indicatorSlug: "cpi-headline",
    releaseDate: "2026-03-11",
    sourceName: "BLS CPI release",
    sourceUrl: "https://www.bls.gov/news.release/cpi.nr0.htm",
    consensusValue: 2.5,
    linkedIndicators: ["core-cpi", "us-2y-treasury", "wti-oil"],
    whyItMatters: "Headline CPI still resets front-end rate expectations faster than almost any other scheduled macro release."
  },
  {
    indicatorSlug: "core-cpi",
    releaseDate: "2026-03-11",
    sourceName: "BLS CPI release",
    sourceUrl: "https://www.bls.gov/news.release/cpi.nr0.htm",
    linkedIndicators: ["cpi-headline", "avg-hourly-earnings", "us-2y-treasury"],
    whyItMatters: "Core CPI remains the cleaner read on sticky services pressure and the pace of the last-mile disinflation."
  },
  {
    indicatorSlug: "ppi-final-demand",
    releaseDate: "2026-03-18",
    sourceName: "BLS PPI release",
    sourceUrl: "https://www.bls.gov/news.release/ppi.nr0.htm",
    linkedIndicators: ["core-pce", "us-2y-treasury", "wti-oil"],
    whyItMatters: "PPI helps investors judge whether pipeline inflation is easing or threatening to bleed back into PCE."
  },
  {
    indicatorSlug: "core-pce",
    releaseDate: "2026-03-13",
    sourceName: "BEA Personal Income and Outlays",
    sourceUrl: "https://www.bea.gov/index.php/news/schedule/full",
    linkedIndicators: ["cpi-headline", "us-2y-treasury", "fed-funds-upper"],
    whyItMatters: "Core PCE maps most directly into the Fed reaction function and tends to anchor medium-term rate-cut pricing."
  },
  {
    indicatorSlug: "nonfarm-payrolls",
    releaseDate: "2026-03-06",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm",
    linkedIndicators: ["unemployment-rate", "avg-hourly-earnings", "initial-claims"],
    whyItMatters: "Payrolls remain the single densest macro release for judging whether growth is cooling or cracking."
  },
  {
    indicatorSlug: "unemployment-rate",
    releaseDate: "2026-03-06",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm",
    linkedIndicators: ["nonfarm-payrolls", "initial-claims", "avg-hourly-earnings"],
    whyItMatters: "The unemployment rate matters most when it changes regime quickly enough to alter the market's recession probability."
  },
  {
    indicatorSlug: "avg-hourly-earnings",
    releaseDate: "2026-03-06",
    sourceName: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/news.release/empsit.nr0.htm",
    linkedIndicators: ["nonfarm-payrolls", "core-cpi", "core-pce"],
    whyItMatters: "Average hourly earnings remain one of the cleanest monthly checks on labor-driven inflation persistence."
  },
  {
    indicatorSlug: "initial-claims",
    releaseDate: "2026-03-19",
    sourceName: "Department of Labor weekly claims",
    sourceUrl: "https://www.dol.gov/newsroom/releases/eta",
    linkedIndicators: ["nonfarm-payrolls", "unemployment-rate"],
    whyItMatters: "Claims are the fastest official labor series and often catch labor stress before payrolls visibly roll over."
  },
  {
    indicatorSlug: "ism-manufacturing",
    releaseDate: "2026-03-02",
    sourceName: "ISM Manufacturing PMI",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/february/",
    consensusValue: 51.8,
    linkedIndicators: ["industrial-production", "durable-goods", "us-10y-treasury"],
    whyItMatters: "ISM manufacturing gives investors an early read on whether the hard-data cycle is improving enough to support cyclicals."
  },
  {
    indicatorSlug: "ism-services",
    releaseDate: "2026-03-04",
    sourceName: "ISM Services PMI",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/february/",
    consensusValue: 53.6,
    linkedIndicators: ["retail-sales", "nonfarm-payrolls", "us-10y-treasury"],
    whyItMatters: "Services PMI matters because it sits closest to the part of the economy that keeps the soft-landing story alive."
  },
  {
    indicatorSlug: "industrial-production",
    releaseDate: "2026-03-16",
    sourceName: "Federal Reserve G.17",
    sourceUrl: "https://www.federalreserve.gov/releases/G17/default.htm",
    linkedIndicators: ["ism-manufacturing", "durable-goods", "us-10y-treasury"],
    whyItMatters: "Industrial production tells investors whether survey strength is translating into actual output."
  }
];

export const curatedHeadlines: WorkflowHeadlineItem[] = [
  {
    id: "headline-ppi-official",
    bucket: "Official releases",
    publishedAt: "2026-03-18T12:30:00Z",
    sourceName: "BLS",
    sourceUrl: "https://www.bls.gov/news.release/ppi.nr0.htm",
    title: "Producer inflation stayed firm in the latest official PPI release.",
    whyItMatters: "Pipeline pressure matters because it can keep Core PCE and front-end yields from fully relaxing even when CPI noise improves.",
    linkedIndicators: ["ppi-final-demand", "core-pce", "us-2y-treasury"]
  },
  {
    id: "headline-ism-services-official",
    bucket: "Official releases",
    publishedAt: "2026-03-04T15:00:00Z",
    sourceName: "ISM",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/february/",
    title: "ISM services signaled that the broad growth backdrop is still expanding.",
    whyItMatters: "A firm services PMI helps investors separate a genuine growth scare from a temporary survey wobble.",
    linkedIndicators: ["ism-services", "retail-sales", "us-10y-treasury"]
  },
  {
    id: "headline-fed-fomc",
    bucket: "Fed / central bank",
    publishedAt: "2026-03-18T18:00:00Z",
    sourceName: "Federal Reserve",
    sourceUrl: "https://www.federalreserve.gov/newsevents/pressreleases/2026-press.htm",
    title: "The Fed kept the focus on cleaner inflation progress before easing further.",
    whyItMatters: "The statement and press-conference tone shape the discount rate for the whole dashboard, especially the 2Y and growth-sensitive equities.",
    linkedIndicators: ["fed-funds-upper", "core-pce", "us-2y-treasury"]
  },
  {
    id: "headline-gdpnow-fed",
    bucket: "Fed / central bank",
    publishedAt: "2026-03-19T11:00:00Z",
    sourceName: "Atlanta Fed",
    sourceUrl: "https://www.atlantafed.org/research-and-data/data/gdpnow",
    title: "GDPNow remains one of the fastest checks on whether the U.S. growth regime is slipping or stabilizing.",
    whyItMatters: "When GDPNow holds up alongside ISM and labor data, it becomes harder for the market to price an imminent growth scare.",
    linkedIndicators: ["gdp-nowcast", "ism-manufacturing", "retail-sales"]
  },
  {
    id: "headline-reuters-markets",
    bucket: "Market interpretation",
    publishedAt: "2026-03-19T09:00:00Z",
    sourceName: "Reuters Markets",
    sourceUrl: "https://www.reuters.com/markets/us/",
    title: "Rates desks are still treating inflation pipeline risk as the key obstacle to a clean dovish repricing.",
    whyItMatters: "That framing is what keeps the 2Y, the dollar, and equity duration sensitive to every inflation release on the radar.",
    linkedIndicators: ["us-2y-treasury", "dxy", "ppi-final-demand"]
  },
  {
    id: "headline-ft-markets",
    bucket: "Market interpretation",
    publishedAt: "2026-03-19T07:30:00Z",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com/markets",
    title: "Oil and global rate volatility are still the fastest ways for the macro tape to turn more hostile.",
    whyItMatters: "This is the cross-asset check on whether a benign disinflation narrative can survive the next supply or policy shock.",
    linkedIndicators: ["wti-oil", "move-index", "us-10y-treasury"]
  },
  {
    id: "headline-wsj-economy",
    bucket: "Market interpretation",
    publishedAt: "2026-03-19T10:30:00Z",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com/economy",
    title: "The macro debate has shifted toward how sticky the last mile of inflation remains.",
    whyItMatters: "That is the decision point for investors deciding whether to lean into soft-landing risk or stay defensive on rates and credit.",
    linkedIndicators: ["core-pce", "core-cpi", "hy-spreads"]
  }
];
