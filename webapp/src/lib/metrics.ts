import type { CountryScoreSummary } from "./scores";

export type MetricKey =
  | "composite_score"
  | "gmv_total_usd_million"
  | "cagr_2025_2030_pct"
  | "per_capita_spend_usd"
  | "online_buyers_million"
  | "cross_border_share_pct";

export type MetricDef = {
  key: MetricKey;
  label: string;
  short: string;
  accessor: (s: CountryScoreSummary) => number | null | undefined;
  format: (v: number) => string;
  /**
   * Optional fixed domain. If omitted, the map auto-scales by the
   * (min, max) of the metric across countries that have data.
   */
  fixedDomain?: [number, number];
  /** If true, scale is log10 (good for GMV which spans 3+ orders of magnitude). */
  log?: boolean;
};

export const METRICS: MetricDef[] = [
  {
    key: "composite_score",
    label: "Hachimi 综合评分",
    short: "评分",
    accessor: (s) => s.composite_score,
    format: (v) => `${v.toFixed(0)} / 100`,
    fixedDomain: [0, 100],
  },
  {
    key: "gmv_total_usd_million",
    label: "电商市场容量 (GMV 2024)",
    short: "市场容量",
    accessor: (s) => s.gmv_total_usd_million,
    format: (v) =>
      v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v.toFixed(0)}M`,
    log: true,
  },
  {
    key: "cagr_2025_2030_pct",
    label: "市场增速 (CAGR 25-30)",
    short: "增速",
    accessor: (s) => s.cagr_2025_2030_pct,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "per_capita_spend_usd",
    label: "人均电商支出",
    short: "人均支出",
    accessor: (s) => s.per_capita_spend_usd,
    format: (v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  },
  {
    key: "online_buyers_million",
    label: "在线买家数",
    short: "买家",
    accessor: (s) => s.online_buyers_million,
    format: (v) => `${v.toFixed(1)}M`,
  },
  {
    key: "cross_border_share_pct",
    label: "跨境占比",
    short: "跨境",
    accessor: (s) => s.cross_border_share_pct,
    format: (v) => `${v.toFixed(0)}%`,
    fixedDomain: [0, 100],
  },
];

export function getMetric(key: MetricKey): MetricDef {
  const m = METRICS.find((m) => m.key === key);
  if (!m) throw new Error(`Unknown metric: ${key}`);
  return m;
}

/** Compute the (min, max) for a metric across the given snapshots. */
export function computeDomain(
  metric: MetricDef,
  scores: Record<string, CountryScoreSummary>,
): [number, number] {
  if (metric.fixedDomain) return metric.fixedDomain;
  const values: number[] = [];
  for (const s of Object.values(scores)) {
    const v = metric.accessor(s);
    if (v != null && Number.isFinite(v) && v > 0) values.push(v);
  }
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    // Single data point: nudge domain so the color is non-zero.
    return metric.log ? [min / 10, max] : [0, max];
  }
  return [min, max];
}

type RGB = [number, number, number];

/** Linear interpolate between two RGB triplets. */
function lerpRgb(a: RGB, b: RGB, t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Three-stop ramp for Hachimi composite_score (0-100):
 *   <50  → red-orange (#dc2626 → #f59e0b)
 *   50-65 → yellow-green (#f59e0b → #84cc16)
 *   >=65 → deep emerald (#84cc16 → #10b981)
 */
function compositeScoreColor(score: number): string {
  const s = Math.max(0, Math.min(100, score));
  if (s < 50) {
    const t = (s - 35) / (50 - 35); // 35 floor (per spec: data range 35-73)
    return lerpRgb([220, 38, 38], [245, 158, 11], Math.max(0, Math.min(1, t)));
  }
  if (s < 65) {
    const t = (s - 50) / (65 - 50);
    return lerpRgb([245, 158, 11], [132, 204, 22], t);
  }
  const t = (s - 65) / (100 - 65);
  return lerpRgb([132, 204, 22], [16, 185, 129], Math.min(1, t));
}

/**
 * Map a metric's value to a color. For composite_score we use a 3-stop
 * red→amber→emerald ramp so a 35 score visibly differs from a 73 score.
 * For all other metrics we keep the single-color (gray→emerald) ramp.
 * Missing values → muted gray-blue.
 */
export function valueToColor(
  metric: MetricDef,
  value: number | null | undefined,
  domain: [number, number],
): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "#1e293b";

  if (metric.key === "composite_score") {
    return compositeScoreColor(value);
  }

  const [lo, hi] = domain;
  let t: number;
  if (metric.log) {
    const safeV = Math.max(value, lo / 10);
    const logLo = Math.log10(Math.max(lo, 1e-6));
    const logHi = Math.log10(Math.max(hi, lo + 1));
    t = (Math.log10(safeV) - logLo) / (logHi - logLo);
  } else {
    t = (value - lo) / (hi - lo);
  }
  t = Math.max(0, Math.min(1, t));
  const tBoosted = 0.12 + t * 0.88;
  return lerpRgb([30, 41, 59], [16, 185, 129], tBoosted);
}

/** Stops used by the bottom-left legend swatch for the composite score. */
export const COMPOSITE_LEGEND_GRADIENT =
  "linear-gradient(90deg, rgb(220,38,38) 0%, rgb(245,158,11) 42%, rgb(132,204,22) 65%, rgb(16,185,129) 100%)";
