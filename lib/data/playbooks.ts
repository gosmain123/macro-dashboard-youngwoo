import type { PlaybookScenario } from "@/types/macro";

export const playbooks: PlaybookScenario[] = [
  {
    slug: "soft-landing",
    title: "Soft Landing",
    summary: "Growth slows but does not break, inflation cools enough, and credit stays orderly.",
    marketPlaybook:
      "Look for cooler core inflation, contained claims, stable payrolls, and credit spreads that do not widen materially.",
    riskWatch:
      "The call weakens fast if claims rise and HY spreads start confirming stress instead of staying calm.",
    dashboardFocus: ["Core PCE cooling", "Claims contained", "ISM stabilizing", "HY spreads calm"]
  },
  {
    slug: "reflation",
    title: "Reflation",
    summary: "Growth firms again while inflation stops cooling cleanly, pushing yields and policy expectations back up.",
    marketPlaybook:
      "Look for stronger ISM, firmer payrolls, sticky core inflation, and 10Y yields moving higher without credit stress.",
    riskWatch:
      "If the front end reprices sharply and credit stops behaving, reflation can turn into a policy-tightening scare.",
    dashboardFocus: ["ISM re-accelerating", "Payrolls firm", "Core inflation sticky", "10Y rising"]
  },
  {
    slug: "hard-landing",
    title: "Hard Landing",
    summary: "Labor and growth data deteriorate together and credit markets stop giving the economy the benefit of the doubt.",
    marketPlaybook:
      "Look for weaker payrolls, rising claims, softer ISM, a falling 2Y, and HY spreads that widen with the macro stress.",
    riskWatch:
      "Do not call hard landing from one weak print if revisions, hours, and credit do not confirm it.",
    dashboardFocus: ["Claims rising", "Payrolls weakening", "ISM below 50", "HY widening"]
  },
  {
    slug: "stagflation-lite",
    title: "Stagflation-Lite",
    summary: "Growth cools but inflation stays sticky enough to keep policy and real yields uncomfortably high.",
    marketPlaybook:
      "Look for softening growth data, sticky core inflation, elevated 2Y and real yields, and only gradual deterioration in credit.",
    riskWatch:
      "This regime is easy to misread because both growth fear and inflation pressure are present at the same time.",
    dashboardFocus: ["Core inflation sticky", "Growth softening", "2Y still elevated", "Credit only slowly worsening"]
  }
];
