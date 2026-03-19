export type FlowTone = "slate" | "cyan" | "emerald" | "amber" | "rose";

export type MacroFlowDetail = {
  id: string;
  title: string;
  tone: FlowTone;
  href?: string;
  hrefLabel?: string;
  whyItMatters: string;
  cases: Array<{
    label: string;
    detail: string;
  }>;
  checkNext: string[];
  commonMistakes: string[];
  marketView: string;
};

export type FlowNode = {
  detailId: string;
  label: string;
  sublabel?: string;
  tone: FlowTone;
};

export type FlowLane = {
  id: string;
  title: string;
  nodes: FlowNode[];
};

export type FlowDecisionOutcome = {
  branch: string;
  question: FlowNode;
  outcomes: [FlowNode, FlowNode];
};

export const macroFlowDetails: Record<string, MacroFlowDetail> = {
  "regime-overview": {
    id: "regime-overview",
    title: "Regime first",
    tone: "cyan",
    href: "/",
    hrefLabel: "Open dashboard",
    whyItMatters: "The regime summary keeps one noisy print from hijacking the whole day.",
    cases: [
      {
        label: "If the regime is stable",
        detail: "Treat new prints as updates inside the same story until rates or credit disagree."
      },
      {
        label: "If the regime looks fragile",
        detail: "Use the next catalyst and the confirmation layer more carefully before making the call bigger."
      }
    ],
    checkNext: ["Calendar catalyst", "Core watchlist", "Workflow surprise"],
    commonMistakes: ["Starting with one release instead of the bigger backdrop"],
    marketView: "The regime frame is the anchor for the tentative macro view."
  },
  "calendar-catalyst": {
    id: "calendar-catalyst",
    title: "Catalyst check",
    tone: "amber",
    href: "/calendar",
    hrefLabel: "Open calendar",
    whyItMatters: "Knowing what can move the tape keeps the dashboard focused on the right event.",
    cases: [
      {
        label: "High-impact catalyst",
        detail: "Expect rates, credit, and the dollar to become the fastest confirmation layer."
      },
      {
        label: "Low-impact day",
        detail: "Lean more on the existing regime and cross-asset follow-through."
      }
    ],
    checkNext: ["Open the linked module", "Read the matching flow chain", "Check release timing"],
    commonMistakes: ["Treating every release as equally important"],
    marketView: "Catalyst priority tells you which indicator can realistically change the macro view today."
  },
  "core-watchlist": {
    id: "core-watchlist",
    title: "Core watchlist",
    tone: "slate",
    href: "/",
    hrefLabel: "Open watchlist",
    whyItMatters: "The watchlist narrows the day to a few indicators worth reading first.",
    cases: [
      {
        label: "Watchlist agrees with the regime",
        detail: "The path is probably unchanged until Workflow or credit says otherwise."
      },
      {
        label: "Watchlist disagrees",
        detail: "Move quickly to surprise/revision and rates confirmation before changing the view."
      }
    ],
    checkNext: ["Workflow", "Rates & Credit", "Macro Flow chain"],
    commonMistakes: ["Trying to read every page before reading the key signals"],
    marketView: "The watchlist is the shortest path from raw data to a usable daily view."
  },
  "workflow-surprise": {
    id: "workflow-surprise",
    title: "Surprise and revision",
    tone: "rose",
    href: "/workflow",
    hrefLabel: "Open workflow",
    whyItMatters: "Surprises and revisions usually matter more than the scheduled headline template.",
    cases: [
      {
        label: "Positive surprise",
        detail: "That may support the current story, but only if revisions and follow-through agree."
      },
      {
        label: "Negative surprise",
        detail: "That matters more when credit, rates, or breadth start confirming stress."
      }
    ],
    checkNext: ["Read the linked chain", "Check rates", "Check credit spreads"],
    commonMistakes: ["Ignoring revisions and reacting only to the first headline"],
    marketView: "Workflow is the bridge between the release list and the market reaction."
  },
  "rates-confirmation": {
    id: "rates-confirmation",
    title: "Rates and credit confirmation",
    tone: "emerald",
    href: "/rates-credit",
    hrefLabel: "Open rates & credit",
    whyItMatters: "Rates and credit tell you whether markets actually believe the macro story.",
    cases: [
      {
        label: "Confirmation is clean",
        detail: "The move has a higher chance of being a real macro signal."
      },
      {
        label: "Confirmation is mixed",
        detail: "Keep the view smaller and more conditional until cross-asset signals align."
      }
    ],
    checkNext: ["2Y Treasury", "Curve shape", "IG / HY spreads"],
    commonMistakes: ["Calling a regime turn before rates and credit respond"],
    marketView: "The confirmation layer decides whether a data point becomes a market view."
  },
  "cpi-core-pce": {
    id: "cpi-core-pce",
    title: "Inflation flow",
    tone: "amber",
    href: "/inflation",
    hrefLabel: "Open inflation",
    whyItMatters: "Inflation data changes the policy path, real yields, and valuation pressure faster than most other prints.",
    cases: [
      {
        label: "Hot core",
        detail: "That usually means stickier inflation pressure and a tougher easing path."
      },
      {
        label: "Cool core",
        detail: "That supports disinflation only if front-end yields and breakevens confirm it."
      }
    ],
    checkNext: ["Split headline vs core", "Check services and shelter", "Read the 2Y and real yields"],
    commonMistakes: ["Overreacting to energy noise", "Calling trend from one print"],
    marketView: "Hotter inflation leans hawkish and duration-negative; cooler inflation can support a softer-landing read."
  },
  "payrolls-unemployment-wages": {
    id: "payrolls-unemployment-wages",
    title: "Labor cooling flow",
    tone: "cyan",
    href: "/labor",
    hrefLabel: "Open labor",
    whyItMatters: "Payrolls, unemployment, and wages shape both the growth story and the inflation story.",
    cases: [
      {
        label: "Weak payrolls with calm wages",
        detail: "That can fit a benign slowdown rather than immediate recession."
      },
      {
        label: "Weak payrolls with softer hours and higher jobless rate",
        detail: "That is a more serious labor-cooling signal."
      }
    ],
    checkNext: ["Revisions", "Average hourly earnings", "Average weekly hours", "Claims"],
    commonMistakes: ["Calling recession from the payroll headline alone"],
    marketView: "Labor cooling without credit stress can still support a soft-landing interpretation."
  },
  "claims-early-warning": {
    id: "claims-early-warning",
    title: "Claims early warning",
    tone: "rose",
    href: "/labor",
    hrefLabel: "Open labor",
    whyItMatters: "Claims is the fastest official labor stress signal and often moves before payrolls fully roll over.",
    cases: [
      {
        label: "One-week spike",
        detail: "Treat it cautiously until continuing claims and broader labor data confirm it."
      },
      {
        label: "Persistent rise",
        detail: "That is a more meaningful early warning that labor demand is cracking."
      }
    ],
    checkNext: ["Continuing claims", "Payroll revisions", "HY spreads", "Defensives"],
    commonMistakes: ["Reading one noisy weekly print as a regime break"],
    marketView: "Sustained claims pressure makes the macro view more defensive when spreads widen too."
  },
  "ism-manufacturing-services": {
    id: "ism-manufacturing-services",
    title: "Growth turn flow",
    tone: "emerald",
    href: "/growth",
    hrefLabel: "Open growth",
    whyItMatters: "ISM is one of the fastest reads on whether growth direction is improving or deteriorating.",
    cases: [
      {
        label: "Headline improves with orders",
        detail: "That is more supportive for a real growth turn."
      },
      {
        label: "Headline improves without orders",
        detail: "That is weaker and needs harder data confirmation."
      }
    ],
    checkNext: ["New orders", "Retail sales", "Industrial production", "10Y yield"],
    commonMistakes: ["Using the headline alone without checking the internals"],
    marketView: "A cleaner ISM turn usually supports cyclicals, firmer yields, and a more constructive growth view."
  },
  "rates-curve": {
    id: "rates-curve",
    title: "Rates repricing flow",
    tone: "slate",
    href: "/policy-expectations",
    hrefLabel: "Open policy expectations",
    whyItMatters: "The 2Y, 10Y, and curve separate policy repricing from growth fear and inflation pressure.",
    cases: [
      {
        label: "Front-end leads",
        detail: "That usually means policy repricing."
      },
      {
        label: "Long end leads",
        detail: "That can mean discount-rate or inflation-pressure repricing instead."
      }
    ],
    checkNext: ["SOFR implied cuts", "Real yields", "Dollar", "Credit spreads"],
    commonMistakes: ["Reading every curve move as growth relief"],
    marketView: "The rates path helps decide whether the macro view is dovish, hawkish, or defensively growth-slowing."
  },
  "ig-hy-spreads": {
    id: "ig-hy-spreads",
    title: "Credit stress flow",
    tone: "rose",
    href: "/positioning",
    hrefLabel: "Open positioning",
    whyItMatters: "Credit is the trust layer that tells you whether markets accept the macro story.",
    cases: [
      {
        label: "Spreads stay calm",
        detail: "That supports a softer interpretation of weak macro data."
      },
      {
        label: "Spreads widen",
        detail: "That suggests the macro signal is becoming broader market stress."
      }
    ],
    checkNext: ["IG vs HY", "Breadth", "VIX", "Claims"],
    commonMistakes: ["Ignoring quiet credit deterioration while headline equities hold up"],
    marketView: "Credit stress can turn a slowdown view into a hard-landing warning."
  },
  "liquidity-path": {
    id: "liquidity-path",
    title: "Liquidity path",
    tone: "cyan",
    href: "/liquidity",
    hrefLabel: "Open liquidity",
    whyItMatters: "Liquidity explains why markets can stay resilient or suddenly tighten even when standard macro prints look mixed.",
    cases: [
      {
        label: "Net liquidity improving",
        detail: "That can cushion risk appetite and keep credit tighter."
      },
      {
        label: "Net liquidity worsening",
        detail: "That raises the chance that weak macro prints hit markets harder."
      }
    ],
    checkNext: ["TGA", "RRP", "Reserves", "Financial conditions", "HY spreads"],
    commonMistakes: ["Treating one liquidity series as the whole plumbing story"],
    marketView: "Liquidity improves or weakens the market's tolerance for the macro backdrop."
  },
  "global-spillover-path": {
    id: "global-spillover-path",
    title: "Global spillover path",
    tone: "amber",
    href: "/global-spillover",
    hrefLabel: "Open global layer",
    whyItMatters: "FX and commodities feed back into US inflation, growth, and financial conditions.",
    cases: [
      {
        label: "Dollar up, oil up",
        detail: "That is a tighter and more inflation-sensitive mix."
      },
      {
        label: "Dollar down, copper up",
        detail: "That is often a friendlier growth and liquidity mix."
      }
    ],
    checkNext: ["DXY", "Oil", "Copper", "USDCNH", "Rates"],
    commonMistakes: ["Reading commodity moves without checking the dollar or rates"],
    marketView: "Global spillovers can reinforce or challenge the domestic macro view."
  },
  "inflation-cooling-question": {
    id: "inflation-cooling-question",
    title: "Inflation cooling?",
    tone: "amber",
    whyItMatters: "This is the first split in the regime tree because inflation direction changes the policy backdrop.",
    cases: [
      {
        label: "Yes",
        detail: "The path can lean toward soft landing or hard landing depending on growth and credit."
      },
      {
        label: "No",
        detail: "The path can lean toward reflation or stagflation-lite depending on growth and spreads."
      }
    ],
    checkNext: ["Look at growth holding?", "Then check rates and spreads"],
    commonMistakes: ["Treating headline disinflation as enough without core confirmation"],
    marketView: "The inflation split decides whether the macro view starts from relief or pressure."
  },
  "growth-holding-question": {
    id: "growth-holding-question",
    title: "Growth holding?",
    tone: "emerald",
    whyItMatters: "Growth persistence decides whether inflation is a reflation story or a stagflation / hard-landing risk.",
    cases: [
      {
        label: "Yes",
        detail: "That supports soft landing or reflation depending on inflation."
      },
      {
        label: "No",
        detail: "That supports hard landing or stagflation-lite depending on inflation."
      }
    ],
    checkNext: ["ISM", "Payrolls", "Retail sales", "Credit spreads"],
    commonMistakes: ["Calling growth resilience from one survey without rates and credit confirmation"],
    marketView: "Growth holding up keeps the view more constructive unless inflation or credit push back."
  },
  "soft-landing": {
    id: "soft-landing",
    title: "Soft landing",
    tone: "emerald",
    href: "/playbook",
    hrefLabel: "Open playbook",
    whyItMatters: "This regime fits cooling inflation with still-resilient growth and calm credit.",
    cases: [
      {
        label: "Cleaner version",
        detail: "2Y eases, HY stays calm, breadth improves, and growth data do not crack."
      },
      {
        label: "Less clean version",
        detail: "Inflation cools but breadth or credit stay narrow, so confidence should stay lower."
      }
    ],
    checkNext: ["2Y", "HY spreads", "Breadth", "Claims"],
    commonMistakes: ["Calling soft landing while credit quietly widens"],
    marketView: "This is the most constructive regime mix for risk appetite if confirmation stays broad."
  },
  reflation: {
    id: "reflation",
    title: "Reflation",
    tone: "amber",
    href: "/playbook",
    hrefLabel: "Open playbook",
    whyItMatters: "Reflation means growth holds up but inflation pressure stops easing enough.",
    cases: [
      {
        label: "Healthy reflation",
        detail: "Growth and cyclicals improve with contained credit."
      },
      {
        label: "Messy reflation",
        detail: "Inflation and yields rise too fast, creating valuation pressure."
      }
    ],
    checkNext: ["2Y", "Real yields", "Oil", "Dollar"],
    commonMistakes: ["Treating every growth bounce as benign when inflation stays sticky"],
    marketView: "Reflation can support cyclicals but pressure duration and policy-sensitive assets."
  },
  "hard-landing": {
    id: "hard-landing",
    title: "Hard landing",
    tone: "rose",
    href: "/playbook",
    hrefLabel: "Open playbook",
    whyItMatters: "This regime fits weaker growth with falling inflation and widening stress signals.",
    cases: [
      {
        label: "Early warning",
        detail: "Claims rise and payrolls weaken while the front end eases."
      },
      {
        label: "Clearer stress",
        detail: "HY widens, breadth deteriorates, and defensives start to lead."
      }
    ],
    checkNext: ["Claims", "HY spreads", "Defensives", "Curve"],
    commonMistakes: ["Calling it only a dovish rates story while credit deteriorates"],
    marketView: "Hard landing shifts the view toward defense, easier policy expectations, and tighter risk tolerance."
  },
  "stagflation-lite": {
    id: "stagflation-lite",
    title: "Stagflation-lite",
    tone: "rose",
    href: "/playbook",
    hrefLabel: "Open playbook",
    whyItMatters: "This regime fits sticky inflation with weakening growth and worse credit quality.",
    cases: [
      {
        label: "Milder version",
        detail: "Growth slows while inflation remains sticky, but credit still only leaks wider."
      },
      {
        label: "Harder version",
        detail: "Growth weakens and inflation pressure stays high enough to keep rates unhelpful."
      }
    ],
    checkNext: ["Oil", "2Y", "HY spreads", "Breadth"],
    commonMistakes: ["Assuming weaker growth will automatically become market-friendly if inflation stays sticky"],
    marketView: "This is the hardest mix because both growth and inflation point against risk-taking."
  },
  "one-print-mistake": {
    id: "one-print-mistake",
    title: "One print is not a regime",
    tone: "rose",
    whyItMatters: "Big macro mistakes often come from turning one surprise into a full regime call.",
    cases: [
      {
        label: "Good discipline",
        detail: "Use the print, then wait for rates and credit to confirm."
      },
      {
        label: "Bad discipline",
        detail: "Skip confirmation and make the call bigger than the evidence supports."
      }
    ],
    checkNext: ["Workflow", "Rates", "Credit", "Macro Flow chain"],
    commonMistakes: ["Confusing a data surprise with a confirmed regime shift"],
    marketView: "The view should stay tentative until the confirmation layer agrees."
  },
  "headline-only-mistake": {
    id: "headline-only-mistake",
    title: "Do not read the headline alone",
    tone: "amber",
    whyItMatters: "The internals, revisions, and prior context often matter more than the headline itself.",
    cases: [
      {
        label: "Headline and internals agree",
        detail: "That is a more reliable signal."
      },
      {
        label: "Headline and internals disagree",
        detail: "Stay cautious and keep the view smaller."
      }
    ],
    checkNext: ["Revisions", "Subcomponents", "Prior value", "Related indicator"],
    commonMistakes: ["Skipping the internal breakdown"],
    marketView: "The better the internal quality, the more confident the market view can become."
  },
  "skip-confirmation-mistake": {
    id: "skip-confirmation-mistake",
    title: "Do not skip confirmation",
    tone: "rose",
    whyItMatters: "Rates, credit, and breadth decide whether a macro signal is real enough to trade as a bigger view.",
    cases: [
      {
        label: "Cross-asset confirmation",
        detail: "Confidence rises because multiple parts of the market are telling the same story."
      },
      {
        label: "Cross-asset disagreement",
        detail: "Confidence should stay low and the view should remain conditional."
      }
    ],
    checkNext: ["2Y", "Curve", "HY spreads", "Breadth"],
    commonMistakes: ["Calling a turn before the market reacts"],
    marketView: "Confirmation is what converts data interpretation into a market view."
  },
  "ignore-trust-mistake": {
    id: "ignore-trust-mistake",
    title: "Read trust first",
    tone: "slate",
    whyItMatters: "Status, source, and freshness tell you how much weight to put on a datapoint.",
    cases: [
      {
        label: "Live and fresh",
        detail: "Use the signal with more confidence."
      },
      {
        label: "Fallback or stale-live",
        detail: "Keep the interpretation lighter and look for confirmation elsewhere."
      }
    ],
    checkNext: ["Status badge", "Source label", "Updated time", "Health page"],
    commonMistakes: ["Treating fallback, stale, and live data the same way"],
    marketView: "Trust metadata determines how much conviction a signal deserves."
  }
};

export const startHereFlow: FlowNode[] = [
  { detailId: "regime-overview", label: "Regime", sublabel: "Big picture", tone: "cyan" },
  { detailId: "calendar-catalyst", label: "Catalyst", sublabel: "What matters today", tone: "amber" },
  { detailId: "core-watchlist", label: "Watchlist", sublabel: "Core signals", tone: "slate" },
  { detailId: "workflow-surprise", label: "Workflow", sublabel: "Surprise / revision", tone: "rose" },
  { detailId: "rates-confirmation", label: "Confirm", sublabel: "Rates / credit", tone: "emerald" }
] as const;

export const scenarioFlowMaps: FlowLane[] = [
  {
    id: "cpi-core-pce",
    title: "Inflation",
    nodes: [
      { detailId: "cpi-core-pce", label: "Hot CPI", tone: "amber" },
      { detailId: "cpi-core-pce", label: "Sticky path", tone: "amber" },
      { detailId: "cpi-core-pce", label: "Core / 2Y", tone: "amber" },
      { detailId: "cpi-core-pce", label: "Real yields", tone: "amber" }
    ]
  },
  {
    id: "payrolls-unemployment-wages",
    title: "Labor cooling",
    nodes: [
      { detailId: "payrolls-unemployment-wages", label: "Weak payrolls", tone: "cyan" },
      { detailId: "payrolls-unemployment-wages", label: "Demand softens", tone: "cyan" },
      { detailId: "payrolls-unemployment-wages", label: "Wages / hours", tone: "cyan" },
      { detailId: "payrolls-unemployment-wages", label: "Claims / HY", tone: "cyan" }
    ]
  },
  {
    id: "claims-early-warning",
    title: "Claims warning",
    nodes: [
      { detailId: "claims-early-warning", label: "Claims up", tone: "rose" },
      { detailId: "claims-early-warning", label: "Stress risk", tone: "rose" },
      { detailId: "claims-early-warning", label: "Continuing", tone: "rose" },
      { detailId: "claims-early-warning", label: "Defensives", tone: "rose" }
    ]
  },
  {
    id: "ism-manufacturing-services",
    title: "Growth turn",
    nodes: [
      { detailId: "ism-manufacturing-services", label: "ISM swing", tone: "emerald" },
      { detailId: "ism-manufacturing-services", label: "Growth shift", tone: "emerald" },
      { detailId: "ism-manufacturing-services", label: "Orders / retail", tone: "emerald" },
      { detailId: "ism-manufacturing-services", label: "10Y / cyclicals", tone: "emerald" }
    ]
  },
  {
    id: "rates-curve",
    title: "Rates repricing",
    nodes: [
      { detailId: "rates-curve", label: "2Y / curve", tone: "slate" },
      { detailId: "rates-curve", label: "Path shifts", tone: "slate" },
      { detailId: "rates-curve", label: "Cuts / real", tone: "slate" },
      { detailId: "rates-curve", label: "Dollar / credit", tone: "slate" }
    ]
  },
  {
    id: "ig-hy-spreads",
    title: "Credit warning",
    nodes: [
      { detailId: "ig-hy-spreads", label: "Spreads widen", tone: "rose" },
      { detailId: "ig-hy-spreads", label: "Trust fades", tone: "rose" },
      { detailId: "ig-hy-spreads", label: "Breadth / VIX", tone: "rose" },
      { detailId: "ig-hy-spreads", label: "Stress confirms", tone: "rose" }
    ]
  }
] as const;

export const nextStepMaps: FlowLane[] = [
  {
    id: "inflation-next",
    title: "Inflation path",
    nodes: [
      { detailId: "cpi-core-pce", label: "CPI / PCE", tone: "amber" },
      { detailId: "cpi-core-pce", label: "2Y / real yields", tone: "amber" },
      { detailId: "cpi-core-pce", label: "Policy / credit", tone: "amber" }
    ]
  },
  {
    id: "labor-next",
    title: "Labor path",
    nodes: [
      { detailId: "payrolls-unemployment-wages", label: "Payrolls / claims", tone: "cyan" },
      { detailId: "payrolls-unemployment-wages", label: "Wages / jobless", tone: "cyan" },
      { detailId: "payrolls-unemployment-wages", label: "2Y / HY", tone: "cyan" }
    ]
  },
  {
    id: "growth-next",
    title: "Growth path",
    nodes: [
      { detailId: "ism-manufacturing-services", label: "ISM / retail", tone: "emerald" },
      { detailId: "ism-manufacturing-services", label: "Orders / IP", tone: "emerald" },
      { detailId: "ism-manufacturing-services", label: "10Y / cyclicals", tone: "emerald" }
    ]
  },
  {
    id: "rates-next",
    title: "Rates path",
    nodes: [
      { detailId: "rates-curve", label: "2Y / 10Y", tone: "slate" },
      { detailId: "rates-curve", label: "Cuts / real", tone: "slate" },
      { detailId: "rates-curve", label: "Dollar / spreads", tone: "slate" }
    ]
  },
  {
    id: "liquidity-next",
    title: "Liquidity path",
    nodes: [
      { detailId: "liquidity-path", label: "TGA / RRP", tone: "cyan" },
      { detailId: "liquidity-path", label: "Net liquidity", tone: "cyan" },
      { detailId: "liquidity-path", label: "Breadth / HY", tone: "cyan" }
    ]
  },
  {
    id: "global-next",
    title: "Global path",
    nodes: [
      { detailId: "global-spillover-path", label: "DXY / oil", tone: "amber" },
      { detailId: "global-spillover-path", label: "Copper / CNH", tone: "amber" },
      { detailId: "global-spillover-path", label: "US rates", tone: "amber" }
    ]
  }
] as const;

export const regimeDecisionTree = {
  root: { detailId: "inflation-cooling-question", label: "Inflation cooling?", tone: "amber" } as FlowNode,
  branches: [
    {
      branch: "Yes",
      question: { detailId: "growth-holding-question", label: "Growth holding?", tone: "emerald" },
      outcomes: [
        { detailId: "soft-landing", label: "Soft landing", sublabel: "Cooling + resilient", tone: "emerald" },
        { detailId: "hard-landing", label: "Hard landing", sublabel: "Cooling + cracking", tone: "rose" }
      ]
    },
    {
      branch: "No",
      question: { detailId: "growth-holding-question", label: "Growth holding?", tone: "emerald" },
      outcomes: [
        { detailId: "reflation", label: "Reflation", sublabel: "Sticky + resilient", tone: "amber" },
        { detailId: "stagflation-lite", label: "Stagflation-lite", sublabel: "Sticky + weaker", tone: "rose" }
      ]
    }
  ] as FlowDecisionOutcome[]
} as const;

export const mistakeNodes: Array<{
  mistake: FlowNode;
  better: FlowNode;
}> = [
  {
    mistake: { detailId: "one-print-mistake", label: "One print = regime", tone: "rose" },
    better: { detailId: "one-print-mistake", label: "Wait for confirmation", tone: "emerald" }
  },
  {
    mistake: { detailId: "headline-only-mistake", label: "Headline only", tone: "rose" },
    better: { detailId: "headline-only-mistake", label: "Check internals", tone: "amber" }
  },
  {
    mistake: { detailId: "skip-confirmation-mistake", label: "Skip rates / credit", tone: "rose" },
    better: { detailId: "skip-confirmation-mistake", label: "Confirm cross-asset", tone: "emerald" }
  },
  {
    mistake: { detailId: "ignore-trust-mistake", label: "Ignore trust", tone: "rose" },
    better: { detailId: "ignore-trust-mistake", label: "Read status first", tone: "slate" }
  }
] as const;
