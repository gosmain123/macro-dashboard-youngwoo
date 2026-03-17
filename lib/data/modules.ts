import type { MacroModule } from "@/types/macro";

export const macroModules: MacroModule[] = [
  {
    slug: "inflation",
    title: "Inflation",
    kicker: "Pricing pressure",
    description: "Track what is cooling, what is sticky, and what still threatens the disinflation path.",
    accent: "from-amber-300/30 via-rose-300/15 to-transparent"
  },
  {
    slug: "growth",
    title: "Growth",
    kicker: "Economic momentum",
    description: "Read demand, production, and confidence together instead of reacting to one noisy release.",
    accent: "from-cyan-300/30 via-sky-300/15 to-transparent"
  },
  {
    slug: "labor",
    title: "Labor",
    kicker: "Jobs and wages",
    description: "See whether labor is cooling gently, cracking, or staying too tight for inflation to settle.",
    accent: "from-emerald-300/30 via-lime-300/15 to-transparent"
  },
  {
    slug: "policy-liquidity",
    title: "Policy & Liquidity",
    kicker: "Plumbing",
    description: "Watch how the Fed, Treasury cash, and reserves change the amount of fuel in the system.",
    accent: "from-violet-300/25 via-cyan-300/10 to-transparent"
  },
  {
    slug: "rates-credit",
    title: "Rates & Credit",
    kicker: "The market's discount rate",
    description: "Yield curves and credit spreads tell you how financial conditions are changing beneath the surface.",
    accent: "from-slate-200/25 via-cyan-300/10 to-transparent"
  },
  {
    slug: "market-internals",
    title: "Market Internals",
    kicker: "Tape quality",
    description: "Measure whether investors are embracing risk broadly or hiding in crowded defensives.",
    accent: "from-fuchsia-300/25 via-amber-300/10 to-transparent"
  },
  {
    slug: "flows-positioning",
    title: "Flows & Positioning",
    kicker: "Who is already leaning?",
    description: "Positioning explains why markets can overshoot when the macro tape changes.",
    accent: "from-sky-300/25 via-indigo-300/10 to-transparent"
  },
  {
    slug: "global",
    title: "Global",
    kicker: "Cross-border confirmation",
    description: "Use offshore growth and policy signals to confirm whether the local macro story is truly broadening.",
    accent: "from-teal-300/25 via-blue-300/10 to-transparent"
  }
];
