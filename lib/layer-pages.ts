import {
  globalSpilloverIndicators,
  liquiditySupplementalIndicators,
  policyExpectationIndicators,
  positioningSupplementalIndicators
} from "@/lib/layer-extra-indicators";
import type { DashboardPayload, MacroIndicator } from "@/types/macro";

export type LayerPageSlug = "liquidity" | "global-spillover" | "policy-expectations" | "positioning";

type LayerPageSectionDefinition = {
  id: string;
  title: string;
  description: string;
  indicatorSlugs: string[];
};

type LayerPageDefinition = {
  slug: LayerPageSlug;
  href: string;
  navLabel: string;
  title: string;
  kicker: string;
  description: string;
  goal: string;
  workflow: string[];
  cautions: string[];
  homeSummary: string;
  homePrompt: string;
  homeFocusSlugs: string[];
  sections: LayerPageSectionDefinition[];
};

export type LayerPageSection = Omit<LayerPageSectionDefinition, "indicatorSlugs"> & {
  indicators: MacroIndicator[];
};

export type LayerPagePayload = Omit<LayerPageDefinition, "homeFocusSlugs" | "sections"> & {
  indicators: MacroIndicator[];
  sections: LayerPageSection[];
  liveCount: number;
  staleLiveCount: number;
  fallbackCount: number;
  errorCount: number;
  officialCount: number;
  manualCount: number;
};

export type LayerHomeCard = {
  slug: LayerPageSlug;
  href: string;
  kicker: string;
  title: string;
  summary: string;
  prompt: string;
  driverLine: string;
  liveCount: number;
  staleLiveCount: number;
  fallbackCount: number;
  errorCount: number;
};

const supplementalIndicators: Record<LayerPageSlug, MacroIndicator[]> = {
  liquidity: liquiditySupplementalIndicators,
  "global-spillover": globalSpilloverIndicators,
  "policy-expectations": policyExpectationIndicators,
  positioning: positioningSupplementalIndicators
};

const layerPageDefinitions: Record<LayerPageSlug, LayerPageDefinition> = {
  liquidity: {
    slug: "liquidity",
    href: "/liquidity",
    navLabel: "Liquidity",
    title: "Liquidity",
    kicker: "Plumbing and transmission",
    description: "See why markets can stay resilient or fragile even when standard macro releases look mixed.",
    goal: "Start with system liquidity, then check whether that cash impulse is actually reaching credit and the real economy.",
    workflow: [
      "Read the Fed balance sheet, RRP, TGA, and reserves together before reacting to one plumbing series.",
      "Then check financial conditions, bank credit growth, and loan standards to see whether liquidity is transmitting.",
      "Confirm the message in HY spreads and breadth before assuming liquidity can overpower the macro tape."
    ],
    cautions: [
      "Liquidity can cushion mixed macro for a while, but it does not erase recession risk.",
      "RRP falling is helpful until reserves become the marginal absorber.",
      "Credit transmission matters more than one balance-sheet print."
    ],
    homeSummary: "Use this layer when the macro tape looks mixed but price action still feels stronger or weaker than expected.",
    homePrompt: "Check liquidity after the core macro prints to decide whether the plumbing is cushioning or amplifying the move.",
    homeFocusSlugs: ["net-liquidity", "reserve-balances", "loan-standards"],
    sections: [
      {
        id: "system-liquidity",
        title: "System Liquidity",
        description: "Track the Fed, Treasury cash, RRP, and reserve buffers as one plumbing stack rather than isolated prints.",
        indicatorSlugs: ["fed-balance-sheet", "rrp-balance", "tga-balance", "reserve-balances", "net-liquidity"]
      },
      {
        id: "credit-transmission",
        title: "Credit Transmission",
        description: "Check whether easier or tighter liquidity is actually flowing into lending conditions, credit creation, and financing costs.",
        indicatorSlugs: ["financial-conditions-index", "bank-credit-growth", "loan-standards", "fed-funds-upper"]
      }
    ]
  },
  "global-spillover": {
    slug: "global-spillover",
    href: "/global-spillover",
    navLabel: "FX & Commodities",
    title: "FX & Commodities / Global Spillover",
    kicker: "Dollar, commodities, and offshore confirmation",
    description:
      "Connect global macro and cross-asset moves back to US inflation, growth, and financial conditions.",
    goal: "Use FX, commodities, and offshore growth cross-checks to decide whether the domestic macro story is broadening or being offset abroad.",
    workflow: [
      "Start with the dollar complex first because FX often tells you whether global conditions are tightening or easing.",
      "Then check oil, gas, copper, and gold to see whether inflation pressure or growth optimism is spreading across assets.",
      "Confirm with China, Europe, and BoJ signals before treating a US-only narrative as global."
    ],
    cautions: [
      "A weaker dollar only helps risk if it is not being driven by a US growth scare.",
      "Commodity spikes can be supply noise rather than broad demand strength.",
      "Global confirmation matters most when it agrees with rates and credit."
    ],
    homeSummary: "Use this layer to avoid making a US macro call that is contradicted by the dollar, commodities, or offshore growth.",
    homePrompt: "Check spillover after domestic data to see whether the move is broadening through FX and commodities or staying local.",
    homeFocusSlugs: ["dxy", "usdcnh", "copper"],
    sections: [
      {
        id: "fx-spillover",
        title: "FX Spillover",
        description: "Read the broad dollar alongside the major crosses that drive global liquidity and China-sensitive risk sentiment.",
        indicatorSlugs: ["dxy", "eurusd", "usdjpy", "usdcnh"]
      },
      {
        id: "commodities",
        title: "Commodities and Inflation Transmission",
        description: "Check whether energy or industrial inputs are reinforcing the inflation and growth message coming from macro releases.",
        indicatorSlugs: ["wti-oil", "natural-gas", "copper", "gold", "copper-gold-ratio"]
      },
      {
        id: "global-cross-checks",
        title: "Global Cross-Checks",
        description: "Use offshore PMIs and policy signals to confirm whether the US macro view is actually broadening.",
        indicatorSlugs: [
          "china-pmi",
          "eurozone-pmi",
          "boj-policy",
          "major-central-bank-tracker",
          "global-growth-cross-check"
        ]
      }
    ]
  },
  "policy-expectations": {
    slug: "policy-expectations",
    href: "/policy-expectations",
    navLabel: "Policy Expectations",
    title: "Policy Expectations",
    kicker: "Fed path vs growth fear",
    description: "Separate rate moves driven by policy repricing from rate moves driven by growth or inflation.",
    goal: "Use the front end, the curve, and rate decomposition to see whether markets are repricing Fed cuts, inflation risk, or growth stress.",
    workflow: [
      "Start with SOFR-implied cuts, the next three FOMC meetings, and the 2Y to read the front-end policy message.",
      "Then split the long end into the 10Y, real yields, and curve shape to see whether the move is inflation, growth, or term premium.",
      "Confirm in credit spreads and mortgage transmission before calling the move benign or dangerous."
    ],
    cautions: [
      "A falling 2Y with widening spreads is usually growth fear, not simple policy relief.",
      "Do not treat every curve steepener as bullish without checking whether it is bull or bear steepening.",
      "Mortgage and credit transmission keep rate moves grounded in the real economy."
    ],
    homeSummary: "Use this layer to tell whether the market just repriced the Fed path or is reacting to something deeper in growth or inflation.",
    homePrompt: "Check policy expectations after every major print to separate benign easing from hard-landing stress or reflation pressure.",
    homeFocusSlugs: ["us-2y-treasury", "sofr-implied-cuts", "ten-year-real-yield"],
    sections: [
      {
        id: "front-end-pricing",
        title: "Front-End Policy Pricing",
        description: "These are the fastest market reads on whether the next few Fed meetings are being repriced.",
        indicatorSlugs: ["sofr-implied-cuts", "next-three-fomc-path", "terminal-rate-pricing", "us-2y-treasury"]
      },
      {
        id: "rate-decomposition",
        title: "Rate Decomposition",
        description: "Use the long end, real yields, and the curve to separate policy relief from inflation or growth stress.",
        indicatorSlugs: ["us-10y-treasury", "ten-year-real-yield", "curve-2s10s", "curve-3m10y"]
      },
      {
        id: "market-confirmation",
        title: "Market Confirmation",
        description: "Credit and housing transmission are the reality check on whether rate relief is actually constructive.",
        indicatorSlugs: ["ig-spreads", "hy-spreads", "mortgage-rates", "fed-funds-upper"]
      }
    ]
  },
  positioning: {
    slug: "positioning",
    href: "/positioning",
    navLabel: "Positioning",
    title: "Positioning / Market Internals",
    kicker: "Tape quality and crowding",
    description: "Distinguish constructive risk appetite from crowded positioning, narrowing leadership, or early stress.",
    goal: "Use breadth, volatility, credit, and flow data together to decide whether the market move is healthy or fragile.",
    workflow: [
      "Start with breadth and leadership because a strong index can still be hiding weak participation underneath.",
      "Then check VIX, MOVE, and credit spreads to see whether risk appetite is being confirmed or quietly challenged.",
      "Overlay flows, buybacks, and crowding to judge how painful a reversal could become if the macro tape changes."
    ],
    cautions: [
      "A calm VIX does not mean the tape is healthy if breadth keeps narrowing.",
      "Strong price action can still be fragile when positioning is crowded.",
      "Credit disagreement matters more than index-level calm."
    ],
    homeSummary: "Use this layer to judge whether the market is genuinely embracing risk or just being squeezed by flows and concentration.",
    homePrompt: "Check positioning after rates and credit to decide whether the move is broad, crowded, or starting to fray.",
    homeFocusSlugs: ["breadth", "equal-weight-vs-cap-weight", "hy-spreads"],
    sections: [
      {
        id: "breadth-and-leadership",
        title: "Breadth and Leadership",
        description: "These cards tell you whether participation is broadening beyond a narrow group of leaders.",
        indicatorSlugs: [
          "breadth",
          "equal-weight-vs-cap-weight",
          "small-caps-vs-large-caps",
          "cyclical-vs-defensive"
        ]
      },
      {
        id: "stress-barometers",
        title: "Stress Barometers",
        description: "Use volatility and credit to check whether risk-taking is actually being validated across assets.",
        indicatorSlugs: ["vix", "move-index", "hy-spreads", "ig-spreads"]
      },
      {
        id: "flows-and-crowding",
        title: "Flows and Crowding",
        description: "These overlays explain why markets can keep squeezing higher or reverse faster than the macro story alone suggests.",
        indicatorSlugs: ["etf-flows", "buyback-window", "cftc-cot", "crowding-flags", "thirteen-f-tracker"]
      }
    ]
  }
};

function uniqueIndicators(indicators: Array<MacroIndicator | undefined>) {
  const seen = new Set<string>();

  return indicators.filter((indicator): indicator is MacroIndicator => {
    if (!indicator || seen.has(indicator.slug)) {
      return false;
    }

    seen.add(indicator.slug);
    return true;
  });
}

function getIndicatorMaps(payload: DashboardPayload, slug: LayerPageSlug) {
  return {
    payloadIndicators: new Map(payload.indicators.map((indicator) => [indicator.slug, indicator])),
    supplementalPageIndicators: new Map(supplementalIndicators[slug].map((indicator) => [indicator.slug, indicator]))
  };
}

function resolveIndicator(
  slug: string,
  payloadIndicators: Map<string, MacroIndicator>,
  supplementalPageIndicators: Map<string, MacroIndicator>
) {
  return payloadIndicators.get(slug) ?? supplementalPageIndicators.get(slug);
}

function countStatuses(indicators: MacroIndicator[]) {
  return {
    liveCount: indicators.filter((indicator) => indicator.status === "live").length,
    staleLiveCount: indicators.filter((indicator) => indicator.status === "stale-live").length,
    fallbackCount: indicators.filter((indicator) => indicator.status === "fallback").length,
    errorCount: indicators.filter((indicator) => indicator.status === "error").length
  };
}

function buildDriverLine(indicators: MacroIndicator[]) {
  return indicators.map((indicator) => `${indicator.shortName}: ${indicator.regimeTag}`).join(" | ");
}

export function getLayerPagePayload(payload: DashboardPayload, slug: LayerPageSlug): LayerPagePayload {
  const definition = layerPageDefinitions[slug];
  const { payloadIndicators, supplementalPageIndicators } = getIndicatorMaps(payload, slug);

  const sections = definition.sections
    .map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      indicators: uniqueIndicators(
        section.indicatorSlugs.map((indicatorSlug) =>
          resolveIndicator(indicatorSlug, payloadIndicators, supplementalPageIndicators)
        )
      )
    }))
    .filter((section) => section.indicators.length > 0);

  const indicators = uniqueIndicators(sections.flatMap((section) => section.indicators));
  const statusCounts = countStatuses(indicators);

  return {
    slug: definition.slug,
    href: definition.href,
    navLabel: definition.navLabel,
    title: definition.title,
    kicker: definition.kicker,
    description: definition.description,
    goal: definition.goal,
    workflow: definition.workflow,
    cautions: definition.cautions,
    homeSummary: definition.homeSummary,
    homePrompt: definition.homePrompt,
    sections,
    indicators,
    officialCount: indicators.filter((indicator) => indicator.source.access === "official-free").length,
    manualCount: indicators.filter((indicator) => indicator.source.access === "licensed-manual").length,
    ...statusCounts
  };
}

export function getLayerHomeCards(payload: DashboardPayload): LayerHomeCard[] {
  return layerPageOrder.map((slug) => {
    const page = getLayerPagePayload(payload, slug);
    const { payloadIndicators, supplementalPageIndicators } = getIndicatorMaps(payload, slug);
    const focusedIndicators = uniqueIndicators(
      layerPageDefinitions[slug].homeFocusSlugs.map((indicatorSlug) =>
        resolveIndicator(indicatorSlug, payloadIndicators, supplementalPageIndicators)
      )
    );

    return {
      slug,
      href: page.href,
      kicker: page.kicker,
      title: page.title,
      summary: page.homeSummary,
      prompt: page.homePrompt,
      driverLine:
        focusedIndicators.length > 0
          ? buildDriverLine(focusedIndicators)
          : "Read the layer cards for the latest cross-checks.",
      liveCount: page.liveCount,
      staleLiveCount: page.staleLiveCount,
      fallbackCount: page.fallbackCount,
      errorCount: page.errorCount
    };
  });
}

export const layerPageOrder = [
  "liquidity",
  "global-spillover",
  "policy-expectations",
  "positioning"
] as const satisfies readonly LayerPageSlug[];

export const layerNavigationLinks = layerPageOrder.map((slug) => ({
  href: layerPageDefinitions[slug].href,
  label: layerPageDefinitions[slug].navLabel
}));
