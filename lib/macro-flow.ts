import type { LayerPageSlug } from "@/lib/layer-pages";
import type { MacroModuleSlug } from "@/types/macro";

export type FlowTone = "slate" | "cyan" | "amber" | "emerald" | "rose";

export type MacroFlowJumpLink = {
  id: string;
  label: string;
  detail: string;
};

export type MacroFlowOperatingNode = {
  label: string;
  detail: string;
  tone: FlowTone;
  href?: string;
};

export type MacroFlowRoutineCard = {
  title: string;
  action: string;
  output: string;
};

export type MacroFlowReasoningStep = {
  title: string;
  check: string;
  why: string;
  ifHotOrStrong: string;
  ifCoolOrWeak: string;
  thenCheck: string;
};

export type MacroFlowCaseExample = {
  title: string;
  setup: string;
  interpretation: string;
  confirm: string;
  assets: string;
};

export type MacroFlowSection = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  firstPrinciple: string;
  whyItMatters: string;
  marketPath: string[];
  steps: MacroFlowReasoningStep[];
  cases: MacroFlowCaseExample[];
  dailyScorecard: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
};

export type MacroFlowMistake = {
  mistake: string;
  cleanerPath: string;
};

export type MiniLogicMapNode = {
  label: string;
  hint: string;
  href?: string;
};

export type MiniLogicMap = {
  title: string;
  summary: string;
  nodes: MiniLogicMapNode[];
  footer?: string;
};

export const macroFlowJumpLinks: MacroFlowJumpLink[] = [
  {
    id: "cpi-core-pce",
    label: "Inflation path",
    detail: "From the print into 2Y, real yields, USD, and duration."
  },
  {
    id: "payrolls-unemployment-wages",
    label: "Labor stack",
    detail: "How payrolls, unemployment, wages, and hours change the macro read."
  },
  {
    id: "claims-early-warning",
    label: "Claims warning",
    detail: "The early stress chain before payrolls fully roll over."
  },
  {
    id: "ism-manufacturing-services",
    label: "Growth direction",
    detail: "How surveys travel into yields, cyclicals, and earnings sensitivity."
  },
  {
    id: "rates-curve",
    label: "Rates translation",
    detail: "Separate policy repricing from inflation pressure or growth fear."
  },
  {
    id: "ig-hy-spreads",
    label: "Credit confirmation",
    detail: "Why spreads decide whether the market believes the macro story."
  },
  {
    id: "liquidity-path",
    label: "Liquidity overlay",
    detail: "Why markets can stay resilient even when the macro tape looks mixed."
  },
  {
    id: "global-spillover-path",
    label: "Global spillover",
    detail: "How the dollar, commodities, and offshore signals feed back into the US view."
  }
];

export const macroFlowOperatingSystem: MacroFlowOperatingNode[] = [
  {
    label: "Start with the catalyst",
    detail: "Read the print, the revision, and whether it changes the regime story or only the noise.",
    tone: "slate",
    href: "/workflow"
  },
  {
    label: "Decompose the message",
    detail: "Split headline from the sticky details so you know what the market should care about.",
    tone: "amber",
    href: "#cpi-core-pce"
  },
  {
    label: "Translate into rates",
    detail: "Ask whether the move belongs to the 2Y, 10Y, real yields, breakevens, or the curve.",
    tone: "cyan",
    href: "#rates-curve"
  },
  {
    label: "Confirm in trust markets",
    detail: "Use USD, credit, and volatility to see whether the market agrees with the narrative.",
    tone: "emerald",
    href: "#ig-hy-spreads"
  },
  {
    label: "Map it into assets",
    detail: "Decide which assets should benefit, struggle, or stay neutral if the message is real.",
    tone: "rose",
    href: "/positioning"
  },
  {
    label: "Update the tentative view",
    detail: "Only then write a regime scorecard. One print can change the odds without ending the old regime.",
    tone: "slate",
    href: "/"
  }
];

export const macroFlowDailyRoutine: MacroFlowRoutineCard[] = [
  {
    title: "1. Set the starting frame",
    action: "Read the dashboard summary, then check whether today is inflation, labor, growth, or policy-led.",
    output: "You know which market reaction function matters most before the print hits."
  },
  {
    title: "2. Read the release correctly",
    action: "Open Workflow for the actual, forecast, prior, revised prior, and the day-tone map.",
    output: "You know what changed today instead of reacting to a headline number in isolation."
  },
  {
    title: "3. Translate it into rates",
    action: "Check the 2Y, 10Y, real yields, breakevens, and the curve to see what the bond market thinks changed.",
    output: "You know whether the move is policy repricing, inflation pressure, or growth fear."
  },
  {
    title: "4. Ask if risk markets agree",
    action: "Confirm the move in DXY, IG/HY spreads, VIX/MOVE, and breadth.",
    output: "You know whether the signal is broad or still untrusted."
  },
  {
    title: "5. Write the tentative view",
    action: "Summarize the message in one line: softer landing, reflation, hard-landing warning, or no real regime change.",
    output: "You have a usable market view without turning one print into a dramatic call."
  },
  {
    title: "6. Re-check later in the day",
    action: "See whether the move survives into the close, especially in rates, USD, and credit.",
    output: "You separate the durable signal from the knee-jerk reaction."
  }
];
export const macroFlowSections: MacroFlowSection[] = [
  {
    id: "cpi-core-pce",
    kicker: "Inflation path",
    title: "CPI and Core PCE are really about the policy path",
    summary:
      "Inflation prints matter because they travel into Fed pricing first, then into real yields, USD, valuation pressure, and finally equity leadership.",
    firstPrinciple:
      "The headline number tells you what happened. The useful market read comes from knowing whether the sticky core details changed the Fed reaction function.",
    whyItMatters:
      "If inflation is only noisy headline energy, the market can fade the move. If services, shelter, or three-month annualized core momentum stay hot, the front end and real yields can reprice much more aggressively.",
    marketPath: [
      "Hot core inflation -> 2Y up -> real yields firmer -> USD firmer -> growth stocks under pressure",
      "Cool core inflation -> 2Y down -> real yields easier -> USD softer -> duration relief",
      "Headline-only energy shock -> breakevens up but policy repricing may stay limited"
    ],
    steps: [
      {
        title: "Read headline vs core",
        check: "Was the surprise in headline CPI, core CPI, or both?",
        why: "Markets treat headline noise differently from sticky core pressure.",
        ifHotOrStrong: "If both are hot, the move has a better chance of changing the policy path.",
        ifCoolOrWeak: "If headline is hot but core is calmer, the move can fade quickly.",
        thenCheck: "Go straight to shelter, services ex housing, and the three-month pace."
      },
      {
        title: "Find the sticky part",
        check: "Did shelter, services, or wages-sensitive categories stay firm?",
        why: "Sticky services inflation is what keeps the Fed uncomfortable.",
        ifHotOrStrong: "Sticky services staying hot raises the odds that cuts get pushed out.",
        ifCoolOrWeak: "If sticky services cool, the market can interpret the print as real progress.",
        thenCheck: "Confirm whether the 2Y and real yields are moving together."
      },
      {
        title: "Translate into rates",
        check: "Did the 2Y, real yields, and breakevens move in the same direction?",
        why: "That tells you whether the move is policy repricing or just inflation optics.",
        ifHotOrStrong: "2Y up plus real yields up is a hawkish translation, not just a commodity move.",
        ifCoolOrWeak: "2Y down plus real yields down is more supportive for duration and growth equities.",
        thenCheck: "Look at DXY, growth stocks, and credit to see whether the market trusts it."
      }
    ],
    cases: [
      {
        title: "Hot CPI, but mostly energy",
        setup: "Headline runs hot, core is less alarming, breakevens rise more than real yields.",
        interpretation: "That is inflation noise, not automatically a regime turn.",
        confirm: "The 2Y should stay relatively contained if the Fed path did not really change.",
        assets: "Energy can outperform without forcing a broad risk-off move."
      },
      {
        title: "Cool core PCE with softer real yields",
        setup: "Core PCE slows, the 2Y eases, and real yields fall.",
        interpretation: "That is closer to a genuine easing of policy pressure.",
        confirm: "DXY should soften and duration-sensitive equities should hold up.",
        assets: "Longer-duration growth and rate-sensitive sectors usually react best."
      }
    ],
    dailyScorecard: [
      "Was the surprise in headline, core, or both?",
      "Did sticky services cool or stay firm?",
      "Did the 2Y and real yields confirm the message?",
      "Did USD and risk assets react as they should?"
    ],
    relatedLinks: [
      { label: "Inflation dashboard", href: "/inflation" },
      { label: "Policy expectations", href: "/policy-expectations" },
      { label: "Workflow release view", href: "/workflow" }
    ]
  },
  {
    id: "payrolls-unemployment-wages",
    kicker: "Labor stack",
    title: "Payrolls only matter once you know what the rest of labor is saying",
    summary:
      "Payrolls can shift both the growth story and the inflation story, which is why you need unemployment, wages, hours, and revisions before deciding what the print means.",
    firstPrinciple: "The payroll headline is not the labor story. The labor story lives in the mix of jobs, slack, pay pressure, and revisions.",
    whyItMatters:
      "A weak payroll number can still be benign if revisions improve, unemployment is steady, and wages are not collapsing. A strong payroll number can still be disinflationary if hours soften and wage pressure cools.",
    marketPath: [
      "Strong payrolls + firm wages -> 2Y firmer -> cuts pushed out -> USD and real yields firmer",
      "Weak payrolls + rising unemployment -> 2Y softer -> defensives and duration catch a bid",
      "Mixed payrolls with steady credit -> slowdown, not necessarily stress"
    ],
    steps: [
      {
        title: "Read the headline with revisions",
        check: "Did payrolls beat or miss, and were prior months revised meaningfully?",
        why: "Revisions often change the true signal more than the headline itself.",
        ifHotOrStrong: "A beat with upward revisions says labor demand is still sturdier than expected.",
        ifCoolOrWeak: "A miss with downward revisions is more dangerous than a one-off weak headline.",
        thenCheck: "Move to unemployment, wages, and average weekly hours."
      },
      {
        title: "Check labor slack",
        check: "Did unemployment move because of layoffs, hiring weakness, or participation?",
        why: "The same unemployment change can be benign or worrying depending on the cause.",
        ifHotOrStrong: "Stable unemployment with firm payrolls means labor demand still has cushion.",
        ifCoolOrWeak: "Rising unemployment with weaker hours is a more convincing slowdown signal.",
        thenCheck: "See whether claims and continuing claims confirm it."
      },
      {
        title: "Decide if it is inflationary",
        check: "Did wages and hours stay firm or soften?",
        why: "Wages map into services inflation and hours often soften before layoffs become obvious.",
        ifHotOrStrong: "Strong wages keep the inflation side alive even if the jobs headline looks manageable.",
        ifCoolOrWeak: "Softer wages and hours make the labor miss look more growth-negative than inflationary.",
        thenCheck: "Translate it into the 2Y, credit spreads, and defensives."
      }
    ],
    cases: [
      {
        title: "Weak payrolls, stable credit",
        setup: "Payrolls miss, but claims stay controlled and HY does not widen much.",
        interpretation: "That looks more like cooling labor than a hard-landing shock.",
        confirm: "The 2Y can fall without credit blowing out.",
        assets: "Duration can benefit while cyclicals wobble but do not fully break."
      },
      {
        title: "Strong payrolls, sticky wages",
        setup: "Payrolls beat, unemployment is steady, and wages stay firm.",
        interpretation: "That is a firmer growth plus inflation mix, not an easy-cut backdrop.",
        confirm: "The 2Y and USD should react more than the 10Y alone.",
        assets: "Rate-sensitive equities can feel the pressure even if broad growth looks okay."
      }
    ],
    dailyScorecard: [
      "Headline payrolls vs revisions",
      "Unemployment move and participation context",
      "Wages and weekly hours",
      "Claims and credit confirmation"
    ],
    relatedLinks: [
      { label: "Labor dashboard", href: "/labor" },
      { label: "Rates & Credit", href: "/rates-credit" },
      { label: "Workflow release view", href: "/workflow" }
    ]
  },
  {
    id: "claims-early-warning",
    kicker: "Early warning",
    title: "Claims are the fast labor stress check",
    summary: "Claims matter because they can tell you that labor demand is cooling before the monthly payroll report catches up.",
    firstPrinciple: "Weekly claims are noisy, but repeated breaks above the recent range often mark the first real crack in labor demand.",
    whyItMatters:
      "When claims and continuing claims rise together, the market starts thinking about softer payrolls, easier Fed pricing, and wider spreads if the move keeps broadening.",
    marketPath: [
      "Claims drifting up -> softer front-end yields -> defensives start outperforming",
      "Claims up plus credit wider -> hard-landing risk gains credibility",
      "One noisy weekly spike -> usually not enough without confirmation"
    ],
    steps: [
      {
        title: "Check the level vs the range",
        check: "Did claims simply tick up, or did they break above the recent range decisively?",
        why: "Markets react more to range breaks than to ordinary weekly noise.",
        ifHotOrStrong: "A clean break higher is more useful than a small beat on expectations.",
        ifCoolOrWeak: "A quick reversal back into the range weakens the warning signal.",
        thenCheck: "Look at continuing claims and payroll revisions."
      },
      {
        title: "Check the persistence",
        check: "Are continuing claims also rising or staying elevated?",
        why: "Continuing claims tell you whether displaced workers are struggling to find new jobs.",
        ifHotOrStrong: "Rising continuing claims make the labor cooling story more durable.",
        ifCoolOrWeak: "If continuing claims stay calm, the weekly jump may fade in importance.",
        thenCheck: "See whether defensives, HY spreads, and the 2Y agree."
      }
    ],
    cases: [
      {
        title: "Claims rise, but spreads stay calm",
        setup: "Claims break higher while HY and breadth remain stable.",
        interpretation: "That is an early slowdown warning, not yet a stress event.",
        confirm: "Payrolls, unemployment, and defensives should slowly start to lean the same way.",
        assets: "Duration can benefit before broad risk assets fully crack."
      },
      {
        title: "Claims rise with wider HY",
        setup: "Claims, continuing claims, and HY spreads all worsen together.",
        interpretation: "That is a much stronger hard-landing warning.",
        confirm: "The 2Y should ease and defensives should start to lead more clearly.",
        assets: "Credit-sensitive and cyclical assets face the biggest pressure."
      }
    ],
    dailyScorecard: [
      "Did claims break the range or just wobble?",
      "Did continuing claims confirm?",
      "Did the 2Y, defensives, and HY spreads respond?"
    ],
    relatedLinks: [
      { label: "Labor dashboard", href: "/labor" },
      { label: "Positioning", href: "/positioning" },
      { label: "Workflow", href: "/workflow" }
    ]
  },
  {
    id: "ism-manufacturing-services",
    kicker: "Growth direction",
    title: "ISM is the fast read on whether growth is improving, rolling over, or just mixed",
    summary: "ISM matters because surveys move faster than most hard data and often shape the first market reaction to the growth cycle.",
    firstPrinciple: "The ISM headline is only useful once you know whether new orders, employment, and prices paid are telling the same story.",
    whyItMatters:
      "If ISM improves with better new orders and calmer inflation pressure, the market reads that as cleaner growth. If the headline is only up because prices paid are hot, it can feel more like reflation pressure than healthy demand.",
    marketPath: [
      "Better ISM + firmer new orders -> 10Y and cyclicals can firm -> copper and small caps may confirm",
      "Weaker ISM + softer employment -> yields ease -> defensives and duration do better",
      "Hot prices paid with mediocre demand -> can look more like reflation than healthy growth"
    ],
    steps: [
      {
        title: "Read the subcomponents",
        check: "Did new orders, employment, and prices paid agree with the headline?",
        why: "The market trusts broad improvement more than a narrow headline bounce.",
        ifHotOrStrong: "Better new orders and employment together are the cleaner growth message.",
        ifCoolOrWeak: "A weak headline with weak new orders is harder to dismiss as noise.",
        thenCheck: "Compare the message with retail sales, industrial production, and earnings-sensitive assets."
      },
      {
        title: "Separate growth from inflation",
        check: "Was the surprise driven by demand, or by prices paid staying hot?",
        why: "The asset implications are very different.",
        ifHotOrStrong: "Demand-led improvement can support cyclicals and a firmer 10Y without hurting credit much.",
        ifCoolOrWeak: "Price-led heat without demand follow-through can feel worse for duration and margins.",
        thenCheck: "Use copper, the 10Y, cyclicals, and HY to see which interpretation wins."
      }
    ],
    cases: [
      {
        title: "Manufacturing turns first",
        setup: "Manufacturing improves while services stay mixed.",
        interpretation: "That can be the early stage of a growth stabilization, but it is not broad enough yet to call a full turn.",
        confirm: "Copper, industrial production, and cyclicals should start improving too.",
        assets: "Industrials and small caps can respond before the broader market does."
      },
      {
        title: "Services slow while manufacturing holds",
        setup: "Services cool, consumer-sensitive data softens, and the 2Y eases.",
        interpretation: "Domestic demand may be losing momentum even if the factory side has stabilized.",
        confirm: "Retail sales, payrolls, and defensives should lean the same way.",
        assets: "Long-duration assets may hold up better than consumer cyclicals."
      }
    ],
    dailyScorecard: [
      "Headline vs new orders and employment",
      "Prices paid: growth-friendly or inflationary?",
      "Did copper, cyclicals, and the 10Y confirm?"
    ],
    relatedLinks: [
      { label: "Growth dashboard", href: "/growth" },
      { label: "Global spillover", href: "/global-spillover" },
      { label: "Positioning", href: "/positioning" }
    ]
  },
  {
    id: "rates-curve",
    kicker: "Rates translation",
    title: "The rates market tells you what kind of macro shock just hit",
    summary:
      "You rarely want to stop at 'yields moved.' The useful question is whether the front end, the long end, real yields, breakevens, or the curve did the real work.",
    firstPrinciple:
      "The 2Y is the policy barometer. The 10Y is the discount-rate barometer. Real yields and breakevens tell you whether the move is about inflation expectations or actual financial tightening.",
    whyItMatters:
      "If the 2Y leads, the market is usually repricing the Fed. If the long end or breakevens lead, the story may be term premium, inflation, or supply instead. If spreads widen while yields fall, that is usually growth fear rather than clean relief.",
    marketPath: [
      "2Y up -> cuts pushed out -> USD firmer -> duration pressure",
      "2Y down with calm credit -> benign policy relief",
      "2Y down with wider HY -> growth fear, not simple relief",
      "Bear steepener -> often reflation or inflation pressure",
      "Bull steepener -> often slowdown or easier policy expectations"
    ],
    steps: [
      {
        title: "Find the leading point on the curve",
        check: "Was the move front-end led, long-end led, or curve-shape led?",
        why: "Different parts of the curve tell different macro stories.",
        ifHotOrStrong: "A front-end-led selloff means the market is repricing the Fed more hawkishly.",
        ifCoolOrWeak: "A front-end-led rally means the market is opening the door to cuts or softer inflation.",
        thenCheck: "Split the move into real yields and breakevens."
      },
      {
        title: "Split real yields from breakevens",
        check: "Did nominals move because real yields changed or because inflation compensation moved?",
        why: "Real yields hit valuation hardest. Breakevens say more about inflation expectations.",
        ifHotOrStrong: "Higher real yields are the cleaner tightening signal for duration and risk assets.",
        ifCoolOrWeak: "Lower real yields usually support duration-sensitive assets more directly.",
        thenCheck: "Ask whether credit and USD agreed with the move."
      },
      {
        title: "Classify the curve move",
        check: "Was the steepening bull or bear? Was the flattening growth fear or hawkish repricing?",
        why: "Curve shape without context leads to bad regime calls.",
        ifHotOrStrong: "Bear steepening with sticky inflation can mean reflation pressure.",
        ifCoolOrWeak: "Bull steepening with widening spreads can mean hard-landing fear.",
        thenCheck: "Confirm the conclusion in HY, IG, mortgage rates, and equities."
      }
    ],
    cases: [
      {
        title: "2Y falls, HY calm",
        setup: "The front end rallies, HY stays contained, and breadth does not break.",
        interpretation: "That is closer to benign policy relief or softer inflation.",
        confirm: "USD should ease and growth-stock duration should react well.",
        assets: "Long-duration equities and bonds benefit most."
      },
      {
        title: "2Y falls, HY widens",
        setup: "The front end rallies, but credit spreads widen and defensives lead.",
        interpretation: "That is growth fear, not a clean risk-on easing story.",
        confirm: "Claims, labor, and internals should start looking worse too.",
        assets: "Duration can rise while cyclicals and lower-quality credit struggle."
      }
    ],
    dailyScorecard: [
      "What part of the curve led the move?",
      "Real yields or breakevens?",
      "Bull or bear steepener?",
      "Did HY, IG, and USD agree?"
    ],
    relatedLinks: [
      { label: "Rates & Credit", href: "/rates-credit" },
      { label: "Policy expectations", href: "/policy-expectations" },
      { label: "Macro dashboard", href: "/" }
    ]
  },
  {
    id: "ig-hy-spreads",
    kicker: "Credit confirmation",
    title: "Credit decides whether the macro story is real enough to trust",
    summary: "The most useful market cross-check is often simple: if credit disagrees, slow down before making a strong macro call.",
    firstPrinciple: "IG tells you how calm higher-quality credit feels. HY tells you whether real risk appetite is still intact.",
    whyItMatters:
      "Equities can stay stable while credit quietly deteriorates. That is often the warning that the surface-level market move is not as healthy as it looks.",
    marketPath: [
      "Tighter IG and HY -> macro stress is not spreading",
      "HY wider while equities stay calm -> early fragility",
      "Wider credit plus weaker breadth -> the move is losing quality"
    ],
    steps: [
      {
        title: "Check IG vs HY",
        check: "Is the widening or tightening broad, or mostly in lower-quality credit?",
        why: "HY usually turns first when risk tolerance is fading.",
        ifHotOrStrong: "Broad tightening supports the soft-landing or reflation story.",
        ifCoolOrWeak: "HY widening first is often the earliest warning that the tape is getting fragile.",
        thenCheck: "Compare the move with breadth, small caps, and defensives."
      },
      {
        title: "Decide whether risk agrees",
        check: "Are breadth, small caps, and cyclicals confirming credit's message?",
        why: "One market can lag. The combination is what matters.",
        ifHotOrStrong: "Calm credit plus better breadth makes the risk move much more believable.",
        ifCoolOrWeak: "Wider HY plus narrow breadth says the rally is getting more fragile.",
        thenCheck: "Tie it back to the macro catalyst that started the move."
      }
    ],
    cases: [
      {
        title: "Equities up, HY wider",
        setup: "Headline indices stay firm, but lower-quality credit widens.",
        interpretation: "The tape may be narrower and more fragile than it looks.",
        confirm: "Breadth, equal-weight, and small caps should also fail to broaden.",
        assets: "Lower-quality and cyclical risk becomes vulnerable first."
      },
      {
        title: "Soft data, calm credit",
        setup: "A macro print weakens, but credit barely moves.",
        interpretation: "The market is treating it as slowdown, not crisis.",
        confirm: "The 2Y can ease without a broad risk unwind.",
        assets: "Duration and quality assets usually behave better than deep cyclicals."
      }
    ],
    dailyScorecard: [
      "IG vs HY: broad or narrow move?",
      "Did breadth and small caps agree?",
      "Did credit confirm the macro story or refuse it?"
    ],
    relatedLinks: [
      { label: "Positioning", href: "/positioning" },
      { label: "Rates & Credit", href: "/rates-credit" },
      { label: "Workflow", href: "/workflow" }
    ]
  },
  {
    id: "liquidity-path",
    kicker: "Liquidity overlay",
    title: "Liquidity explains why markets can ignore mixed macro for longer than you expect",
    summary:
      "Liquidity is the overlay that answers the question: why is the tape holding up, or tightening faster, even though the standard macro releases look mixed?",
    firstPrinciple:
      "Do not read the Fed balance sheet, RRP, TGA, or reserves in isolation. The useful read is the net liquidity impulse and whether it is reaching credit and positioning.",
    whyItMatters:
      "Liquidity can cushion soft macro, amplify good macro, or delay the market's recognition of weaker fundamentals. That is why the same payroll or CPI print can trade differently in different liquidity backdrops.",
    marketPath: [
      "Better liquidity -> tighter spreads -> better breadth -> easier risk appetite",
      "Worse liquidity -> more fragile tape -> higher sensitivity to bad macro prints",
      "Mixed macro + easy liquidity -> rallies can keep going longer than fundamentals alone suggest"
    ],
    steps: [
      {
        title: "Read the plumbing stack",
        check: "What are the Fed balance sheet, RRP, TGA, and reserve balances saying together?",
        why: "Net liquidity matters more than any single plumbing series.",
        ifHotOrStrong: "A supportive net liquidity impulse can cushion risk assets even with mixed macro.",
        ifCoolOrWeak: "A draining impulse raises the cost of ignoring bad macro news.",
        thenCheck: "See whether financial conditions, bank credit, and HY spreads agree."
      },
      {
        title: "Check transmission",
        check: "Is easier liquidity actually reaching lending, credit, and risk appetite?",
        why: "Liquidity only matters if it transmits into market behavior and financing conditions.",
        ifHotOrStrong: "If credit and breadth improve too, liquidity is genuinely supportive.",
        ifCoolOrWeak: "If bank credit or spreads do not improve, the impulse may be weaker than it looks.",
        thenCheck: "Overlay positioning to see whether the move is healthy or just being squeezed."
      }
    ],
    cases: [
      {
        title: "Mixed macro, resilient tape",
        setup: "Data is mixed, but spreads are stable, breadth improves, and liquidity is supportive.",
        interpretation: "Liquidity is likely cushioning the macro noise.",
        confirm: "Financial conditions and positioning should stay constructive too.",
        assets: "Beta and cyclicals can keep working longer than the hard data alone suggests."
      },
      {
        title: "Weak liquidity into soft macro",
        setup: "Net liquidity deteriorates while claims rise and credit weakens.",
        interpretation: "Macro fragility now has less support underneath it.",
        confirm: "Breadth and HY should deteriorate more quickly.",
        assets: "Crowded risk and lower-quality exposures become more vulnerable."
      }
    ],
    dailyScorecard: [
      "Net liquidity improving or draining?",
      "Are financial conditions and bank credit agreeing?",
      "Is the tape broadening or just squeezing?"
    ],
    relatedLinks: [
      { label: "Liquidity page", href: "/liquidity" },
      { label: "Positioning", href: "/positioning" },
      { label: "Dashboard", href: "/" }
    ]
  },
  {
    id: "global-spillover-path",
    kicker: "Global spillover",
    title: "The dollar and commodities tell you whether the US story is staying local or becoming global",
    summary:
      "Global spillover matters because the same US macro print can land differently depending on whether the dollar, commodities, and offshore growth signals amplify or offset it.",
    firstPrinciple: "A US view is more reliable when the dollar complex, commodities, and offshore data are leaning in the same direction.",
    whyItMatters:
      "A stronger dollar can tighten global conditions, weigh on commodities, and reinforce disinflation or risk-off pressure. A softer dollar with firmer metals can help extend a growth or reflation story.",
    marketPath: [
      "USD stronger -> tighter global financial conditions -> pressure on cyclicals and commodities",
      "Copper and oil firmer -> growth or reflation signal broadens",
      "USDCNH weaker -> China-sensitive assets and industrial demand tone can deteriorate"
    ],
    steps: [
      {
        title: "Start with the dollar",
        check: "Did DXY, EURUSD, USDJPY, or USDCNH confirm the same global conditions message?",
        why: "FX often transmits the market's macro message faster than slower data releases.",
        ifHotOrStrong: "A firmer dollar can make a hawkish US data surprise feel more globally restrictive.",
        ifCoolOrWeak: "A softer dollar can cushion the same soft US macro print and help risk hold up.",
        thenCheck: "Move to copper, oil, and gold."
      },
      {
        title: "Check commodity confirmation",
        check: "Are industrial metals and energy confirming growth, inflation, or just supply noise?",
        why: "Commodity confirmation helps separate reflation from isolated energy headlines.",
        ifHotOrStrong: "Copper and oil rising with a softer dollar is a stronger pro-growth signal.",
        ifCoolOrWeak: "Oil up alone without copper can be more supply noise than demand strength.",
        thenCheck: "See whether the offshore PMIs or China-sensitive assets agree."
      }
    ],
    cases: [
      {
        title: "US growth print beats, but DXY jumps",
        setup: "Domestic data beats, the dollar strengthens, and commodities do not confirm.",
        interpretation: "The move may tighten conditions rather than simply extend risk-on.",
        confirm: "Watch USDCNH, copper, and global cyclicals closely.",
        assets: "US duration may sell off while global growth-sensitive assets lag."
      },
      {
        title: "Dollar softer, copper firmer",
        setup: "The dollar eases, copper rises, and the 10Y firms for healthier reasons.",
        interpretation: "That looks more like a constructive global growth or reflation confirmation.",
        confirm: "Cyclicals, breadth, and offshore PMIs should improve too.",
        assets: "Industrials, materials, and broader cyclicals tend to benefit."
      }
    ],
    dailyScorecard: [
      "Did the dollar tighten or ease conditions?",
      "Did copper and oil confirm the growth message?",
      "Did China-sensitive assets and global PMIs agree?"
    ],
    relatedLinks: [
      { label: "FX & Commodities", href: "/global-spillover" },
      { label: "Growth dashboard", href: "/growth" },
      { label: "Positioning", href: "/positioning" }
    ]
  }
];

export const macroFlowCommonMistakes: MacroFlowMistake[] = [
  {
    mistake: "Turning one headline beat or miss into a full regime call.",
    cleanerPath: "Treat the first print as a probability update, then confirm it in rates, credit, USD, and follow-up data."
  },
  {
    mistake: "Reading yields without asking which part of the curve or decomposition moved.",
    cleanerPath: "Classify the move first: front end vs long end, real yields vs breakevens, bull vs bear steepener."
  },
  {
    mistake: "Assuming equities are telling the truth even when credit disagrees.",
    cleanerPath: "Use HY, IG, breadth, and small caps as the trust layer before believing the index headline."
  },
  {
    mistake: "Ignoring revisions, hours, or subcomponents and reacting to the top-line number only.",
    cleanerPath: "Always read the internal decomposition before deciding what the print means."
  }
];

const sharedLogicLinks = {
  macroFlow: { label: "Open Macro Flow", href: "/macro-flow" },
  workflow: { label: "Open Workflow", href: "/workflow" }
} as const;

export const moduleMiniLogicMaps: Partial<Record<MacroModuleSlug, MiniLogicMap>> = {
  inflation: {
    title: "Inflation logic chain",
    summary: "Start with the print, then decide whether the sticky core details are changing the Fed path.",
    nodes: [
      { label: "Headline / Core", hint: "Separate noise from stickier inflation.", href: "/macro-flow#cpi-core-pce" },
      { label: "Services / Shelter", hint: "Find what the Fed actually cares about.", href: "/macro-flow#cpi-core-pce" },
      { label: "2Y / Real Yield", hint: "Translate into policy repricing.", href: "/rates-credit#us-2y-treasury" },
      { label: "USD / Growth Stocks", hint: "See who feels the tightening first.", href: "/positioning" }
    ],
    footer: "Use Workflow for the fresh release stats. Use Macro Flow for the deeper translation."
  },
  growth: {
    title: "Growth logic chain",
    summary: "Read surveys and hard data together, then confirm the message in yields, copper, and cyclicals.",
    nodes: [
      { label: "ISM / Retail / IP", hint: "Decide whether demand is accelerating or cooling.", href: "/macro-flow#ism-manufacturing-services" },
      { label: "Orders / Earnings Sensitivity", hint: "Ask which part of demand is really moving.", href: "/macro-flow#ism-manufacturing-services" },
      { label: "10Y / Copper", hint: "Check whether rates and commodities agree.", href: "/global-spillover" },
      { label: "Cyclicals", hint: "See whether the tape believes the growth turn.", href: "/positioning" }
    ],
    footer: "Growth turns matter most when surveys, hard data, and cyclicals all align."
  },
  labor: {
    title: "Labor logic chain",
    summary: "The payroll headline is only step one. Slack, wages, hours, and claims decide what it means.",
    nodes: [
      { label: "Payrolls / Unemployment", hint: "Start with jobs and slack.", href: "/macro-flow#payrolls-unemployment-wages" },
      { label: "Wages / Hours", hint: "Check the inflation and labor-demand angle.", href: "/macro-flow#payrolls-unemployment-wages" },
      { label: "Claims", hint: "Look for persistence or early stress.", href: "/macro-flow#claims-early-warning" },
      { label: "Spreads / Defensives", hint: "Ask whether markets agree.", href: "/positioning" }
    ],
    footer: "Weak payrolls alone are not enough. The follow-through in claims and credit is what matters."
  },
  "rates-credit": {
    title: "Rates and credit chain",
    summary: "Rates tell you what changed. Credit tells you whether the market believes it.",
    nodes: [
      { label: "2Y / 10Y", hint: "Find which part of the curve led.", href: "/macro-flow#rates-curve" },
      { label: "Real Yield / Breakeven", hint: "Split tightening from inflation optics.", href: "/policy-expectations" },
      { label: "Curve Shape", hint: "Bull vs bear steepener changes the read.", href: "/macro-flow#rates-curve" },
      { label: "IG / HY", hint: "Confirm the macro story in trust markets.", href: "/macro-flow#ig-hy-spreads" }
    ],
    footer: "If rates and credit disagree, slow down before making a regime call."
  },
  "policy-liquidity": {
    title: "Policy and liquidity chain",
    summary: "Read the plumbing first, then decide whether it is actually changing the market backdrop.",
    nodes: [
      { label: "Fed / TGA / RRP", hint: "Start with the plumbing stack.", href: "/liquidity" },
      { label: "Reserves / Net Liquidity", hint: "Ask whether system support is improving.", href: "/macro-flow#liquidity-path" },
      { label: "Bank Credit / Standards", hint: "Check transmission into the real economy.", href: "/liquidity" },
      { label: "HY / Breadth", hint: "See whether markets are actually receiving the impulse.", href: "/positioning" }
    ],
    footer: sharedLogicLinks.macroFlow.label
  },
  "market-internals": {
    title: "Market internals chain",
    summary: "A clean tape needs broad participation, calm credit, and manageable volatility.",
    nodes: [
      { label: "Breadth / Equal-weight", hint: "See whether participation is broad.", href: "/positioning" },
      { label: "Small Caps / Cyclicals", hint: "Check whether the rally is pro-growth.", href: "/positioning" },
      { label: "VIX / MOVE", hint: "Watch hidden stress in vol markets.", href: "/positioning" },
      { label: "HY / IG", hint: "Make sure credit still agrees.", href: "/macro-flow#ig-hy-spreads" }
    ],
    footer: "Market internals should confirm the macro view, not replace it."
  },
  "flows-positioning": {
    title: "Flows and positioning chain",
    summary: "Positioning explains why the market can overshoot or unwind faster than the macro data alone suggests.",
    nodes: [
      { label: "ETF Flows / Buybacks", hint: "Check the mechanical bid.", href: "/positioning" },
      { label: "Crowding / COT", hint: "Ask how one-sided the tape is.", href: "/positioning" },
      { label: "Breadth / Credit", hint: "See whether the squeeze still has quality.", href: "/positioning" },
      { label: "Macro Trigger", hint: "Know what print could unwind the crowd.", href: sharedLogicLinks.workflow.href }
    ],
    footer: "Crowding matters most when macro and liquidity stop cooperating."
  },
  global: {
    title: "Global spillover chain",
    summary: "Use FX and commodities to decide whether the domestic story is broadening or staying local.",
    nodes: [
      { label: "DXY / FX Crosses", hint: "Start with financial conditions.", href: "/macro-flow#global-spillover-path" },
      { label: "Oil / Copper / Gold", hint: "Check growth, inflation, and hedge demand.", href: "/global-spillover" },
      { label: "China / Europe / BoJ", hint: "See whether offshore data confirms.", href: "/global-spillover" },
      { label: "US Assets", hint: "Map the spillover back into rates and risk.", href: "/rates-credit" }
    ],
    footer: "Global confirmation keeps a US-only macro call honest."
  }
};

export const layerMiniLogicMaps: Partial<Record<LayerPageSlug, MiniLogicMap>> = {
  liquidity: {
    title: "Liquidity mini map",
    summary: "Liquidity is an overlay, not a standalone macro call.",
    nodes: [
      { label: "Fed / TGA / RRP", hint: "Read the plumbing together.", href: "/macro-flow#liquidity-path" },
      { label: "Reserves / Net Liquidity", hint: "Decide whether the impulse is positive or draining.", href: "/liquidity" },
      { label: "Conditions / Credit", hint: "Check whether it transmits.", href: "/liquidity" },
      { label: "Risk Tape", hint: "Look for breadth and spread confirmation.", href: "/positioning" }
    ],
    footer: "Liquidity matters most when it changes how the macro tape trades."
  },
  "global-spillover": {
    title: "Global spillover mini map",
    summary: "Use the dollar and commodities to see whether the US macro message is broadening globally.",
    nodes: [
      { label: "DXY / FX", hint: "Start with financial conditions.", href: "/macro-flow#global-spillover-path" },
      { label: "Oil / Copper", hint: "Check inflation vs growth spillover.", href: "/global-spillover" },
      { label: "China / Europe / BoJ", hint: "Look for offshore confirmation.", href: "/global-spillover" },
      { label: "US Rates / Risk", hint: "Map it back into the domestic tape.", href: "/rates-credit" }
    ],
    footer: "The US story is stronger when global signals lean the same way."
  },
  "policy-expectations": {
    title: "Policy expectations mini map",
    summary: "Separate benign policy relief from growth fear or reflation pressure.",
    nodes: [
      { label: "SOFR / Next 3 FOMC", hint: "Start with the front-end path.", href: "/policy-expectations" },
      { label: "2Y / 10Y", hint: "Find where repricing is happening.", href: "/macro-flow#rates-curve" },
      { label: "Real Yield / Curve", hint: "Classify the move properly.", href: "/policy-expectations" },
      { label: "Credit / Mortgage", hint: "Check transmission and trust.", href: "/rates-credit" }
    ],
    footer: "Falling yields are only bullish when credit and internals agree."
  },
  positioning: {
    title: "Positioning mini map",
    summary: "A healthy tape needs participation, calm credit, and manageable crowding.",
    nodes: [
      { label: "Breadth / Equal-weight", hint: "Start with participation quality.", href: "/positioning" },
      { label: "Small Caps / Cyclicals", hint: "Check whether risk appetite is broadening.", href: "/positioning" },
      { label: "VIX / MOVE / HY", hint: "Look for hidden stress.", href: "/macro-flow#ig-hy-spreads" },
      { label: "Flows / Crowding", hint: "Judge how fragile the move could become.", href: "/positioning" }
    ],
    footer: "Positioning tells you how painful the unwind could be if macro shifts."
  }
};

export function getMiniLogicMapForModule(slug: MacroModuleSlug) {
  return moduleMiniLogicMaps[slug];
}

export function getMiniLogicMapForLayer(slug: LayerPageSlug) {
  return layerMiniLogicMaps[slug];
}
