export type MacroModuleSlug =
  | "inflation"
  | "growth"
  | "labor"
  | "policy-liquidity"
  | "rates-credit"
  | "market-internals"
  | "flows-positioning"
  | "global";

export type MacroDimension =
  | "growth"
  | "inflation"
  | "labor"
  | "liquidity"
  | "risk-appetite";

export type FeedAccess = "official-free" | "licensed-manual";

export type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Live";

export type IndicatorTone = "positive" | "negative" | "neutral";

export type RefreshScope = "market" | "daily" | "all";
export type IndicatorSourceType = "official" | "derived" | "market-implied" | "manual";
export type HistoricalContextBand = "low" | "normal" | "elevated" | "extreme";

export type ProviderType =
  | "bea"
  | "bls"
  | "census"
  | "dol"
  | "fed"
  | "fred"
  | "fred-backup"
  | "ism"
  | "treasury"
  | "manual";

export type FreshnessStatus = "fresh" | "stale";
export type IndicatorDataStatus = "live" | "stale-live" | "fallback" | "error";
export type IndicatorCardStatus = IndicatorDataStatus;
export type IndicatorReleaseType = "scheduled" | "market" | "continuous";
export type ReleaseRevisionFlag = "none" | "revised" | "pending";
export type ReleaseSurpriseFlag = "above" | "below" | "inline" | "pending";
export type ModuleHealthStatus = "healthy" | "degraded" | "down";
export type WorkflowReleaseState = "pending-release" | "schedule-pending";
export type WorkflowPreviewState = "connected" | "preview-feed-missing";

export interface IndicatorTooltip {
  definition: string;
  whyItMatters: string;
  howToUse: string;
  whatToWatch: string;
}

export interface ChartPoint {
  date: string;
  value: number;
  overlay?: number;
}

export interface IndicatorSource {
  name: string;
  url?: string;
  access: FeedAccess;
}

export interface IndicatorProviderConfig {
  type: ProviderType;
  seriesId?: string;
}

export interface IndicatorRelease {
  type: IndicatorReleaseType;
  label: string;
  nextReleaseDate?: string;
  timeLabel?: string;
  detail: string;
  sourceName?: string;
  sourceUrl?: string;
}

export interface MacroIndicator {
  slug: string;
  name: string;
  shortName: string;
  module: MacroModuleSlug;
  dimension: MacroDimension;
  currentValue: number;
  priorValue: number;
  change: number;
  unit: string;
  unitLabel: string;
  frequency: Frequency;
  source: IndicatorSource;
  tooltips: IndicatorTooltip;
  chartHistory: ChartPoint[];
  lastUpdated: string;
  updatedAt: string;
  nextReleaseAt?: string;
  freshnessAgeMinutes: number;
  dataStatus: IndicatorDataStatus;
  status: IndicatorCardStatus;
  freshnessStatus: FreshnessStatus;
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
  fallbackUsageReason?: string;
  errorMessage?: string;
  release: IndicatorRelease;
  regimeTag: string;
  summary: string;
  advancedSummary: string;
  watchList: string[];
  signalScore: number;
  tone: IndicatorTone;
  overlays?: string[];
  releaseCadence: string;
  searchTerms: string[];
  provider: IndicatorProviderConfig;
}

export interface MacroModule {
  slug: MacroModuleSlug;
  title: string;
  kicker: string;
  description: string;
  accent: string;
}

export interface RegimeCard {
  id: MacroDimension;
  title: string;
  score: number;
  label: string;
  status: string;
  drivers: string[];
}

export interface RegimeSnapshot {
  title: string;
  summary: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  module: MacroModuleSlug | "calendar";
  moduleLabel: string;
  moduleHref: string;
  playbookLabel: string;
  playbookHref: string;
  category: "macro release" | "central bank" | "auction" | "filing" | "liquidity";
  date: string;
  timeLabel: string;
  importance: "high" | "medium" | "low";
  whyItMatters: string;
  whatToWatch: string;
}

export interface PlaybookScenario {
  slug: string;
  title: string;
  summary: string;
  marketPlaybook: string;
  riskWatch: string;
  dashboardFocus: string[];
}

export type HomepageIndicator = MacroIndicator;

export interface DashboardFreshness {
  lastUpdated: string;
  refreshCadence: string;
  freshnessStatus: FreshnessStatus;
  staleAfterMinutes: number;
  minutesSinceUpdate: number;
  officialCount: number;
  manualCount: number;
  liveCount: number;
  staleLiveCount: number;
  fallbackCount: number;
  errorCount: number;
}

export interface HomepagePayload {
  watchlist: HomepageIndicator[];
  keyEvents: CalendarEvent[];
  freshness: DashboardFreshness;
}

export interface DashboardPayload {
  dataMode: "demo" | "live";
  modules: MacroModule[];
  indicators: MacroIndicator[];
  regimeCards: RegimeCard[];
  regimeSnapshot: RegimeSnapshot;
  calendarEvents: CalendarEvent[];
  playbooks: PlaybookScenario[];
  homepage: HomepagePayload;
}

export interface RefreshResult {
  scope: RefreshScope;
  startedAt: string;
  completedAt: string;
  dataMode: "demo" | "live";
  refreshed: string[];
  skipped: string[];
}

export interface IndicatorHealth {
  slug: string;
  name: string;
  module: MacroModuleSlug;
  provider: ProviderType;
  primaryProvider?: ProviderType;
  backupProvider?: ProviderType;
  fetchMethod?: string;
  expectedReleaseCadence?: string;
  revisionDetection?: string;
  failureHandling?: string;
  sourceName: string;
  sourceUrl?: string;
  value: number;
  priorValue: number;
  delta: number;
  updatedAt: string;
  nextReleaseAt?: string;
  status: IndicatorCardStatus;
  freshnessAgeMinutes: number;
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
  errorMessage?: string;
  fallbackUsageReason?: string;
}

export interface ModuleHealth {
  module: MacroModuleSlug;
  title: string;
  status: ModuleHealthStatus;
  indicatorCount: number;
  liveCount: number;
  staleLiveCount: number;
  fallbackCount: number;
  errorCount: number;
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
}

export interface DataHealthPayload {
  generatedAt: string;
  backend: {
    configured: boolean;
    readable: boolean;
    writable: boolean;
    status: ModuleHealthStatus;
    message: string;
  };
  modules: ModuleHealth[];
  indicators: IndicatorHealth[];
}

export interface WorkflowReleaseRadarItem {
  id: string;
  indicatorSlug: string;
  indicatorName: string;
  module: MacroModuleSlug;
  moduleTitle: string;
  moduleHref: string;
  playbookLabel: string;
  playbookHref: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: IndicatorSourceType;
  updatedAt: string;
  freshnessAgeMinutes: number;
  nextReleaseAt?: string;
  nextReleaseDate?: string;
  timeLabel?: string;
  actualValue: number;
  priorValue: number;
  revisedPriorValue?: number | null;
  latestActualValue: number;
  consensusValue?: number | null;
  threeMonthAverageSurprise?: number | null;
  unit: string;
  unitLabel: string;
  revisionFlag: ReleaseRevisionFlag;
  surpriseFlag: ReleaseSurpriseFlag;
  surpriseMagnitude?: number | null;
  releaseState: WorkflowReleaseState;
  previewState: WorkflowPreviewState;
  historicalPercentile?: number | null;
  historicalPercentileLabel?: string;
  historicalZScore?: number | null;
  historicalZScoreLabel?: string;
  historicalBand: HistoricalContextBand;
  historicalContextLabel: string;
  whyThisMattersToday: string;
  whatToConfirmNext: string;
  linkedIndicators: string[];
  note: string;
  status: IndicatorCardStatus;
}

export interface WorkflowSurpriseItem {
  id: string;
  indicatorSlug: string;
  indicatorName: string;
  category: "inflation" | "growth" | "labor" | "policy";
  moduleHref: string;
  playbookLabel: string;
  playbookHref: string;
  releaseDate: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: IndicatorSourceType;
  updatedAt: string;
  freshnessAgeMinutes: number;
  nextReleaseAt?: string;
  actualValue: number;
  priorValue: number;
  consensusValue?: number | null;
  revisedFrom?: number | null;
  revisedTo?: number | null;
  revisedPriorValue?: number | null;
  threeMonthAverageSurprise?: number | null;
  revisionFlag: ReleaseRevisionFlag;
  surpriseFlag: ReleaseSurpriseFlag;
  surpriseMagnitude?: number | null;
  unit: string;
  unitLabel: string;
  whyItMatters: string;
  whatToConfirmNext: string;
  historicalPercentile?: number | null;
  historicalPercentileLabel?: string;
  historicalZScore?: number | null;
  historicalZScoreLabel?: string;
  historicalBand: HistoricalContextBand;
  historicalContextLabel: string;
  linkedIndicators: string[];
  status: IndicatorCardStatus;
}

export interface WorkflowHeadlineItem {
  id: string;
  bucket: "Official releases" | "Market interpretation" | "Fed / central bank";
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  whyItMatters: string;
  linkedIndicators: string[];
}

export interface WorkflowChangeItem {
  id: string;
  bucket: "Indicator shifts" | "Cross-asset moves" | "New releases" | "Up next";
  title: string;
  detail: string;
  linkedIndicators: string[];
}

export interface WorkflowPayload {
  updatedAt: string;
  releaseRadar: WorkflowReleaseRadarItem[];
  surprises: WorkflowSurpriseItem[];
  headlines: WorkflowHeadlineItem[];
  changes: WorkflowChangeItem[];
}
