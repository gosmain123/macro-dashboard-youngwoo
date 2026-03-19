import type { FreshnessStatus, IndicatorCardStatus, IndicatorRelease } from "@/types/macro";

export const STALE_AFTER_MINUTES = 20;

export function clampMinutesSinceUpdate(updatedAt?: string | null, now = new Date()) {
  if (!updatedAt) {
    return Number.POSITIVE_INFINITY;
  }

  const updatedTime = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedTime)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.round((now.getTime() - updatedTime) / 60000));
}

export function freshnessStatus(minutesSinceUpdate: number): FreshnessStatus {
  return minutesSinceUpdate > STALE_AFTER_MINUTES ? "stale" : "fresh";
}

export function toNextReleaseAt(release: IndicatorRelease) {
  if (!release.nextReleaseDate) {
    return undefined;
  }

  return `${release.nextReleaseDate}T12:00:00Z`;
}

export function resolveIndicatorStatus({
  hasLiveCache,
  freshnessAgeMinutes,
  lastSuccessfulFetch,
  lastFailedFetch,
  errorMessage
}: {
  hasLiveCache: boolean;
  freshnessAgeMinutes: number;
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
  errorMessage?: string;
}): IndicatorCardStatus {
  const staleBecauseOld = freshnessStatus(freshnessAgeMinutes) === "stale";
  const lastFailedTime = lastFailedFetch ? new Date(lastFailedFetch).getTime() : Number.NEGATIVE_INFINITY;
  const lastSuccessfulTime = lastSuccessfulFetch
    ? new Date(lastSuccessfulFetch).getTime()
    : Number.NEGATIVE_INFINITY;
  const staleBecauseLatestFailed =
    lastFailedTime !== Number.NEGATIVE_INFINITY &&
    (lastSuccessfulTime === Number.NEGATIVE_INFINITY || lastFailedTime >= lastSuccessfulTime);

  if (hasLiveCache) {
    return staleBecauseOld || staleBecauseLatestFailed ? "stale-live" : "live";
  }

  if (errorMessage) {
    return "error";
  }

  return "fallback";
}
