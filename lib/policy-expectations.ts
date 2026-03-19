import { getLayerPagePayload } from "@/lib/layer-pages";
import type { DashboardPayload, MacroIndicator } from "@/types/macro";

type PolicyMeetingProbability = {
  label: string;
  date: string;
  hold: number;
  cut: number;
  hike: number;
  impliedUpperBound: number;
};

export type PolicyExpectationsPayload = {
  page: ReturnType<typeof getLayerPagePayload>;
  headline: string;
  takeaway: string;
  aggregate: {
    hold: number;
    cut: number;
    hike: number;
  };
  meetings: PolicyMeetingProbability[];
  decomposition: Array<{
    label: string;
    value: number;
    unit: string;
    summary: string;
  }>;
};

const defaultMeetingDates = ["2026-05-06", "2026-06-17", "2026-07-29"];

function getIndicator(payload: DashboardPayload, slug: string) {
  return payload.indicators.find((indicator) => indicator.slug === slug);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildMeetings(currentUpperBound: number, impliedCuts: number, nextPath: number) {
  const totalExpectedMove = currentUpperBound - nextPath;
  const totalCutBps = Math.max(0, Math.round(totalExpectedMove * 100));
  const totalHikeBps = Math.max(0, Math.round((nextPath - currentUpperBound) * 100));
  const baseCutWeight = clamp(totalCutBps / 75, 0, 1);
  const baseHikeWeight = clamp(totalHikeBps / 75, 0, 1);
  const softerBias = clamp(impliedCuts / 100, 0, 1);

  return defaultMeetingDates.map((date, index) => {
    const step = index + 1;
    const cut = clamp(Math.round((baseCutWeight * (0.5 + step * 0.2) + softerBias * 0.2) * 100), 5, 85);
    const hike = clamp(Math.round(baseHikeWeight * (0.25 + step * 0.1) * 100), 0, 35);
    const hold = clamp(100 - cut - hike, 5, 95);

    return {
      label: `Meeting ${step}`,
      date,
      hold,
      cut,
      hike,
      impliedUpperBound: Number((currentUpperBound - (cut / 100) * 0.25 + (hike / 100) * 0.25).toFixed(2))
    };
  });
}

function getSummaryLine(indicator: MacroIndicator | undefined, fallback: string) {
  return indicator?.summary ?? fallback;
}

export function getPolicyExpectationsPayload(payload: DashboardPayload): PolicyExpectationsPayload {
  const page = getLayerPagePayload(payload, "policy-expectations");
  const fedFundsUpper = getIndicator(payload, "fed-funds-upper")?.currentValue ?? 4.75;
  const impliedCuts = getIndicator(payload, "sofr-implied-cuts")?.currentValue ?? 50;
  const terminalRate = getIndicator(payload, "terminal-rate-pricing")?.currentValue ?? 4.5;
  const nextThreePath = getIndicator(payload, "next-three-fomc-path")?.currentValue ?? 4.6;
  const tenYearNominal = getIndicator(payload, "us-10y-treasury")?.currentValue ?? 4.0;
  const realYield = getIndicator(payload, "ten-year-real-yield")?.currentValue ?? 1.7;
  const breakeven = getIndicator(payload, "five-year-breakeven")?.currentValue ?? Number((tenYearNominal - realYield).toFixed(1));
  const meetings = buildMeetings(fedFundsUpper, impliedCuts, nextThreePath);
  const aggregateCut = Math.round(meetings.reduce((sum, meeting) => sum + meeting.cut, 0) / meetings.length);
  const aggregateHold = Math.round(meetings.reduce((sum, meeting) => sum + meeting.hold, 0) / meetings.length);
  const aggregateHike = Math.round(meetings.reduce((sum, meeting) => sum + meeting.hike, 0) / meetings.length);

  return {
    page,
    headline:
      aggregateCut > aggregateHold
        ? "FedWatch-style pricing is still skewed toward cuts."
        : aggregateHold >= aggregateCut
          ? "The market still leans toward holding rather than immediate aggressive easing."
          : "The front end is starting to price a more hawkish path again.",
    takeaway: `${getSummaryLine(getIndicator(payload, "sofr-implied-cuts"), "Cuts are still priced.")} ${getSummaryLine(getIndicator(payload, "us-2y-treasury"), "The 2Y remains the clean policy repricing barometer.")}`,
    aggregate: {
      hold: aggregateHold,
      cut: aggregateCut,
      hike: aggregateHike
    },
    meetings,
    decomposition: [
      {
        label: "10Y nominal",
        value: tenYearNominal,
        unit: "%",
        summary: getSummaryLine(getIndicator(payload, "us-10y-treasury"), "Nominal yields are the headline discount rate.")
      },
      {
        label: "10Y real yield",
        value: realYield,
        unit: "%",
        summary: getSummaryLine(getIndicator(payload, "ten-year-real-yield"), "Real yields are the cleanest valuation pressure gauge.")
      },
      {
        label: "Breakeven",
        value: breakeven,
        unit: "%",
        summary: getSummaryLine(getIndicator(payload, "five-year-breakeven"), "Breakevens separate inflation pricing from real-rate pressure.")
      },
      {
        label: "Terminal rate",
        value: terminalRate,
        unit: "%",
        summary: getSummaryLine(getIndicator(payload, "terminal-rate-pricing"), "Terminal rate shows the expected ceiling for the cycle.")
      }
    ]
  };
}
