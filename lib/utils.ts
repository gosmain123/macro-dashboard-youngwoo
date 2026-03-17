import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndicatorValue(value: number, unit: string) {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
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
