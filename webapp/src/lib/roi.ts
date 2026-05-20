/**
 * ROI calculation engine — implements the formulas in
 * `ROI公式合集_独立站_Meta_TikTok_v1.0.md` (v1.0, 2026-05-19).
 *
 * Inputs are in human-friendly units (percentages as 0-100 not 0-1, USD as
 * floats). We normalize internally.
 */

export type RoiInputs = {
  // Product & sale
  P: number; // AOV / price (USD)
  d_pct: number; // discount % (0-100)
  t_pct: number; // VAT/sales tax % (0-100)
  // Platform & payment
  c_pct: number; // platform fee % (0-100)
  a_pct: number; // affiliate / creator commission % (0-100)
  // Logistics & cogs
  SC: number; // single-package shipping cost (USD)
  COGS: number; // 1688 wholesale cost (USD)
  // Returns
  RR_pct: number; // return rate % (0-100)
  U: number; // unrecoverable stripe fee per returned order (USD)
  // Ads
  CPM: number; // cost per 1000 impressions (USD)
  CTR_pct: number; // click-through rate % (0-100)
  CVR_pct: number; // conversion rate % (0-100)
  AC: number; // total ad spend (USD)
};

export type RoiOutputs = {
  // Per-unit economics
  NetSales: number;
  Profit_kept: number;
  Profit_returned: number;
  E_unit: number;
  // Ad funnel
  AdCost_per_order: number;
  N: number; // total orders driven by AC
  // Aggregates
  G: number; // total contribution margin (excl ad)
  TotalNetProfit: number;
  PerUnitNetProfit: number;
  TotalSales: number;
  // ROI series
  ROI_marginal: number; // G / AC
  Net_ROI: number; // (G - AC) / AC
  ROAS: number;
  BreakEvenROAS: number;
  MER: number; // Total Sales / Ad Spend
  // Margin rates
  GrossMargin: number;
  ContributionMargin: number;
  NetProfitMargin: number;
};

export function calculateRoi(input: RoiInputs): RoiOutputs {
  const P = input.P;
  const d = input.d_pct / 100;
  const t = input.t_pct / 100;
  const c = input.c_pct / 100;
  const a = input.a_pct / 100;
  const SC = input.SC;
  const COGS = input.COGS;
  const RR = input.RR_pct / 100;
  const U = input.U;
  const CPM = input.CPM;
  const CTR = input.CTR_pct / 100;
  const CVR = input.CVR_pct / 100;
  const AC = input.AC;

  const NetSales = (P * (1 - d)) / (1 + t);
  const Profit_kept = NetSales * (1 - c - a) - SC - COGS;
  const Profit_returned = -(SC + COGS + U);
  const E_unit =
    (1 - RR) * NetSales * (1 - c - a) - (SC + COGS) - RR * U;

  const conv = CTR * CVR; // joint click→buy rate
  // N = AC × 1000 × CTR × CVR / CPM
  const N = CPM > 0 ? (AC * 1000 * conv) / CPM : 0;
  const AdCost_per_order = conv > 0 ? CPM / (1000 * conv) : Infinity;

  const G = N * E_unit;
  const TotalNetProfit = G - AC;
  const PerUnitNetProfit =
    E_unit - (Number.isFinite(AdCost_per_order) ? AdCost_per_order : 0);
  const TotalSales = N * NetSales;

  const ROI_marginal = AC > 0 ? G / AC : 0;
  const Net_ROI = ROI_marginal - 1;
  const ROAS = AC > 0 ? TotalSales / AC : 0;
  const BreakEvenROAS = E_unit > 0 ? NetSales / E_unit : Infinity;
  const MER = AC > 0 ? TotalSales / AC : 0;

  const GrossMargin = NetSales > 0 ? (NetSales - COGS) / NetSales : 0;
  const ContributionMargin = NetSales > 0 ? E_unit / NetSales : 0;
  const NetProfitMargin = NetSales > 0 ? PerUnitNetProfit / NetSales : 0;

  return {
    NetSales,
    Profit_kept,
    Profit_returned,
    E_unit,
    AdCost_per_order,
    N,
    G,
    TotalNetProfit,
    PerUnitNetProfit,
    TotalSales,
    ROI_marginal,
    Net_ROI,
    ROAS,
    BreakEvenROAS,
    MER,
    GrossMargin,
    ContributionMargin,
    NetProfitMargin,
  };
}

export type HealthStatus = "excellent" | "healthy" | "warning" | "danger";

export function ratingFor(
  value: number,
  thresholds: { excellent: number; healthy: number; warning: number },
  higherIsBetter: boolean = true,
): HealthStatus {
  if (higherIsBetter) {
    if (value >= thresholds.excellent) return "excellent";
    if (value >= thresholds.healthy) return "healthy";
    if (value >= thresholds.warning) return "warning";
    return "danger";
  }
  // lower is better
  if (value <= thresholds.excellent) return "excellent";
  if (value <= thresholds.healthy) return "healthy";
  if (value <= thresholds.warning) return "warning";
  return "danger";
}

export const STATUS_COLOR: Record<HealthStatus, string> = {
  excellent: "text-emerald-300 bg-emerald-500/15 ring-emerald-400/40",
  healthy: "text-emerald-200 bg-emerald-500/10 ring-emerald-400/20",
  warning: "text-amber-300 bg-amber-500/15 ring-amber-400/30",
  danger: "text-red-300 bg-red-500/20 ring-red-400/50",
};

export const STATUS_LABEL: Record<HealthStatus, string> = {
  excellent: "优秀",
  healthy: "健康",
  warning: "警戒",
  danger: "亏钱",
};
