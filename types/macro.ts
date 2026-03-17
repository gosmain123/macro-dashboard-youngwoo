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

export type ExperienceMode = "beginner" | "advanced";

export type IndicatorTone = "positive" | "negative" | "neutral";

export type RefreshScope = "market" | "daily" | "all";

export type ProviderType = "fred" | "manual";

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
  frequency: Frequency;
  source: IndicatorSource;
  tooltips: IndicatorTooltip;
  chartHistory: ChartPoint[];
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
  description: string;
  drivers: string[];
}

export interface RegimeSnapshot {
  title: string;
  summary: string;
  labels: string[];
  watchItems: string[];
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

export interface DashboardPayload {
  dataMode: "demo" | "live";
  modules: MacroModule[];
  indicators: MacroIndicator[];
  regimeCards: RegimeCard[];
  regimeSnapshot: RegimeSnapshot;
  calendarEvents: CalendarEvent[];
  playbooks: PlaybookScenario[];
}

export interface RefreshResult {
  scope: RefreshScope;
  startedAt: string;
  completedAt: string;
  dataMode: "demo" | "live";
  refreshed: string[];
  skipped: string[];
}
