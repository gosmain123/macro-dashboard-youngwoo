import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndicatorValue(value: number, unit: string) {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "usd") {
    return `$${value.toFixed(1)}`;
  }

  if (unit === "usd/oz") {
    return `$${Math.round(value)}`;
  }

  if (unit === "bps") {
    return `${Math.round(value)} bps`;
  }

  if (unit === "x") {
    return `${value.toFixed(2)}x`;
  }

  if (unit === "$tn") {
    return `$${value.toFixed(2)}tn`;
  }

  if (unit === "$bn") {
    return `$${Math.round(value)}bn`;
  }

  if (unit === "k") {
    return `${Math.round(value)}k`;
  }

  if (unit === "m") {
    return `${value.toFixed(1)}m`;
  }

  if (unit === "index") {
    return value.toFixed(1);
  }

  if (unit === "pts") {
    return value.toFixed(1);
  }

  if (unit === "days") {
    return `${Math.round(value)} days`;
  }

  return `${value.toFixed(1)} ${unit}`.trim();
}

export function formatChange(value: number, unit: string) {
  const sign = value > 0 ? "+" : "";

  if (unit === "%") {
    return `${sign}${value.toFixed(1)}pp`;
  }

  if (unit === "usd") {
    return `${sign}$${value.toFixed(1)}`;
  }

  if (unit === "usd/oz") {
    return `${sign}$${Math.round(value)}`;
  }

  if (unit === "bps") {
    return `${sign}${Math.round(value)} bps`;
  }

  if (unit === "$tn") {
    return `${sign}$${value.toFixed(2)}tn`;
  }

  if (unit === "$bn") {
    return `${sign}$${Math.round(value)}bn`;
  }

  if (unit === "k") {
    return `${sign}${Math.round(value)}k`;
  }

  return `${sign}${value.toFixed(1)} ${unit}`.trim();
}

export function formatScore(score: number) {
  return `${score > 0 ? "+" : ""}${score.toFixed(1)}`;
}

export function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTimestamp(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
    timeZoneName: "short"
  }).format(parsed);
}

export function formatFreshnessAge(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "Unavailable";
  }

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T12:00:00Z`));
}

export function formatReleaseLabel(date?: string, timeLabel?: string) {
  if (!date) {
    return "Schedule pending";
  }

  return timeLabel ? `${formatDateLabel(date)} | ${timeLabel}` : formatDateLabel(date);
}

export function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC"
  }).format(new Date(`${value}T12:00:00Z`));
}

