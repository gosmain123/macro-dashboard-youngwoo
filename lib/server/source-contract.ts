import { macroIndicators } from "@/lib/data";
import { getFredBackupSourceUrl } from "@/lib/server/providers/fred-backup";
import { seriesConfigBySlug } from "@/lib/server/series-config";
import type {
  CalendarEventStatus,
  IndicatorRefreshBehavior,
  IndicatorReleaseDataShape,
  IndicatorSourceFamily,
  MacroIndicator,
  ProviderType
} from "@/types/macro";

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
export type SourceScheduleKind =
  | "official-schedule"
  | "revised-schedule"
  | "release-cadence"
  | "monthly-calendar"
  | "auction-schedule"
  | "timing-metadata"
  | "daily-feed";

export interface IndicatorSourceEndpointContract {
  provider: ProviderType;
  resolver: SourceResolver;
  sourceName: string;
  sourceUrl?: string;
  fetchMethod: SourceFetchMethod;
  resolverSlug?: string;
}

export interface IndicatorScheduleEndpointContract {
  kind: SourceScheduleKind;
  sourceName: string;
  sourceUrl?: string;
  note?: string;
}

export interface IndicatorSourceContract {
  slug: string;
  sourceFamily: IndicatorSourceFamily;
  refreshBehavior: IndicatorRefreshBehavior;
  releaseDataShape: IndicatorReleaseDataShape;
  sourceStrategy: string;
  releaseWindowPolicy: string;
  liveStatusRule: string;
  productTruth: string;
  calendarSources: IndicatorScheduleEndpointContract[];
  supportedEventStatuses: CalendarEventStatus[];
  scheduleChangePolicy: string;
  releaseStoragePolicy: string;
  workflowStoragePolicy: string;
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

const blsInflationLaborSlugs = new Set([
  "cpi-headline",
  "core-cpi",
  "ppi-final-demand",
  "avg-hourly-earnings",
  "nonfarm-payrolls",
  "unemployment-rate",
  "jolts-openings",
  "participation-rate",
  "quits-rate",
  "average-weekly-hours"
]);

const beaGrowthIncomeSlugs = new Set(["core-pce"]);

const censusGrowthHousingSlugs = new Set(["retail-sales", "durable-goods", "housing-starts", "building-permits"]);

const ismSurveySlugs = new Set(["ism-manufacturing", "ism-services"]);

const fedPolicyCalendarSlugs = new Set(["fed-funds-upper"]);

const federalReserveReleaseSlugs = new Set(["gdp-nowcast", "industrial-production"]);

const dolWeeklyClaimsSlugs = new Set(["initial-claims", "continuing-claims"]);

const treasuryRatesSlugs = new Set([
  "us-2y-treasury",
  "us-10y-treasury",
  "us-30y-treasury",
  "curve-2s10s",
  "curve-3m10y",
  "ten-year-real-yield"
]);

const scheduleSources = {
  blsGeneralSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS 2026 selected release schedule",
    sourceUrl: "https://www.bls.gov/schedule/2026/"
  },
  blsRevisedSchedule: {
    kind: "revised-schedule" as const,
    sourceName: "BLS revised release dates",
    sourceUrl: "https://www.bls.gov/bls/2025-lapse-revised-release-dates.htm",
    note: "Use this override page when BLS announces delays, shutdown changes, or revised release dates."
  },
  blsCpiSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS CPI release calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/cpi.htm"
  },
  blsPpiSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS PPI release calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/ppi.htm"
  },
  blsEmploymentSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS Employment Situation calendar",
    sourceUrl: "https://www.bls.gov/ces/publications/news-release-schedule.htm"
  },
  blsJoltsSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS JOLTS release calendar",
    sourceUrl: "https://www.bls.gov/jlt/"
  },
  blsImportExportSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS Import and Export Prices calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/ximpim.htm"
  },
  blsEciSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS Employment Cost Index calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/eci.htm"
  },
  blsProductivitySchedule: {
    kind: "official-schedule" as const,
    sourceName: "BLS Productivity calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/prod2.htm"
  },
  beaSchedule: {
    kind: "official-schedule" as const,
    sourceName: "BEA release schedule",
    sourceUrl: "https://www.bea.gov/news/schedule/full"
  },
  censusCalendar: {
    kind: "official-schedule" as const,
    sourceName: "Census economic indicators calendar",
    sourceUrl: "https://www.census.gov/economic-indicators/calendar-listview.html"
  },
  censusRetail: {
    kind: "official-schedule" as const,
    sourceName: "Census retail sales release",
    sourceUrl: "https://www.census.gov/retail/sales.html"
  },
  censusHousing: {
    kind: "official-schedule" as const,
    sourceName: "Census housing release",
    sourceUrl: "https://www.census.gov/construction/nrc/index.html"
  },
  censusDurableGoods: {
    kind: "official-schedule" as const,
    sourceName: "Census durable goods release",
    sourceUrl: "https://www.census.gov/manufacturing/m3/index.html"
  },
  ismManufacturing: {
    kind: "release-cadence" as const,
    sourceName: "ISM Manufacturing PMI release cadence",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/"
  },
  ismServices: {
    kind: "release-cadence" as const,
    sourceName: "ISM Services PMI release cadence",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/"
  },
  fedMonthlyCalendar: {
    kind: "monthly-calendar" as const,
    sourceName: "Federal Reserve monthly calendar",
    sourceUrl: "https://www.federalreserve.gov/newsevents/calendar.htm"
  },
  fomcCalendar: {
    kind: "official-schedule" as const,
    sourceName: "Federal Reserve FOMC calendar",
    sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
  },
  treasuryXmlFeed: {
    kind: "daily-feed" as const,
    sourceName: "U.S. Treasury daily interest rate XML feed",
    sourceUrl: "https://home.treasury.gov/treasury-daily-interest-rate-xml-feed"
  },
  treasuryAuctionSchedule: {
    kind: "auction-schedule" as const,
    sourceName: "Treasury auction schedule",
    sourceUrl: "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics"
  },
  conferenceBoardTiming: {
    kind: "timing-metadata" as const,
    sourceName: "Conference Board timing metadata",
    sourceUrl: "https://www.conference-board.org/topics/consumer-confidence"
  }
};

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

function buildPrimaryContract(indicator: MacroIndicator): IndicatorSourceEndpointContract {
 if (indicator.slug === "ism-services" && indicator.provider.type !== "manual") {
  return {
    provider: "ism",
    resolver: "ism",
    sourceName: indicator.source.name,
    sourceUrl: indicator.source.url,
    fetchMethod: "ism-release-page-scrape",
    resolverSlug: indicator.slug
  };
}

if (indicator.slug === "gdp-nowcast" && indicator.provider.type !== "manual") {
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

function resolveSourceFamily(
  indicator: MacroIndicator,
  primary: IndicatorSourceEndpointContract
): IndicatorSourceFamily {
  if (blsInflationLaborSlugs.has(indicator.slug)) {
    return "bls-inflation-labor-release-family";
  }

  if (beaGrowthIncomeSlugs.has(indicator.slug)) {
    return "bea-growth-income-family";
  }

  if (censusGrowthHousingSlugs.has(indicator.slug)) {
    return "census-growth-housing-family";
  }

  if (ismSurveySlugs.has(indicator.slug)) {
    return "ism-survey-family";
  }

  if (fedPolicyCalendarSlugs.has(indicator.slug)) {
    return "fed-policy-calendar-family";
  }

  if (federalReserveReleaseSlugs.has(indicator.slug)) {
    return "federal-reserve-release-family";
  }

  if (dolWeeklyClaimsSlugs.has(indicator.slug)) {
    return "dol-weekly-claims-family";
  }

  if (treasuryRatesSlugs.has(indicator.slug)) {
    return "treasury-rates-family";
  }

  if (primary.provider === "manual") {
    return "manual-seed-family";
  }

  return "derived-backup-series-family";
}

function resolveRefreshBehavior(sourceFamily: IndicatorSourceFamily): IndicatorRefreshBehavior {
  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
    case "bea-growth-income-family":
    case "census-growth-housing-family":
    case "ism-survey-family":
    case "federal-reserve-release-family":
    case "dol-weekly-claims-family":
      return "release-driven-series";
    case "treasury-rates-family":
      return "daily-official-snapshot";
    case "fed-policy-calendar-family":
      return "event-schedule-metadata";
    case "manual-seed-family":
      return "manual-seed-only";
    default:
      return "derived-series-snapshot";
  }
}

function resolveReleaseDataShape(
  indicator: MacroIndicator,
  sourceFamily: IndicatorSourceFamily
): IndicatorReleaseDataShape {
  if (sourceFamily === "manual-seed-family") {
    return "manual-seed";
  }

  if (sourceFamily === "treasury-rates-family") {
    return "daily-snapshot";
  }

  if (sourceFamily === "fed-policy-calendar-family" && indicator.slug === "fed-funds-upper") {
    return "numeric-release";
  }

  if (
    sourceFamily === "bls-inflation-labor-release-family" ||
    sourceFamily === "bea-growth-income-family" ||
    sourceFamily === "census-growth-housing-family" ||
    sourceFamily === "ism-survey-family" ||
    sourceFamily === "federal-reserve-release-family" ||
    sourceFamily === "dol-weekly-claims-family"
  ) {
    return "numeric-release";
  }

  return "derived-series";
}

function buildCalendarSources(
  indicator: MacroIndicator,
  sourceFamily: IndicatorSourceFamily
): IndicatorScheduleEndpointContract[] {
  switch (indicator.slug) {
    case "cpi-headline":
    case "core-cpi":
      return [scheduleSources.blsCpiSchedule, scheduleSources.blsGeneralSchedule, scheduleSources.blsRevisedSchedule];
    case "ppi-final-demand":
      return [scheduleSources.blsPpiSchedule, scheduleSources.blsGeneralSchedule, scheduleSources.blsRevisedSchedule];
    case "avg-hourly-earnings":
    case "nonfarm-payrolls":
    case "unemployment-rate":
    case "participation-rate":
    case "average-weekly-hours":
      return [
        scheduleSources.blsEmploymentSchedule,
        scheduleSources.blsGeneralSchedule,
        scheduleSources.blsRevisedSchedule
      ];
    case "jolts-openings":
    case "quits-rate":
      return [scheduleSources.blsJoltsSchedule, scheduleSources.blsGeneralSchedule, scheduleSources.blsRevisedSchedule];
    case "core-pce":
      return [scheduleSources.beaSchedule];
    case "retail-sales":
      return [scheduleSources.censusRetail, scheduleSources.censusCalendar];
    case "durable-goods":
      return [scheduleSources.censusDurableGoods, scheduleSources.censusCalendar];
    case "housing-starts":
    case "building-permits":
      return [scheduleSources.censusHousing, scheduleSources.censusCalendar];
    case "ism-manufacturing":
      return [scheduleSources.ismManufacturing];
    case "ism-services":
      return [scheduleSources.ismServices];
    case "fed-funds-upper":
      return [scheduleSources.fomcCalendar, scheduleSources.fedMonthlyCalendar];
    case "industrial-production":
      return [scheduleSources.fedMonthlyCalendar];
    case "us-2y-treasury":
    case "us-10y-treasury":
    case "us-30y-treasury":
    case "curve-2s10s":
    case "curve-3m10y":
    case "ten-year-real-yield":
      return [scheduleSources.treasuryXmlFeed, scheduleSources.treasuryAuctionSchedule];
    case "leading-economic-index":
      return [scheduleSources.conferenceBoardTiming];
    default:
      if (sourceFamily === "dol-weekly-claims-family") {
        return [
          {
            kind: "official-schedule",
            sourceName: "U.S. Department of Labor weekly claims release",
            sourceUrl: "https://www.dol.gov/newsroom/releases",
            note: "Weekly claims are effectively schedule-driven even when the release page is the primary public schedule source."
          }
        ];
      }

      return [];
  }
}

function supportedEventStatusesForContract(
  refreshBehavior: IndicatorRefreshBehavior,
  releaseDataShape: IndicatorReleaseDataShape
): CalendarEventStatus[] {
  if (releaseDataShape === "manual-seed") {
    return [];
  }

  if (refreshBehavior === "daily-official-snapshot" || releaseDataShape === "daily-snapshot") {
    return ["released", "delayed", "canceled"];
  }

  if (refreshBehavior === "derived-series-snapshot" || releaseDataShape === "derived-series") {
    return ["released", "revised"];
  }

  return ["scheduled", "released", "revised", "delayed", "canceled"];
}

function expectedDirectProvidersForFamily(sourceFamily: IndicatorSourceFamily): ProviderType[] {
  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
      return ["bls"];
    case "bea-growth-income-family":
      return ["bea"];
    case "census-growth-housing-family":
      return ["census"];
    case "ism-survey-family":
      return ["ism"];
    case "fed-policy-calendar-family":
    case "federal-reserve-release-family":
      return ["fed"];
    case "dol-weekly-claims-family":
      return ["dol"];
    case "treasury-rates-family":
      return ["treasury"];
    case "manual-seed-family":
      return ["manual"];
    default:
      return ["fred", "fred-backup"];
  }
}

function preferredSourcePolicy(sourceFamily: IndicatorSourceFamily) {
  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
      return "Preferred primary: BLS release schedules and BLS data APIs for inflation and labor releases; use FRED only as backup or temporary derived layer where direct BLS integration is still missing.";
    case "bea-growth-income-family":
      return "Preferred primary: BEA release schedule and BEA data APIs for GDP, Personal Income and Outlays, and PCE-family releases; use FRED only as backup where direct BEA integration is still missing.";
    case "census-growth-housing-family":
      return "Preferred primary: U.S. Census economic indicator schedules and release feeds for retail, durables, housing, and factory-related releases; use FRED only as backup or derived layer where direct Census integration is not yet stable.";
    case "ism-survey-family":
      return "Preferred primary: ISM release cadence and report pages for Manufacturing and Services PMI releases.";
    case "fed-policy-calendar-family":
      return "Preferred primary: Federal Reserve official calendars and release pages for FOMC and policy-event metadata. These events can be schedule-first and non-numeric.";
    case "federal-reserve-release-family":
      return "Preferred primary: Federal Reserve official release pages for Fed-authored macro publications such as G.17 or GDPNow-style release materials.";
    case "dol-weekly-claims-family":
      return "Preferred primary: DOL weekly release pages and RSS metadata for jobless claims releases; use FRED only as backup where needed.";
    case "treasury-rates-family":
      return "Preferred primary: U.S. Treasury official daily yield-curve and real-yield feeds; use FRED only as backup or derived layer where direct Treasury integration is missing or too fragile.";
    case "manual-seed-family":
      return "No live source resolver is configured yet; the app stays on seeded/manual values until a live contract is implemented.";
    default:
      return "Use FRED where it is the most stable derived-series or backup layer, especially when direct official integration is missing, too fragile, or unnecessary for the current product scope.";
  }
}

function buildSourceStrategy(
  indicator: MacroIndicator,
  sourceFamily: IndicatorSourceFamily,
  primary: IndicatorSourceEndpointContract,
  backup?: IndicatorSourceEndpointContract
) {
  const preferredPolicy = preferredSourcePolicy(sourceFamily);
  const backupDetail = backup ? ` Backup layer: ${backup.sourceName} via ${backup.fetchMethod}.` : "";

  if (sourceFamily === "manual-seed-family") {
    return preferredPolicy;
  }

  if (primary.fetchMethod === "not-yet-implemented") {
    return `${preferredPolicy} Current live resolver for ${indicator.name} is not implemented yet.${backupDetail}`;
  }

  if (expectedDirectProvidersForFamily(sourceFamily).includes(primary.provider)) {
    return `${preferredPolicy} Current live resolver: ${primary.sourceName} via ${primary.fetchMethod}.${backupDetail}`;
  }

  return `${preferredPolicy} Current live resolver is ${primary.sourceName} via ${primary.fetchMethod} until the preferred direct family integration is implemented.${backupDetail}`;
}

function scheduleChangePolicy(
  indicator: MacroIndicator,
  sourceFamily: IndicatorSourceFamily,
  calendarSources: IndicatorScheduleEndpointContract[]
) {
  if (calendarSources.length === 0) {
    return "No explicit official schedule source is configured yet. Keep this indicator out of release-time scheduling assumptions until a schedule contract is added.";
  }

  if (sourceFamily === "bls-inflation-labor-release-family") {
    return "Use the BLS release schedule as the default calendar source of truth, and override event timing/status from the BLS revised release dates page whenever BLS announces delays, shutdown changes, or cancellations.";
  }

  if (sourceFamily === "bea-growth-income-family") {
    return "Use the BEA release schedule as the calendar source of truth, and honor BEA schedule updates when GDP or Personal Income and Outlays dates move.";
  }

  if (sourceFamily === "census-growth-housing-family") {
    return "Use the Census economic indicators calendar as the master schedule, then refine the row with the release-specific Census page when exact release details are needed.";
  }

  if (sourceFamily === "fed-policy-calendar-family" || indicator.slug === "industrial-production") {
    return "Use the Federal Reserve monthly calendar and FOMC calendars as the source of truth for event timing, and do not force outdated timestamps when the Fed moves a release.";
  }

  if (sourceFamily === "ism-survey-family") {
    return "Use ISM release cadence pages as the schedule source, and treat business-day shifts as official schedule changes rather than data errors.";
  }

  if (sourceFamily === "treasury-rates-family") {
    return "Use Treasury daily feed timing and auction schedules as the official timing layer, but keep the market status honest: these are daily/periodic official snapshots, not streaming quotes.";
  }

  return "Use the configured official schedule source as the default event timing layer and update event status when the source announces delays, revisions, or cancellations.";
}

function releaseStoragePolicy(
  indicator: MacroIndicator,
  releaseDataShape: IndicatorReleaseDataShape,
  sourceFamily: IndicatorSourceFamily
) {
  if (releaseDataShape === "manual-seed") {
    return "Do not create a fake live release record. Keep the seeded value as fallback until a real source-backed release model exists.";
  }

  if (releaseDataShape === "daily-snapshot") {
    return "Store the latest official snapshot value, prior snapshot, and chart history. Do not force consensus-style release fields for a daily official snapshot series.";
  }

  if (releaseDataShape === "derived-series") {
    return "Store the latest derived observation and prior observation, and mark the series as derived or backup-backed rather than as a primary official release print.";
  }

  if (sourceFamily === "fed-policy-calendar-family") {
    return "Store numeric policy outcomes when they exist, but allow event metadata records that carry decision, statement, press conference, or document flags without forcing actual/consensus/prior on every row.";
  }

  if (indicator.slug === "core-pce" || sourceFamily === "bea-growth-income-family") {
    return "Store actual, prior, revised prior when available, and preserve revision history because GDP and PCE-family releases can revise meaningfully across vintages.";
  }

  if (sourceFamily === "census-growth-housing-family") {
    return "Store actual, forecast, prior, and revised prior when available from the release family, because Census hard-data releases are often interpreted against consensus and revisions.";
  }

  return "Store actual, prior, revised prior, and chart history for each official release instance. Add forecast or consensus when the preview layer is available.";
}

function workflowStoragePolicy(
  indicator: MacroIndicator,
  releaseDataShape: IndicatorReleaseDataShape,
  sourceFamily: IndicatorSourceFamily
) {
  if (releaseDataShape === "manual-seed") {
    return "Keep this out of release-driven workflow logic until a live source contract exists.";
  }

  if (releaseDataShape === "daily-snapshot" || releaseDataShape === "derived-series") {
    return "Use this as a confirmation layer in workflow rather than as a headline release instance. Persist value, prior, and status, but do not force consensus-style surprise fields.";
  }

  if (sourceFamily === "fed-policy-calendar-family") {
    return "For non-numeric policy events, persist structured metadata like decision, statement, dots, or press-conference flags; for numeric Fed releases, allow actual/prior fields when they exist.";
  }

  if (indicator.slug === "initial-claims" || indicator.slug === "continuing-claims") {
    return "Persist actual, previous, revised previous, and surprise when consensus exists, then route the instance into workflow as an early-warning labor event.";
  }

  return "Build workflow release instances from this family using actual, forecast or consensus, previous, revised prior, and surprise whenever those fields are available.";
}

function releaseWindowPolicy(sourceFamily: IndicatorSourceFamily) {
  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
      return "Release-driven. Refresh more aggressively around BLS release days and times; outside the release window, keep the last-good live observation until the next official print.";
    case "bea-growth-income-family":
      return "Release-driven. Refresh around BEA release windows, store actual/prior/revision context, and keep the last-good live observation between releases.";
    case "census-growth-housing-family":
      return "Release-driven. Refresh around Census release windows, capture actual/forecast/prior context where available, and keep the last-good live value between prints.";
    case "ism-survey-family":
      return "Release-driven. Refresh around the monthly ISM publication window; outside that window, keep the last-good live report in place.";
    case "fed-policy-calendar-family":
      return "Schedule-driven. Refresh around official Fed calendar updates, event documents, and release timestamps; some events update metadata only and should not force numeric fields.";
    case "federal-reserve-release-family":
      return "Release-driven. Refresh around official Federal Reserve publication windows and keep the last-good live value between scheduled updates.";
    case "dol-weekly-claims-family":
      return "Release-driven. Refresh aggressively around the weekly Thursday claims release window; outside that window, keep the last-good live figure.";
    case "treasury-rates-family":
      return "Snapshot-driven. Refresh on a daily or periodic official Treasury schedule; do not imply streaming intraday real-time when the source only publishes daily tables.";
    case "manual-seed-family":
      return "No automated release window exists yet. Manual seed values remain until a live source contract is added.";
    default:
      return "Scheduled snapshot refresh. Update after the underlying release window or on routine market sweeps, and preserve last-good live values if the source lags or fails.";
  }
}

function updateCadenceForContract(
  indicator: MacroIndicator,
  sourceFamily: IndicatorSourceFamily,
  refreshBehavior: IndicatorRefreshBehavior
) {
  if (refreshBehavior === "manual-seed-only") {
    return "No automated refresh; manual seed stays in place until a live contract exists.";
  }

  if (refreshBehavior === "event-schedule-metadata") {
    return "Refresh around official policy calendar publications and event releases; keep the last-good metadata between event windows.";
  }

  if (refreshBehavior === "daily-official-snapshot") {
    return "Refresh on each scheduled market sweep as a daily or periodic official snapshot, and keep stale-live if the newest official publication is late or unavailable.";
  }

  if (refreshBehavior === "derived-series-snapshot") {
    return indicator.frequency === "Weekly"
      ? "Refresh after each weekly publication and on scheduled market sweeps using the stable derived-series layer."
      : "Refresh on scheduled market sweeps using the stable derived-series layer, and keep last-good live if the newest pull fails.";
  }

  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
      return "Refresh aggressively on BLS release mornings, then keep the last-good live value between releases.";
    case "bea-growth-income-family":
      return "Refresh around BEA release windows, store actual/prior/revision history, and keep the last-good live value between releases.";
    case "census-growth-housing-family":
      return "Refresh around Census release windows, store actual/forecast/prior context where available, and keep the last-good live value between releases.";
    case "ism-survey-family":
      return "Refresh around the monthly ISM release window and keep the last-good live print between reports.";
    case "federal-reserve-release-family":
      return "Refresh around the official Federal Reserve publication window and keep the last-good live value between updates.";
    case "dol-weekly-claims-family":
      return "Refresh around the weekly claims release window and keep the last-good live figure between Thursdays.";
    default:
      return "Refresh after the scheduled release and on each daily health sweep until the latest release is captured.";
  }
}

function liveStatusRule(sourceFamily: IndicatorSourceFamily) {
  if (sourceFamily === "manual-seed-family") {
    return "Never label a manual seed as live. Use fallback until a real source-backed contract is implemented.";
  }

  if (sourceFamily === "treasury-rates-family") {
    return "Only label this family as live when a fresh official daily snapshot exists for the current Treasury publication window. If the newest fetch fails, keep stale-live before using fallback.";
  }

  return "Only label an indicator as live when fresh source-backed data exists for its release window or snapshot cycle. Do not mark it live just because the app loaded; if a new fetch fails, serve stale-live before falling back.";
}

function productTruth(sourceFamily: IndicatorSourceFamily) {
  switch (sourceFamily) {
    case "bls-inflation-labor-release-family":
    case "bea-growth-income-family":
    case "census-growth-housing-family":
    case "ism-survey-family":
    case "federal-reserve-release-family":
    case "dol-weekly-claims-family":
      return "This family is release-time macro data, not streaming tick data. The correct behavior is to automate around release windows and age the last-good print honestly between releases.";
    case "fed-policy-calendar-family":
      return "This family is schedule and event metadata first. Some entries are non-numeric and should not force actual, consensus, or prior fields.";
    case "treasury-rates-family":
      return "Official Treasury rate feeds are daily or periodic snapshots, not true tick-level real-time. Treat them as official snapshot data unless a separate market-data provider is added later.";
    case "manual-seed-family":
      return "This family remains manual or seeded until a live contract is implemented. It should stay clearly labeled fallback.";
    default:
      return "This family uses FRED as a stable derived or backup layer. It can support live monitoring, but it is not the same thing as a dedicated real-time market-data feed.";
  }
}

function liveSupportForIndicator(primary: IndicatorSourceEndpointContract): LiveSupportLevel {
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
  const sourceFamily = resolveSourceFamily(indicator, primary);
  const refreshBehavior = resolveRefreshBehavior(sourceFamily);
  const releaseDataShape = resolveReleaseDataShape(indicator, sourceFamily);
  const calendarSources = buildCalendarSources(indicator, sourceFamily);

  return {
    slug: indicator.slug,
    sourceFamily,
    refreshBehavior,
    releaseDataShape,
    sourceStrategy: buildSourceStrategy(indicator, sourceFamily, primary, backup),
    releaseWindowPolicy: releaseWindowPolicy(sourceFamily),
    liveStatusRule: liveStatusRule(sourceFamily),
    productTruth: productTruth(sourceFamily),
    calendarSources,
    supportedEventStatuses: supportedEventStatusesForContract(refreshBehavior, releaseDataShape),
    scheduleChangePolicy: scheduleChangePolicy(indicator, sourceFamily, calendarSources),
    releaseStoragePolicy: releaseStoragePolicy(indicator, releaseDataShape, sourceFamily),
    workflowStoragePolicy: workflowStoragePolicy(indicator, releaseDataShape, sourceFamily),
    primary,
    backup,
    updateCadence: updateCadenceForContract(indicator, sourceFamily, refreshBehavior),
    expectedReleaseCadence: indicator.releaseCadence,
    parseCurrentValue: parseCurrentValue(primary.provider),
    parsePriorValue: parsePriorValue(primary.provider),
    revisionDetection: revisionDetection(primary.provider),
    failureHandling:
      "Retry with exponential backoff; if the primary source fails, use the configured backup source next; if both fail, serve last-good live as stale-live before falling back to seed/manual values.",
    uiStatusLabeling:
      "Keep the main UI minimal: show only status badge, updated time, and source label on the card surface; show the full source contract only in detail and health views.",
    liveSupport: liveSupportForIndicator(primary)
  };
}

export const indicatorSourceContractsBySlug: Record<string, IndicatorSourceContract> = Object.fromEntries(
  macroIndicators.map((indicator) => [indicator.slug, buildContract(indicator)])
);

export function getIndicatorSourceContract(indicator: MacroIndicator | string) {
  const slug = typeof indicator === "string" ? indicator : indicator.slug;
  return indicatorSourceContractsBySlug[slug];
}
