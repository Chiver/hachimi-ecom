import {
  getAvailableCountryIsos,
  getCountryData,
  getLebesgueMetaCpm,
  getBrandFit,
} from "./data";

/** Confidence level of each KPI we show on the hover card. */
export type ConfidenceMap = {
  composite_score?: "H" | "M" | "L";
  gmv_total_usd_million?: "H" | "M" | "L";
  cagr_2025_2030_pct?: "H" | "M" | "L";
  per_capita_spend_usd?: "H" | "M" | "L";
  online_buyers_million?: "H" | "M" | "L";
  cross_border_share_pct?: "H" | "M" | "L";
};

export type TrafficSnapshot = {
  channel: string;
  cpm_usd: number | null;
  cpc_usd: number | null;
  estimated: boolean;
};

export type CountryScoreSummary = {
  iso_alpha3: string;
  composite_score: number | null;
  gmv_total_usd_million: number | null;
  cagr_2025_2030_pct: number | null;
  per_capita_spend_usd: number | null;
  online_buyers_million: number | null;
  cross_border_share_pct: number | null;
  recommended_entry_mode?: string;
  recommended_categories?: string[];
  /** Per-field confidence (H/M/L) so UI can flag "估算" on L values. */
  confidence: ConfidenceMap;
  /** Top 1-3 ad channels with their CPM/CPC for the hover card. */
  traffic: TrafficSnapshot[];
  /** Lebesgue 2026 Facebook CPM — independent benchmark (third-party). */
  meta_cpm_lebesgue_usd: number | null;
  /** Geopolitical risk level + headline for at-a-glance map / hover. */
  geo_risk_level: "extreme" | "high" | "medium" | "low" | null;
  geo_risk_headline: string | null;
  // ---- 选国决策表派生：品牌化适配原始指标（缺失=null→置灰） ----
  /** DTC / 独立站占电商比例 (%). */
  dtc_pct: number | null;
  /** Direct + Brand Search 流量占比中值 (%). */
  direct_brand_search_pct: number | null;
  /** 奢侈品市场规模 (USD B). */
  luxury_size_usd_b: number | null;
  /** 奢侈品规模 / 电商总规模 (%). */
  luxury_share_pct: number | null;
  /** 客单价 AOV (USD). */
  aov_usd: number | null;
  /** TikTok Shop 是否上线 one-hot：1=已上线，0=未上线。 */
  tiktok_shop: 0 | 1 | null;
};

export function getCountryScoreSummaries(): Record<string, CountryScoreSummary> {
  const out: Record<string, CountryScoreSummary> = {};
  for (const iso of getAvailableCountryIsos()) {
    const data = getCountryData(iso);
    if (!data) continue;
    const market = data.ecommerce_market.find((m) => m.year === 2024) ?? data.ecommerce_market[0];
    const sm = market?.source_metadata ?? {};
    const conf = (key: string): "H" | "M" | "L" | undefined =>
      sm[key]?.confidence as "H" | "M" | "L" | undefined;
    const bf = getBrandFit(iso);
    out[iso] = {
      iso_alpha3: iso,
      composite_score: data.hachimi_scores.composite_score ?? null,
      gmv_total_usd_million: market?.gmv_total_usd_million ?? null,
      cagr_2025_2030_pct: market?.cagr_2025_2030_pct ?? null,
      per_capita_spend_usd: market?.per_capita_spend_usd ?? null,
      online_buyers_million: market?.online_buyers_million ?? null,
      cross_border_share_pct: market?.cross_border_share_pct ?? null,
      recommended_entry_mode: data.hachimi_scores.recommended_entry_mode,
      recommended_categories: data.hachimi_scores.recommended_categories,
      confidence: {
        // composite_score is Hachimi-derived; mark it explicitly (no source_metadata)
        composite_score: undefined,
        gmv_total_usd_million: conf("gmv_total_usd_million"),
        cagr_2025_2030_pct: conf("cagr_2025_2030_pct"),
        per_capita_spend_usd: conf("per_capita_spend_usd"),
        online_buyers_million: conf("online_buyers_million"),
        cross_border_share_pct: conf("cross_border_share_pct"),
      },
      traffic: pickTopTrafficChannels(data),
      meta_cpm_lebesgue_usd: getLebesgueMetaCpm(iso)?.cpm_usd ?? null,
      geo_risk_level: data.geopolitical_risk?.overall_level ?? null,
      geo_risk_headline: data.geopolitical_risk?.headline ?? null,
      dtc_pct: bf?.dtc_pct ?? null,
      direct_brand_search_pct: bf?.direct_brand_search_pct ?? null,
      luxury_size_usd_b: bf?.luxury_size_usd_b ?? null,
      luxury_share_pct: bf?.luxury_share_pct ?? null,
      aov_usd: bf?.aov_usd ?? null,
      tiktok_shop: bf?.tiktok_shop ?? null,
    };
  }
  return out;
}

/** Pick up to 3 most relevant ad channels (Meta / Google / TikTok preferred). */
function pickTopTrafficChannels(
  data: ReturnType<typeof getCountryData> & object,
): TrafficSnapshot[] {
  if (!data) return [];
  const preferred = ["meta", "google_search", "tiktok"];
  const all = data.traffic_economics ?? [];
  const sorted = [...all].sort((a, b) => {
    const ra = preferred.indexOf(a.channel);
    const rb = preferred.indexOf(b.channel);
    const ka = ra === -1 ? 99 : ra;
    const kb = rb === -1 ? 99 : rb;
    return ka - kb;
  });
  return sorted.slice(0, 3).map((t) => {
    const src = t.source_url ?? "";
    const estimated =
      src.toLowerCase().startsWith("hachimi") ||
      src.toLowerCase().includes("hachimi benchmark");
    return {
      channel: t.channel,
      cpm_usd: t.cpm_usd ?? null,
      cpc_usd: t.cpc_usd ?? null,
      estimated,
    };
  });
}

/** Map a composite score (0-100) to a green-scale color. Returns CSS color. */
export function scoreToColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "#1e293b"; // gray for missing
  const s = Math.max(0, Math.min(100, score));
  // 0 → faint emerald, 100 → full emerald
  // We interpolate between a muted dark and emerald-500 #10b981
  const t = s / 100;
  // Endpoints in RGB
  const from = [30, 41, 59]; // #1e293b (cool gray-blue)
  const to = [16, 185, 129]; // #10b981 emerald
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
