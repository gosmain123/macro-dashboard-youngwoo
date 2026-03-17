import type { PlaybookScenario } from "@/types/macro";

export const playbooks: PlaybookScenario[] = [
  {
    slug: "disinflation",
    title: "Disinflation",
    summary: "Growth holds up while inflation cools, allowing policy and valuation pressure to ease.",
    marketPlaybook:
      "Favor quality cyclicals, duration-sensitive growth, and credit that benefits from easier real-rate pressure.",
    riskWatch:
      "The main risk is declaring victory too early before services inflation really cooperates.",
    dashboardFocus: ["Core PCE", "Shelter", "2Y Yield", "Breadth"]
  },
  {
    slug: "re-acceleration",
    title: "Re-acceleration",
    summary: "Growth re-accelerates enough to lift yields and revive inflation concerns.",
    marketPlaybook:
      "Prefer value, financials, selective cyclicals, and inflation hedges over long-duration growth.",
    riskWatch:
      "If growth re-accelerates alongside sticky inflation, the Fed can stay restrictive longer than markets expect.",
    dashboardFocus: ["GDP Now", "ISM Manufacturing", "Oil", "2Y Yield"]
  },
  {
    slug: "growth-scare",
    title: "Growth Scare",
    summary: "Leading data softens quickly and markets start pricing faster policy relief.",
    marketPlaybook:
      "Rotate toward duration, defensives, and quality balance sheets while watching whether spreads confirm the scare.",
    riskWatch:
      "If credit starts to widen materially, the move stops being a benign rate-cut trade and becomes a genuine risk-off regime.",
    dashboardFocus: ["Initial Claims", "3m10y", "HY Spreads", "Consumer Sentiment"]
  },
  {
    slug: "stagflation",
    title: "Stagflation",
    summary: "Growth slows while inflation stays sticky, leaving policymakers trapped.",
    marketPlaybook:
      "Reduce multiple exposure, prioritize pricing power, commodities, and selective real assets, and stay careful on credit.",
    riskWatch:
      "This is the hardest regime because both bonds and equities can struggle at the same time.",
    dashboardFocus: ["Core CPI", "Oil", "Retail Sales", "Real Yield"]
  },
  {
    slug: "liquidity-squeeze",
    title: "Liquidity Squeeze",
    summary: "Financial plumbing tightens before the macro data fully catches up.",
    marketPlaybook:
      "Respect higher volatility, narrower leadership, and the possibility that weak liquidity forces de-risking even without recession data.",
    riskWatch:
      "Liquidity stress tends to hit crowded trades and lower-quality balance sheets first.",
    dashboardFocus: ["Net Liquidity", "TGA", "MOVE", "Crowding Flags"]
  }
];
