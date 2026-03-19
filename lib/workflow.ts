import { cache } from "react";

import { getDashboardPayload } from "@/lib/dashboard";
import { macroModules } from "@/lib/data/modules";
import { getHistoricalContext, getIndicatorSourceType } from "@/lib/indicator-insight";
import { getFollowUpLogic, getLogicChainForIndicator, getLogicChainHref } from "@/lib/playbook-guide";
import { curatedHeadlines, releaseSnapshotInputs } from "@/lib/workflow-data";
import { formatChange, formatDateLabel, formatIndicatorValue, formatReleaseLabel } from "@/lib/utils";
import type {
  DashboardPayload,
  MacroIndicator,
  MacroModuleSlug,
  ReleaseRevisionFlag,
  ReleaseSurpriseFlag,
  WorkflowChangeItem,
  WorkflowPayload,
  WorkflowReleaseRadarItem,
  WorkflowSurpriseItem
} from "@/types/macro";

const releaseRadarSlugs = [
  "cpi-headline",
  "core-cpi",
  "ppi-final-demand",
  "core-pce",
  "nonfarm-payrolls",
  "unemployment-rate",
  "avg-hourly-earnings",
  "initial-claims",
  "gdp-nowcast",
  "ism-manufacturing",
  "ism-services",
  "industrial-production",
  "retail-sales",
  "durable-goods",
  "housing-starts",
  "building-permits"
] as const;

const crossAssetSlugs = [
  "us-2y-treasury",
  "us-10y-treasury",
  "dxy",
  "wti-oil",
  "hy-spreads"
] as const;

const moduleTitleBySlug = Object.fromEntries(macroModules.map((module) => [module.slug, module.title])) as Record<
  MacroModuleSlug,
  string
>;

const snapshotBySlug = Object.fromEntries(
  releaseSnapshotInputs.map((snapshot) => [snapshot.indicatorSlug, snapshot])
);

function toIndicatorLabels(slugs: string[], indicatorMap: Map<string, MacroIndicator>) {
  return slugs.map((slug) => indicatorMap.get(slug)?.shortName ?? indicatorMap.get(slug)?.name ?? slug);
}

function epsilonByUnit(unit: string) {
  if (unit === "k" || unit === "bps" || unit === "pts" || unit === "usd/oz") {
    return 1;
  }

  if (unit === "m" || unit === "usd") {
    return 0.1;
  }

  return 0.05;
}

function deriveSurprise(
  indicator: MacroIndicator,
  consensusValue?: number | null
): { flag: ReleaseSurpriseFlag; magnitude?: number | null } {
  if (
    consensusValue === null ||
    consensusValue === undefined ||
    indicator.dataStatus === "fallback" ||
    indicator.dataStatus === "error"
  ) {
    return { flag: "pending", magnitude: null };
  }

  const magnitude = Number((indicator.currentValue - consensusValue).toFixed(2));

  if (Math.abs(magnitude) <= epsilonByUnit(indicator.unit)) {
    return { flag: "inline", magnitude };
  }

  return {
    flag: magnitude > 0 ? "above" : "below",
    magnitude
  };
}

function deriveRevisionFlag(
  revisedFrom?: number | null,
  revisedTo?: number | null
): ReleaseRevisionFlag {
  if (revisedFrom === null || revisedFrom === undefined || revisedTo === null || revisedTo === undefined) {
    return "pending";
  }

  return revisedFrom === revisedTo ? "none" : "revised";
}

function getSurpriseCategory(indicator: MacroIndicator): WorkflowSurpriseItem["category"] {
  if (indicator.module === "inflation") {
    return "inflation";
  }

  if (indicator.module === "growth") {
    return "growth";
  }

  if (indicator.module === "labor") {
    return "labor";
  }

  return "policy";
}

function buildReleaseRadarItem(
  indicator: MacroIndicator,
  indicatorMap: Map<string, MacroIndicator>
): WorkflowReleaseRadarItem {
  const snapshot = snapshotBySlug[indicator.slug];
  const followUpLogic = getFollowUpLogic(indicator.slug);
  const logicChain = getLogicChainForIndicator(indicator.slug);
  const surprise = deriveSurprise(indicator, snapshot?.consensusValue);
  const context = getHistoricalContext(indicator);
  const sourceName = indicator.release.sourceName ?? indicator.source.name;
  const sourceUrl = indicator.release.sourceUrl ?? indicator.source.url;
  const note =
    indicator.dataStatus === "fallback"
      ? "Latest print is visible, but the row is clearly marked fallback until the live feed syncs."
      : indicator.dataStatus === "stale-live"
        ? "The row is serving the last good live value because the newest refresh failed or aged out."
        : indicator.dataStatus === "error"
          ? "The live provider failed and no valid live cache exists yet, so the row is flagged error."
      : snapshot?.consensusValue !== null && snapshot?.consensusValue !== undefined
        ? "Consensus is available for the latest release snapshot; next-release consensus can be added when a market preview feed is connected."
        : "Official release timing is available now; consensus will populate when a preview feed is connected.";

  return {
    id: `radar-${indicator.slug}`,
    indicatorSlug: indicator.slug,
    indicatorName: indicator.name,
    module: indicator.module,
    moduleTitle: moduleTitleBySlug[indicator.module],
    moduleHref: `/${indicator.module}`,
    playbookLabel: logicChain?.title ?? "Open Playbook",
    playbookHref: logicChain ? getLogicChainHref(logicChain.id) : "/playbook",
    sourceName,
    sourceUrl,
    sourceType: getIndicatorSourceType(indicator),
    updatedAt: indicator.updatedAt,
    freshnessAgeMinutes: indicator.freshnessAgeMinutes,
    nextReleaseAt: indicator.nextReleaseAt,
    nextReleaseDate: indicator.release.nextReleaseDate,
    timeLabel: indicator.release.timeLabel,
    actualValue: indicator.currentValue,
    priorValue: indicator.priorValue,
    revisedPriorValue: snapshot?.revisedTo ?? null,
    latestActualValue: indicator.currentValue,
    consensusValue: snapshot?.consensusValue ?? null,
    threeMonthAverageSurprise: snapshot?.threeMonthAverageSurprise ?? null,
    unit: indicator.unit,
    unitLabel: indicator.unitLabel,
    revisionFlag: deriveRevisionFlag(snapshot?.revisedFrom, snapshot?.revisedTo),
    surpriseFlag: surprise.flag,
    surpriseMagnitude: surprise.magnitude,
    releaseState: indicator.release.nextReleaseDate ? "pending-release" : "schedule-pending",
    previewState:
      snapshot?.consensusValue !== null && snapshot?.consensusValue !== undefined ? "connected" : "preview-feed-missing",
    historicalPercentile: context.percentile,
    historicalPercentileLabel: context.percentileLabel,
    historicalZScore: context.zScore,
    historicalZScoreLabel: context.zScoreLabel,
    historicalBand: context.band,
    historicalContextLabel: context.contextLabel,
    whyThisMattersToday: snapshot?.whyItMatters ?? indicator.summary,
    whatToConfirmNext:
      followUpLogic?.confirmation ??
      followUpLogic?.nextCheck ??
      "Confirm the move in rates, credit, and the linked indicators after the release.",
    linkedIndicators: toIndicatorLabels(snapshot?.linkedIndicators ?? [indicator.slug], indicatorMap),
    note,
    status: indicator.status
  };
}

function buildSurpriseItem(
  indicator: MacroIndicator,
  indicatorMap: Map<string, MacroIndicator>
): WorkflowSurpriseItem | null {
  const snapshot = snapshotBySlug[indicator.slug];

  if (!snapshot) {
    return null;
  }

  const surprise = deriveSurprise(indicator, snapshot.consensusValue);
  const followUpLogic = getFollowUpLogic(indicator.slug);
  const logicChain = getLogicChainForIndicator(indicator.slug);
  const context = getHistoricalContext(indicator);

  return {
    id: `surprise-${indicator.slug}`,
    indicatorSlug: indicator.slug,
    indicatorName: indicator.name,
    category: getSurpriseCategory(indicator),
    moduleHref: `/${indicator.module}`,
    playbookLabel: logicChain?.title ?? "Open Playbook",
    playbookHref: logicChain ? getLogicChainHref(logicChain.id) : "/playbook",
    releaseDate: snapshot.releaseDate,
    sourceName: snapshot.sourceName,
    sourceUrl: snapshot.sourceUrl,
    sourceType: getIndicatorSourceType(indicator),
    updatedAt: indicator.updatedAt,
    freshnessAgeMinutes: indicator.freshnessAgeMinutes,
    nextReleaseAt: indicator.nextReleaseAt,
    actualValue: indicator.currentValue,
    priorValue: indicator.priorValue,
    consensusValue: snapshot.consensusValue ?? null,
    revisedFrom: snapshot.revisedFrom ?? null,
    revisedTo: snapshot.revisedTo ?? null,
    revisedPriorValue: snapshot.revisedTo ?? null,
    threeMonthAverageSurprise: snapshot.threeMonthAverageSurprise ?? null,
    revisionFlag: deriveRevisionFlag(snapshot.revisedFrom, snapshot.revisedTo),
    surpriseFlag: surprise.flag,
    surpriseMagnitude: surprise.magnitude,
    unit: indicator.unit,
    unitLabel: indicator.unitLabel,
    whyItMatters: snapshot.whyItMatters,
    whatToConfirmNext:
      followUpLogic?.confirmation ??
      followUpLogic?.nextCheck ??
      "Confirm the macro message in rates, credit, and the linked indicators.",
    historicalPercentile: context.percentile,
    historicalPercentileLabel: context.percentileLabel,
    historicalZScore: context.zScore,
    historicalZScoreLabel: context.zScoreLabel,
    historicalBand: context.band,
    historicalContextLabel: context.contextLabel,
    linkedIndicators: toIndicatorLabels(snapshot.linkedIndicators, indicatorMap),
    status: indicator.status
  };
}

function buildChangeItems(
  payload: DashboardPayload,
  releaseRadar: WorkflowReleaseRadarItem[],
  surprises: WorkflowSurpriseItem[]
): WorkflowChangeItem[] {
  const indicatorMoves = payload.indicators
    .filter((indicator) => releaseRadarSlugs.includes(indicator.slug as (typeof releaseRadarSlugs)[number]))
    .sort((left, right) => Math.abs(right.change) - Math.abs(left.change))
    .slice(0, 3)
    .map((indicator) => ({
      id: `change-indicator-${indicator.slug}`,
      bucket: "Indicator shifts" as const,
      title: indicator.name,
      detail: `${formatIndicatorValue(indicator.currentValue, indicator.unit)} | ${formatChange(indicator.change, indicator.unit)} vs prior`,
      linkedIndicators: [indicator.shortName]
    }));

  const crossAssetMoves = payload.indicators
    .filter((indicator) => crossAssetSlugs.includes(indicator.slug as (typeof crossAssetSlugs)[number]))
    .sort((left, right) => Math.abs(right.change) - Math.abs(left.change))
    .slice(0, 3)
    .map((indicator) => ({
      id: `change-cross-${indicator.slug}`,
      bucket: "Cross-asset moves" as const,
      title: indicator.name,
      detail: `${formatIndicatorValue(indicator.currentValue, indicator.unit)} | ${formatChange(indicator.change, indicator.unit)}`,
      linkedIndicators: [indicator.shortName]
    }));

  const newReleases = surprises
    .slice()
    .sort((left, right) => right.releaseDate.localeCompare(left.releaseDate))
    .slice(0, 3)
    .map((item) => ({
      id: `change-release-${item.indicatorSlug}`,
      bucket: "New releases" as const,
      title: item.indicatorName,
      detail: `${formatDateLabel(item.releaseDate)} | ${formatIndicatorValue(item.actualValue, item.unit)} vs prior ${formatIndicatorValue(item.priorValue, item.unit)}`,
      linkedIndicators: item.linkedIndicators
    }));

  const upcoming = releaseRadar
    .slice(0, 3)
    .map((item) => ({
      id: `change-upcoming-${item.indicatorSlug}`,
      bucket: "Up next" as const,
      title: item.indicatorName,
      detail: formatReleaseLabel(item.nextReleaseDate, item.timeLabel),
      linkedIndicators: item.linkedIndicators
    }));

  return [...indicatorMoves, ...crossAssetMoves, ...newReleases, ...upcoming];
}

export const getWorkflowPayload = cache(async (): Promise<WorkflowPayload> => {
  const payload = await getDashboardPayload();
  const indicatorMap = new Map(payload.indicators.map((indicator) => [indicator.slug, indicator]));

  const releaseRadar = releaseRadarSlugs
    .map((slug) => indicatorMap.get(slug))
    .filter((indicator): indicator is MacroIndicator => Boolean(indicator))
    .filter((indicator) => indicator.release.type === "scheduled")
    .map((indicator) => buildReleaseRadarItem(indicator, indicatorMap))
    .sort((left, right) => {
      const leftDate = left.nextReleaseDate ?? "9999-12-31";
      const rightDate = right.nextReleaseDate ?? "9999-12-31";
      return leftDate.localeCompare(rightDate) || left.indicatorName.localeCompare(right.indicatorName);
    });

  const surprises = releaseRadarSlugs
    .map((slug) => indicatorMap.get(slug))
    .filter((indicator): indicator is MacroIndicator => Boolean(indicator))
    .map((indicator) => buildSurpriseItem(indicator, indicatorMap))
    .filter((item): item is WorkflowSurpriseItem => item !== null)
    .sort((left, right) => right.releaseDate.localeCompare(left.releaseDate));

  return {
    updatedAt: payload.homepage.freshness.lastUpdated,
    releaseRadar,
    surprises,
    headlines: curatedHeadlines.slice().sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)),
    changes: buildChangeItems(payload, releaseRadar, surprises)
  };
});
