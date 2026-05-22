import type { CountryScoreSummary } from "./scores";

/**
 * 品牌化适配评分（Brand-Fit Score）—— 运行时模型 v1
 *
 * 战略背景（见 战略讨论纪要_选国与选品.md / 全球电商市场调研_选国与品牌化适配.md）：
 * 以「品牌化 + 差异化高端选品」为主线；团队核心能力 = CVR/CTR 优化、品牌建设、
 * 大批量短视频/网红投放、渠道布局（Meta(Ins)+TikTok 引流 → 独立站 + TikTok Shop
 * 转化，Amazon 仅承接外溢竞价）。
 *
 * 四个维度均衡加权（各 25%，按可得数据再归一化）：
 *   1. DTC 渠道适配    —— 独立站打法能不能跑通（DTC% + Direct&Brand Search）
 *   2. 品牌溢价空间    —— 卖不卖得出 30-40% 溢价（Luxury 占比 + AOV）
 *   3. 视频/社媒契合    —— 我们的内容能力是否可复用（英文素材复用度 + TikTok Shop）
 *   4. 流量成本效率    —— 起量成本（Meta CPM，越低越好）
 *
 * 数据缺失的维度置空；可得维度 < 3 时不出综合分（标记"数据不足"）。
 */

export type BrandFitDimensionKey =
  | "dtc_channel_fit"
  | "brand_premium"
  | "video_social_fit"
  | "traffic_efficiency";

export type BrandFitDimension = {
  key: BrandFitDimensionKey;
  label: string;
  value: number | null; // 0-100
  /** true 表示该维度有部分输入缺失（用已有输入估算）。 */
  partial: boolean;
  /** 人类可读的输入说明（公式面板用）。 */
  detail: string;
};

export type BrandFitResult = {
  composite: number | null;
  dimensions: BrandFitDimension[];
  availableDimCount: number;
  sufficient: boolean;
};

/** 各维度均衡权重（综合分按可得维度再归一化）。 */
export const BRAND_FIT_WEIGHTS: Record<BrandFitDimensionKey, number> = {
  dtc_channel_fit: 0.25,
  brand_premium: 0.25,
  video_social_fit: 0.25,
  traffic_efficiency: 0.25,
};

export const BRAND_FIT_DIMENSION_LABELS: Record<BrandFitDimensionKey, string> = {
  dtc_channel_fit: "DTC 渠道适配",
  brand_premium: "品牌溢价空间",
  video_social_fit: "视频/社媒契合",
  traffic_efficiency: "流量成本效率",
};

/** 综合分所需的最少可得维度数。 */
const MIN_DIMS_FOR_COMPOSITE = 3;

/**
 * 英文素材可复用度（团队能力假设，非市场数据）。100 = 英语母语零本地化；
 * 越低 = 本地化越重（语言/文化/审美），契合度越差。日韩偏低（AI 直译易失败）。
 */
const CONTENT_REUSE_PCT: Record<string, number> = {
  USA: 100, GBR: 100, SGP: 100, AUS: 100,
  CAN: 90, ZAF: 90, NLD: 90, NOR: 90, SWE: 90,
  IND: 80, PHL: 80,
  MYS: 70,
  CHE: 55, DEU: 55, FRA: 55, ITA: 55, ESP: 55, POL: 55, ROU: 55,
  ARE: 45, SAU: 45, MEX: 45, CHL: 45, ARG: 45, BRA: 45, TUR: 45, THA: 45, VNM: 45, IDN: 45,
  RUS: 40,
  JPN: 35, KOR: 35,
};
const DEFAULT_CONTENT_REUSE = 50;

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** CPM 参考区间（USD）：越接近便宜端得分越高。 */
const CPM_CHEAP = 1;
const CPM_DEAR = 18;

export function contentReusePct(iso: string): number {
  return CONTENT_REUSE_PCT[iso.toUpperCase()] ?? DEFAULT_CONTENT_REUSE;
}

export function computeBrandFit(
  s: CountryScoreSummary,
  iso: string,
): BrandFitResult {
  // ---- Dim 1: DTC 渠道适配 ----
  const dtcParts: number[] = [];
  const dtcNotes: string[] = [];
  let dtcMissing = false;
  if (s.dtc_pct != null) {
    dtcParts.push(clamp((s.dtc_pct / 20) * 100));
    dtcNotes.push(`DTC ${s.dtc_pct}%`);
  } else dtcMissing = true;
  if (s.direct_brand_search_pct != null) {
    dtcParts.push(clamp((s.direct_brand_search_pct / 60) * 100));
    dtcNotes.push(`Direct&Brand ${s.direct_brand_search_pct}%`);
  } else dtcMissing = true;
  const dim1: BrandFitDimension = {
    key: "dtc_channel_fit",
    label: BRAND_FIT_DIMENSION_LABELS.dtc_channel_fit,
    value: dtcParts.length ? mean(dtcParts) : null,
    partial: dtcParts.length > 0 && dtcMissing,
    detail: dtcNotes.join(" · ") || "无数据",
  };

  // ---- Dim 2: 品牌溢价空间 ----
  const premParts: number[] = [];
  const premNotes: string[] = [];
  let premMissing = false;
  if (s.luxury_share_pct != null) {
    premParts.push(clamp((s.luxury_share_pct / 40) * 100));
    premNotes.push(`Luxury 占比 ${s.luxury_share_pct}%`);
  } else premMissing = true;
  if (s.aov_usd != null) {
    premParts.push(clamp((s.aov_usd / 120) * 100));
    premNotes.push(`AOV $${s.aov_usd}`);
  } else premMissing = true;
  const dim2: BrandFitDimension = {
    key: "brand_premium",
    label: BRAND_FIT_DIMENSION_LABELS.brand_premium,
    value: premParts.length ? mean(premParts) : null,
    partial: premParts.length > 0 && premMissing,
    detail: premNotes.join(" · ") || "无数据",
  };

  // ---- Dim 3: 视频/社媒契合（始终可得：内容复用度 + TikTok Shop） ----
  const reuse = contentReusePct(iso);
  const ttsLive = s.tiktok_shop === 1;
  const dim3Value = reuse * 0.6 + (ttsLive ? 100 : 0) * 0.4;
  const dim3: BrandFitDimension = {
    key: "video_social_fit",
    label: BRAND_FIT_DIMENSION_LABELS.video_social_fit,
    value: clamp(dim3Value),
    partial: false,
    detail: `英文素材复用 ${reuse}% · TikTok Shop ${ttsLive ? "✓" : "✗"}`,
  };

  // ---- Dim 4: 流量成本效率（Meta CPM，越低越好） ----
  let dim4Value: number | null = null;
  let dim4Detail = "无 CPM 数据";
  if (s.meta_cpm_lebesgue_usd != null) {
    dim4Value = clamp(((CPM_DEAR - s.meta_cpm_lebesgue_usd) / (CPM_DEAR - CPM_CHEAP)) * 100);
    dim4Detail = `Meta CPM $${s.meta_cpm_lebesgue_usd.toFixed(2)}`;
  }
  const dim4: BrandFitDimension = {
    key: "traffic_efficiency",
    label: BRAND_FIT_DIMENSION_LABELS.traffic_efficiency,
    value: dim4Value,
    partial: false,
    detail: dim4Detail,
  };

  const dimensions = [dim1, dim2, dim3, dim4];
  const available = dimensions.filter((d) => d.value != null);
  const sufficient = available.length >= MIN_DIMS_FOR_COMPOSITE;

  let composite: number | null = null;
  if (sufficient) {
    const totalWeight = available.reduce(
      (sum, d) => sum + BRAND_FIT_WEIGHTS[d.key],
      0,
    );
    composite =
      available.reduce(
        (sum, d) => sum + (d.value as number) * BRAND_FIT_WEIGHTS[d.key],
        0,
      ) / totalWeight;
  }

  return {
    composite,
    dimensions,
    availableDimCount: available.length,
    sufficient,
  };
}
