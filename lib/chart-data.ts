import type { ChartPoint } from "@/types/macro";

function toFiniteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeChartDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function getTimestamp(date: string) {
  if (date.includes("T")) {
    return new Date(date).getTime();
  }

  return new Date(`${date}T00:00:00Z`).getTime();
}

export function normalizeChartHistory(data: unknown): ChartPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const perDate = new Map<string, ChartPoint>();

  for (const item of data) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const rawDate = normalizeChartDate((item as { date?: unknown }).date);
    const value = toFiniteNumber((item as { value?: unknown }).value);

    if (!rawDate || value === null) {
      continue;
    }

    const overlay = toFiniteNumber((item as { overlay?: unknown }).overlay);

    perDate.set(rawDate, {
      date: rawDate,
      value,
      overlay: overlay ?? undefined
    });
  }

  return [...perDate.values()].sort((left, right) => getTimestamp(left.date) - getTimestamp(right.date));
}
