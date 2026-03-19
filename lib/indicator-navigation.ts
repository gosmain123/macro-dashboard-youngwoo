import { macroIndicators } from "@/lib/data";
import { getLogicChainForIndicator, getLogicChainHref } from "@/lib/playbook-guide";
import type { MacroIndicator } from "@/types/macro";

export type IndicatorNavigationLink = {
  label: string;
  href: string;
};

export type IndicatorNavigation = {
  checkNext: IndicatorNavigationLink[];
  related: IndicatorNavigationLink[];
  confirmIn: IndicatorNavigationLink[];
};

const preferredPageByModule: Partial<Record<MacroIndicator["module"], string>> = {
  inflation: "/inflation",
  growth: "/growth",
  labor: "/labor",
  "rates-credit": "/rates-credit",
  "policy-liquidity": "/liquidity",
  "market-internals": "/positioning",
  "flows-positioning": "/positioning",
  global: "/global-spillover"
};

const indicatorMap = new Map(macroIndicators.map((indicator) => [indicator.slug, indicator]));

const navigationBySlug: Record<
  string,
  {
    checkNext?: string[];
    related?: string[];
    confirmIn?: string[];
  }
> = {
  "cpi-headline": {
    checkNext: ["core-cpi", "services-ex-housing"],
    related: ["core-pce"],
    confirmIn: ["us-2y-treasury", "route:workflow"]
  },
  "core-cpi": {
    checkNext: ["services-ex-housing", "shelter-inflation"],
    related: ["cpi-headline", "core-pce"],
    confirmIn: ["us-2y-treasury", "route:workflow"]
  },
  "core-pce": {
    checkNext: ["services-ex-housing", "shelter-inflation"],
    related: ["core-cpi", "cpi-headline"],
    confirmIn: ["us-2y-treasury", "route:workflow"]
  },
  "ppi-final-demand": {
    checkNext: ["core-pce", "wti-oil"],
    related: ["cpi-headline"],
    confirmIn: ["us-2y-treasury", "route:workflow"]
  },
  "nonfarm-payrolls": {
    checkNext: ["unemployment-rate", "avg-hourly-earnings"],
    related: ["initial-claims"],
    confirmIn: ["route:workflow", "hy-spreads"]
  },
  "unemployment-rate": {
    checkNext: ["initial-claims", "nonfarm-payrolls"],
    related: ["avg-hourly-earnings"],
    confirmIn: ["hy-spreads", "route:workflow"]
  },
  "avg-hourly-earnings": {
    checkNext: ["core-pce", "nonfarm-payrolls"],
    related: ["core-cpi"],
    confirmIn: ["us-2y-treasury", "route:workflow"]
  },
  "initial-claims": {
    checkNext: ["continuing-claims", "unemployment-rate"],
    related: ["nonfarm-payrolls"],
    confirmIn: ["hy-spreads", "route:workflow"]
  },
  "ism-manufacturing": {
    checkNext: ["industrial-production", "durable-goods"],
    related: ["ism-services"],
    confirmIn: ["us-10y-treasury", "route:workflow"]
  },
  "ism-services": {
    checkNext: ["retail-sales", "nonfarm-payrolls"],
    related: ["ism-manufacturing"],
    confirmIn: ["us-10y-treasury", "route:workflow"]
  },
  "us-2y-treasury": {
    checkNext: ["sofr-implied-cuts", "core-pce"],
    related: ["us-10y-treasury", "ten-year-real-yield"],
    confirmIn: ["route:workflow", "hy-spreads"]
  },
  "us-10y-treasury": {
    checkNext: ["ten-year-real-yield", "mortgage-rates"],
    related: ["curve-2s10s", "us-2y-treasury"],
    confirmIn: ["route:workflow", "hy-spreads"]
  },
  "hy-spreads": {
    checkNext: ["ig-spreads", "breadth"],
    related: ["small-caps-vs-large-caps"],
    confirmIn: ["route:workflow", "route:playbook"]
  },
  "ig-spreads": {
    checkNext: ["hy-spreads", "breadth"],
    related: ["us-10y-treasury"],
    confirmIn: ["route:workflow", "route:playbook"]
  },
  "fed-balance-sheet": {
    checkNext: ["rrp-balance", "tga-balance"],
    related: ["reserve-balances"],
    confirmIn: ["hy-spreads", "route:workflow"]
  },
  dxy: {
    checkNext: ["usdcnh", "copper"],
    related: ["eurusd", "usdjpy"],
    confirmIn: ["route:workflow", "us-2y-treasury"]
  },
  breadth: {
    checkNext: ["equal-weight-vs-cap-weight", "small-caps-vs-large-caps"],
    related: ["hy-spreads"],
    confirmIn: ["route:workflow", "route:playbook"]
  }
};

function indicatorHref(indicator: MacroIndicator) {
  const basePath = preferredPageByModule[indicator.module] ?? `/${indicator.module}`;
  return `${basePath}#${indicator.slug}`;
}

function makeIndicatorLink(slug: string): IndicatorNavigationLink | null {
  const indicator = indicatorMap.get(slug);

  if (!indicator) {
    return null;
  }

  return {
    label: indicator.shortName,
    href: indicatorHref(indicator)
  };
}

function makeRouteLink(route: string): IndicatorNavigationLink | null {
  if (route === "workflow") {
    return { label: "Workflow", href: "/workflow" };
  }

  if (route === "playbook") {
    return { label: "Playbook", href: "/playbook" };
  }

  if (route === "rates-credit") {
    return { label: "Rates & Credit", href: "/rates-credit" };
  }

  return { label: "Calendar", href: "/calendar" };
}

function toLink(value: string) {
  if (value.startsWith("route:")) {
    return makeRouteLink(value.replace("route:", ""));
  }

  return makeIndicatorLink(value);
}

function uniqueLinks(links: Array<IndicatorNavigationLink | null | undefined>) {
  const seen = new Set<string>();

  return links.filter((link): link is IndicatorNavigationLink => {
    if (!link || seen.has(link.href)) {
      return false;
    }

    seen.add(link.href);
    return true;
  });
}

export function getIndicatorNavigation(indicator: Pick<MacroIndicator, "slug" | "module">): IndicatorNavigation {
  const mapping = navigationBySlug[indicator.slug];
  const logicChain = getLogicChainForIndicator(indicator.slug);
  const defaultConfirmLinks = logicChain
    ? [{ label: logicChain.title, href: getLogicChainHref(logicChain.id) }, { label: "Workflow", href: "/workflow" }]
    : [{ label: "Workflow", href: "/workflow" }];

  return {
    checkNext: uniqueLinks((mapping?.checkNext ?? []).map((entry) => toLink(entry)).slice(0, 2)),
    related: uniqueLinks((mapping?.related ?? []).map((entry) => toLink(entry)).slice(0, 2)),
    confirmIn: uniqueLinks(
      (mapping?.confirmIn ?? []).map((entry) => toLink(entry))
        .concat(defaultConfirmLinks)
        .slice(0, 3)
    )
  };
}
