import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined, opts?: { decimals?: number; unit?: string }) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const decimals = opts?.decimals ?? 0;
  const formatted = Math.abs(n) >= 1000
    ? n.toLocaleString("en-US", { maximumFractionDigits: decimals })
    : n.toFixed(decimals);
  return opts?.unit ? `${formatted}${opts.unit}` : formatted;
}

export function formatUsdMillions(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`;
  return `$${n.toFixed(0)}M`;
}

export function formatPct(n: number | null | undefined, decimals = 1) {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(decimals)}%`;
}
