import { macroIndicators } from "@/lib/data";
import { getFredBackupSourceUrl } from "@/lib/server/providers/fred-backup";
import { seriesConfigBySlug } from "@/lib/server/series-config";
import type { MacroIndicator, ProviderType } from "@/types/macro";

export type SourceFetchMethod =
  | "manual-seed"
  | "bls-public-data-api-v2"
  | "bea-release-page-scrape"
  | "census-release-page-scrape"
  | "dol-rss-and-release-page-scrape"
  | "federal-reserve-release-page-scrape"
  | "fred-series-observations-api"
  | "ism-release-page-scrape"
  | "treasury-textview-page-scrape"
  | "not-yet-implemented";

export type SourceResolver =
  | "manual"
  | "bls"
  | "bea"
  | "census"
  | "dol"
  | "fed"
  | "fred"
  | "ism"
  | "treasury"
  | "unimplemented";

export type LiveSupportLevel = "configured" | "manual-only" | "not-yet-implemented";

export interface IndicatorSourceEndpointContract {
  provider: ProviderType;
  resolver: SourceResolver;
  sourceName: string;
  sourceUrl?: string;
  fetchMethod: SourceFetchMethod;
  resolverSlug?: string;
}

export interface IndicatorSourceContract {
  slug: string;
  primary: IndicatorSourceEndpointContract;
  backup?: IndicatorSourceEndpointContract;
  updateCadence: string;
  expectedReleaseCadence: string;
  parseCurrentValue: string;
  parsePriorValue: string;
  revisionDetection: string;
  failureHandling: string;
  uiStatusLabeling: string;
  liveSupport: LiveSupportLevel;
}

function providerFetchMethod(provider: ProviderType): SourceFetchMethod {
  switch (provider) {
    case "bls":
      return "bls-public-data-api-v2";
    case "bea":
      return "bea-release-page-scrape";
    case "census":
      return "census-release-page-scrape";
    case "dol":
      return "dol-rss-and-release-page-scrape";
    case "fed":
      return "federal-reserve-release-page-scrape";
    case "fred":
    case "fred-backup":
      return "fred-series-observations-api";
    case "ism":
      return "ism-release-page-scrape";
    case "treasury":
      return "treasury-textview-page-scrape";
    default:
      return "manual-seed";
  }
}

function providerResolver(provider: ProviderType): SourceResolver {
  switch (provider) {
    case "bls":
    case "bea":
    case "census":
    case "dol":
    case "fed":
    case "fred":
    case "ism":
    case "treasury":
      return provider;
    case "fred-backup":
      return "fred";
    default:
      return "manual";
  }
}

function parseCurrentValue(provider: ProviderType) {
  switch (provider) {
    case "bls":
      return "Transform the latest official BLS observation into the display unit, then store it as current value.";
    case "bea":
      return "Parse the newest BEA release value from the published release page and store that release observation as current value.";
    case "census":
      return "Parse the latest Census release headline or derived release value from the release page text.";
    case "dol":
      return "Parse the latest weekly claims headline from the most recent DOL release.";
    case "fed":
      return "Parse the latest Federal Reserve release headline value for the current release month.";
    case "fred":
    case "fred-backup":
      return "Use the latest transformed FRED series observation after filtering missing values.";
    case "ism":
      return "Parse the newest ISM headline reading from the latest report page.";
    case "treasury":
      return "Use the latest available Treasury yield in the official daily yield curve table.";
    default:
      return "Use the seeded manual value.";
  }
}

function parsePriorValue(provider: ProviderType) {
  switch (provider) {
    case "bls":
    case "fred":
    case "fred-backup":
      return "Use the immediately prior transformed observation from the same series.";
    case "bea":
    case "census":
    case "fed":
    case "ism":
    case "treasury":
      return "Use the prior release or prior observation explicitly parsed alongside the latest release.";
    case "dol":
      return "Use the prior week's revised figure published inside the latest DOL claims release.";
    default:
      return "Use the seeded prior value.";
  }
}

function revisionDetection(provider: ProviderType) {
  switch (provider) {
    case "bls":
    case "bea":
    case "census":
    case "fed":
    case "ism":
      return "Compare the newly parsed prior value against the last stored live prior to detect revisions.";
    case "dol":
      return "Treat the revised prior figure embedded in the latest claims release as the revision source of truth.";
    case "fred":
    case "fred-backup":
      return "Detect revisions by comparing the latest transformed FRED history against the last stored live series values.";
    case "treasury":
      return "Treasury daily yields rarely revise materially; treat a changed prior table row as a refreshed official observation.";
    default:
      return "No live revision tracking; manual updates replace the seeded values when edited.";
  }
}

function defaultUpdateCadence(indicator: MacroIndicator, provider: ProviderType) {
  if (provider === "manual") {
    return "No automated refresh; manual seed stays in place until a live contract exists.";
  }

  if (indicator.frequency === "Daily" || indicator.frequency === "Live") {
    return "Refresh on each scheduled market sweep and keep stale-live if the newest fetch fails.";
  }

  if (indicator.frequency === "Weekly") {
    return "Refresh after the scheduled weekly release and on each daily health sweep.";
  }

  return "Refresh after the scheduled release and on each daily health sweep until the latest release is captured.";
}

function buildPrimaryContract(indicator: MacroIndicator): IndicatorSourceEndpointContract {
  if (indicator.slug === "ism-services") {
    return {
      provider: "ism",
      resolver: "ism",
      sourceName: indicator.source.name,
      sourceUrl: indicator.source.url,
      fetchMethod: "ism-release-page-scrape",
      resolverSlug: indicator.slug
    };
  }

  if (indicator.slug === "gdp-nowcast") {
    return {
      provider: "fed",
      resolver: "unimplemented",
      sourceName: indicator.source.name,
      sourceUrl: indicator.source.url,
      fetchMethod: "not-yet-implemented"
    };
  }

  return {
    provider: indicator.provider.type,
    resolver: providerResolver(indicator.provider.type),
    sourceName: indicator.source.name,
    sourceUrl: indicator.source.url,
    fetchMethod: providerFetchMethod(indicator.provider.type),
    resolverSlug: indicator.provider.type === "manual" || indicator.provider.type === "fred" ? undefined : indicator.slug
  };
}

function buildBackupContract(indicator: MacroIndicator, primary: IndicatorSourceEndpointContract) {
  if (primary.provider === "manual" || primary.provider === "fred" || primary.provider === "fred-backup") {
    return undefined;
  }

  const seriesConfig = seriesConfigBySlug[indicator.slug];

  if (!seriesConfig) {
    return undefined;
  }

  return {
    provider: "fred-backup" as const,
    resolver: "fred" as const,
    sourceName: "FRED backup",
    sourceUrl: getFredBackupSourceUrl(seriesConfig.seriesId),
    fetchMethod: "fred-series-observations-api" as const
  };
}

function liveSupportForIndicator(indicator: MacroIndicator, primary: IndicatorSourceEndpointContract): LiveSupportLevel {
  if (primary.provider === "manual") {
    return "manual-only";
  }

  if (primary.resolver === "unimplemented") {
    return "not-yet-implemented";
  }

  return "configured";
}

function buildContract(indicator: MacroIndicator): IndicatorSourceContract {
  const primary = buildPrimaryContract(indicator);
  const backup = buildBackupContract(indicator, primary);

  return {
    slug: indicator.slug,
    primary,
    backup,
    updateCadence: defaultUpdateCadence(indicator, primary.provider),
    expectedReleaseCadence: indicator.releaseCadence,
    parseCurrentValue: parseCurrentValue(primary.provider),
    parsePriorValue: parsePriorValue(primary.provider),
    revisionDetection: revisionDetection(primary.provider),
    failureHandling:
      "Retry with exponential backoff; if the primary source fails, use the configured backup source next; if both fail, serve last-good live as stale-live before falling back to seed/manual values.",
    uiStatusLabeling:
      "Keep the main UI minimal: show only status badge, updated time, and source label on the card surface; show the full source contract only in detail and health views.",
    liveSupport: liveSupportForIndicator(indicator, primary)
  };
}

export const indicatorSourceContractsBySlug: Record<string, IndicatorSourceContract> = Object.fromEntries(
  macroIndicators.map((indicator) => [indicator.slug, buildContract(indicator)])
);

export function getIndicatorSourceContract(indicator: MacroIndicator | string) {
  const slug = typeof indicator === "string" ? indicator : indicator.slug;
  return indicatorSourceContractsBySlug[slug];
}
