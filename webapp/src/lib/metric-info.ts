import { getAvailableCountryIsos, getCountryData } from "./data";

/** A point on the benchmark distribution. */
export type Benchmark = {
  count: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  values: { iso: string; v: number }[];
};

export type MetricInfoKey =
  | "lpi_score"
  | "lpi_global_rank"
  | "avg_last_mile_days"
  | "avg_last_mile_cost_usd"
  | "parcel_volume_million"
  | "return_rate_pct";

export type MetricInfo = {
  key: MetricInfoKey;
  title: string;
  /** What the metric measures, in plain language (2-4 sentences). */
  definition: string;
  /** How to read it: "0-5 scale, 5 = best", etc. */
  scale: string;
  /** Higher = better, lower = better, or "context". */
  direction: "higher_better" | "lower_better" | "context";
  /** What range qualifies as poor / decent / strong. */
  qualitative: { poor: string; decent: string; strong: string };
  /** Formatter for display. */
  format: (v: number) => string;
  /** Accessor from CountryData. */
  accessor: (data: ReturnType<typeof getCountryData>) => number | null | undefined;
};

const fmtFixed = (digits: number) => (v: number) => v.toFixed(digits);

export const METRIC_INFO: Record<MetricInfoKey, MetricInfo> = {
  lpi_score: {
    key: "lpi_score",
    title: "LPI 物流绩效指数",
    definition:
      "World Bank Logistics Performance Index — 世界银行每两年发布的国家物流综合得分。涵盖海关效率、基础设施、国际运输便利度、本土物流质量、跟踪追溯能力、时效六大维度。",
    scale: "0 (最差) - 5 (最好) ；全球平均约 3.0",
    direction: "higher_better",
    qualitative: {
      poor: "< 2.8 — 物流基础薄弱，建议优先海外仓/本地实体",
      decent: "2.8 - 3.5 — 主流市场常态，FBA/直邮均可",
      strong: "> 3.5 — 物流体验优秀，可全渠道运营",
    },
    format: fmtFixed(2),
    accessor: (d) => d?.logistics[0]?.lpi_score ?? null,
  },
  lpi_global_rank: {
    key: "lpi_global_rank",
    title: "LPI 全球排名",
    definition:
      "在 World Bank LPI 报告中的国家排名。全球共约 160 国参与排名，越小越好。",
    scale: "1 (最好) - 160 (最差)",
    direction: "lower_better",
    qualitative: {
      poor: "> 60 — 物流国际竞争力弱",
      decent: "20 - 60 — 物流体验中等",
      strong: "< 20 — 全球物流强国",
    },
    format: (v) => `#${v.toFixed(0)}`,
    accessor: (d) => d?.logistics[0]?.lpi_global_rank ?? null,
  },
  avg_last_mile_days: {
    key: "avg_last_mile_days",
    title: "平均最后一公里时效",
    definition:
      "从包裹进入派送中心到送达消费者的平均天数。受国土面积、人口密度、自提柜密度、城乡差距影响。这是消费者实际「等待感」的核心指标。",
    scale: "天数；越短越好",
    direction: "lower_better",
    qualitative: {
      poor: "> 3 天 — 体验差，影响复购",
      decent: "1.5 - 3 天 — 主流市场水平",
      strong: "< 1.5 天 — 接近 Prime 体验",
    },
    format: (v) => `${v.toFixed(1)} 天`,
    accessor: (d) => d?.logistics[0]?.avg_last_mile_days ?? null,
  },
  avg_last_mile_cost_usd: {
    key: "avg_last_mile_cost_usd",
    title: "平均最后一公里成本",
    definition:
      "派送一个包裹到消费者手中的平均成本（不含头程 / 国际段）。城市密度、自提柜普及率、薪资水平、最低订单量都会影响。卖家应将此与客单 / 毛利对比。",
    scale: "USD/包裹；越低越好",
    direction: "lower_better",
    qualitative: {
      poor: "> $6 — 成本压毛利，需提高客单或合并发货",
      decent: "$3 - $6 — 多数欧美市场常态",
      strong: "< $3 — 高密度自提柜国家（波兰、荷兰等）",
    },
    format: (v) => `$${v.toFixed(2)}`,
    accessor: (d) => d?.logistics[0]?.avg_last_mile_cost_usd ?? null,
  },
  parcel_volume_million: {
    key: "parcel_volume_million",
    title: "年包裹量",
    definition:
      "全国一年内派送的总包裹数量（含本土 + 跨境）。是衡量市场体量的「硬指标」——大于 GDP 因为反映人均网购频次。卖家应当把它与人口对比看出「人均年下单数」。",
    scale: "百万包裹/年；越大市场越成熟",
    direction: "higher_better",
    qualitative: {
      poor: "< 200M — 市场仍在早期，竞争少但用户教育成本高",
      decent: "200M - 1B — 中等成熟市场",
      strong: "> 1B — 成熟大市场（US/CN/DE/UK/JP）",
    },
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)}B` : `${v.toFixed(0)}M`),
    accessor: (d) => d?.logistics[0]?.parcel_volume_million ?? null,
  },
  return_rate_pct: {
    key: "return_rate_pct",
    title: "平均退货率",
    definition:
      "全品类电商订单退货占比，反映消费者权利与购物习惯。服装类目通常远高于平均（25-40%），3C 类目低（4-8%）。德/北欧最高（消费者权益强），亚洲最低。",
    scale: "%；越低对卖家越好（视品类）",
    direction: "lower_better",
    qualitative: {
      poor: "> 18% — 高退货市场，服装/家居谨慎进入",
      decent: "8% - 18% — 主流市场水平",
      strong: "< 8% — 退货友好型市场（多见亚洲）",
    },
    format: (v) => `${v.toFixed(1)}%`,
    accessor: (d) => d?.logistics[0]?.return_rate_pct ?? null,
  },
};

/**
 * Compute a benchmark distribution for a metric across all available country
 * data. Memoized inline (per metric, per session — recomputes if data changes).
 */
const _benchmarkCache = new Map<MetricInfoKey, Benchmark>();
export function getMetricBenchmark(key: MetricInfoKey): Benchmark {
  if (_benchmarkCache.has(key)) return _benchmarkCache.get(key)!;
  const info = METRIC_INFO[key];
  const pairs: { iso: string; v: number }[] = [];
  for (const iso of getAvailableCountryIsos()) {
    const v = info.accessor(getCountryData(iso));
    if (v != null && Number.isFinite(v)) pairs.push({ iso, v });
  }
  pairs.sort((a, b) => a.v - b.v);
  const n = pairs.length;
  const q = (p: number) => {
    if (n === 0) return 0;
    const idx = Math.min(n - 1, Math.max(0, Math.floor(p * (n - 1))));
    return pairs[idx].v;
  };
  const bench: Benchmark = {
    count: n,
    min: n > 0 ? pairs[0].v : 0,
    p25: q(0.25),
    median: q(0.5),
    p75: q(0.75),
    max: n > 0 ? pairs[n - 1].v : 0,
    values: pairs,
  };
  _benchmarkCache.set(key, bench);
  return bench;
}

/** Reset benchmark cache (e.g. in tests). */
export function _resetBenchmarkCache() {
  _benchmarkCache.clear();
}
