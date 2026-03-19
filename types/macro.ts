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

export type ProviderType =
  | "bea"
  | "bls"
  | "census"
  | "dol"
  | "fed"
  | "fred"
  | "fred-backup"
  | "ism"
  | "manual"
  | "treasury";

export type FreshnessStatus = "fresh" | "stale";
export type IndicatorDataStatus = "live" | "fallback";
export type IndicatorCardStatus = "live" | "stale" | "fallback";
export type IndicatorReleaseType = "scheduled" | "market" | "continuous";
export type ReleaseRevisionFlag = "none" | "revised" | "pending";
export type ReleaseSurpriseFlag = "above" | "below" | "inline" | "pending";

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
  dataStatus: IndicatorDataStatus;
  status: IndicatorCardStatus;
  freshnessStatus: FreshnessStatus;
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
  category: "macro release" | "central bank" | "auction" | "filing" | "liquidity";
  date: string;
  timeLabel: string;
  importance: "high" | "medium";
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
  fallbackCount: number;
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

export interface WorkflowReleaseRadarItem {
  id: string;
  indicatorSlug: string;
  indicatorName: string;
  module: MacroModuleSlug;
  moduleTitle: string;
  sourceName: string;
  sourceUrl?: string;
  nextReleaseDate?: string;
  timeLabel?: string;
  priorValue: number;
  latestActualValue: number;
  consensusValue?: number | null;
  unit: string;
  unitLabel: string;
  revisionFlag: ReleaseRevisionFlag;
  surpriseFlag: ReleaseSurpriseFlag;
  surpriseMagnitude?: number | null;
  linkedIndicators: string[];
  note: string;
  status: IndicatorCardStatus;
}

export interface WorkflowSurpriseItem {
  id: string;
  indicatorSlug: string;
  indicatorName: string;
  category: "inflation" | "growth" | "labor" | "policy";
  releaseDate: string;
  sourceName: string;
  sourceUrl?: string;
  actualValue: number;
  priorValue: number;
  consensusValue?: number | null;
  revisedFrom?: number | null;
  revisedTo?: number | null;
  revisionFlag: ReleaseRevisionFlag;
  surpriseFlag: ReleaseSurpriseFlag;
  surpriseMagnitude?: number | null;
  unit: string;
  unitLabel: string;
  whyItMatters: string;
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
