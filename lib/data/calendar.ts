import type { CalendarEvent } from "@/types/macro";

export const calendarEvents: CalendarEvent[] = [
  {
    id: "fomc-may",
    title: "FOMC Rate Decision",
    module: "policy-liquidity",
    moduleLabel: "Policy Expectations",
    moduleHref: "/policy-expectations",
    playbookLabel: "2Y / 10Y / Curve Chain",
    playbookHref: "/playbook#rates-curve",
    category: "central bank",
    date: "2026-05-06",
    timeLabel: "2:00 PM ET",
    importance: "high",
    whyItMatters:
      "The Fed sets the price of money and shapes how aggressively markets discount future earnings and growth.",
    whatToWatch:
      "Watch the statement, press conference tone, and dots for whether easing remains gradual or becomes more urgent."
  },
  {
    id: "treasury-10y-auction",
    title: "10Y Treasury Auction",
    module: "rates-credit",
    moduleLabel: "Rates & Credit",
    moduleHref: "/rates-credit",
    playbookLabel: "2Y / 10Y / Curve Chain",
    playbookHref: "/playbook#rates-curve",
    category: "auction",
    date: "2026-03-19",
    timeLabel: "1:00 PM ET",
    importance: "medium",
    whyItMatters:
      "Auction demand affects long-end yields, term premium, and the valuation pressure on duration-heavy assets.",
    whatToWatch:
      "Watch the tail, indirect bidder participation, and whether weak demand spills into mortgage rates and real yields."
  },
  {
    id: "pce-release",
    title: "Core PCE Release",
    module: "inflation",
    moduleLabel: "Inflation",
    moduleHref: "/inflation",
    playbookLabel: "CPI / Core PCE Chain",
    playbookHref: "/playbook#cpi-core-pce",
    category: "macro release",
    date: "2026-04-09",
    timeLabel: "8:30 AM ET",
    importance: "high",
    whyItMatters:
      "Core PCE is the inflation gauge most closely tied to the Fed reaction function.",
    whatToWatch:
      "Watch the monthly pace, revisions, and services ex housing to judge whether policy easing stays on track."
  },
  {
    id: "nfp-release",
    title: "Nonfarm Payrolls",
    module: "labor",
    moduleLabel: "Labor",
    moduleHref: "/labor",
    playbookLabel: "Payrolls / Unemployment / Wages Chain",
    playbookHref: "/playbook#payrolls-unemployment-wages",
    category: "macro release",
    date: "2026-04-03",
    timeLabel: "8:30 AM ET",
    importance: "high",
    whyItMatters:
      "Payrolls, unemployment, wages, and hours all hit at once, making this the single densest labor update each month.",
    whatToWatch:
      "Watch breadth, revisions, and wages. Strong jobs with cooler pay is the market's preferred combination."
  },
  {
    id: "cpi-release",
    title: "CPI Report",
    module: "inflation",
    moduleLabel: "Inflation",
    moduleHref: "/inflation",
    playbookLabel: "CPI / Core PCE Chain",
    playbookHref: "/playbook#cpi-core-pce",
    category: "macro release",
    date: "2026-04-10",
    timeLabel: "8:30 AM ET",
    importance: "high",
    whyItMatters:
      "CPI can reprice front-end yields fast because it immediately shifts inflation and Fed expectations.",
    whatToWatch:
      "Watch core services, shelter, and the three-month annualized trend before declaring the print benign or hot."
  },
  {
    id: "ppi-release",
    title: "PPI Report",
    module: "inflation",
    moduleLabel: "Inflation",
    moduleHref: "/inflation",
    playbookLabel: "CPI / Core PCE Chain",
    playbookHref: "/playbook#cpi-core-pce",
    category: "macro release",
    date: "2026-04-14",
    timeLabel: "8:30 AM ET",
    importance: "high",
    whyItMatters:
      "PPI is an early pipeline read for inflation pressure that can shape expectations for future CPI and Core PCE prints.",
    whatToWatch:
      "Watch core measures, revisions, and whether goods pressure starts bleeding back into the consumer inflation pipeline."
  },
  {
    id: "boj-meeting",
    title: "BoJ Policy Meeting",
    module: "global",
    moduleLabel: "FX & Commodities",
    moduleHref: "/global-spillover",
    playbookLabel: "2Y / 10Y / Curve Chain",
    playbookHref: "/playbook#rates-curve",
    category: "central bank",
    date: "2026-04-16",
    timeLabel: "Tokyo session",
    importance: "medium",
    whyItMatters:
      "Unexpected BoJ tightening can spill into global duration, yen carry trades, and cross-asset volatility.",
    whatToWatch:
      "Watch yield-curve control language, inflation outlook changes, and yen reaction."
  },
  {
    id: "thirteen-f-deadline",
    title: "13F Filing Deadline",
    module: "flows-positioning",
    moduleLabel: "Positioning",
    moduleHref: "/positioning",
    playbookLabel: "IG / HY Spreads Chain",
    playbookHref: "/playbook#ig-hy-spreads",
    category: "filing",
    date: "2026-05-15",
    timeLabel: "After close",
    importance: "medium",
    whyItMatters:
      "13F filings show where large institutional investors were concentrated, which helps judge crowding and sponsorship.",
    whatToWatch:
      "Watch overlap in consensus positions and whether new ownership is broadening or becoming more fragile."
  }
];
