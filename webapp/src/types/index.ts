/**
 * Hachimi 全球电商调研 — TypeScript Types + Zod Runtime Validation
 *
 * 静态版（无数据库）。所有数据从 JSON 文件 import，使用 Zod 在 build/dev 期校验。
 *
 * 使用方式：
 *   pnpm add zod
 *
 *   // 校验单国数据
 *   import { CountryDataSchema } from "@/types";
 *   import polandData from "@/data/countries/poland.json";
 *   const validated = CountryDataSchema.parse(polandData);
 *
 * Frozen at: 2026-05-17
 */

import { z } from "zod";

// ============================================================
// Enums
// ============================================================

export const RegionEnum = z.enum([
  "North America",
  "Western Europe",
  "Northern Europe",
  "Eastern Europe & CIS",
  "Southeast Asia",
  "South Asia",
  "East Asia & Oceania",
  "Latin America",
  "MENA & Africa",
]);

export const CategoryEnum = z.enum([
  "apparel", "beauty", "home", "electronics", "baby", "pet",
  "outdoor", "auto", "health", "toys", "kitchen", "garden",
]);

export const PlatformTypeEnum = z.enum([
  "marketplace", "dtc_aggregator", "social_commerce", "vertical_specialist",
]);

export const ComplianceRuleTypeEnum = z.enum([
  "de_minimis", "vat_threshold", "marketplace_facilitator",
  "data_privacy", "product_cert", "ip_enforcement", "labeling",
  "tax",
]);

export const PolicyEventTypeEnum = z.enum([
  "tariff", "vat_change", "de_minimis_change",
  "cert_requirement", "data_law", "sanctions",
  "labeling", "tax",
]);

export const SeverityEnum = z.enum(["critical", "high", "medium", "low", "blocking"]);
export const TrafficChannelEnum = z.enum([
  "meta", "google_search", "google_display", "tiktok", "amazon_ppc",
  // Regional ad networks (Korea, Russia, Japan)
  "kakao", "naver_search", "vk_ads", "yahoo_search", "yandex_search",
]);
export const IntensityEnum = z.enum(["low", "medium", "high", "extreme"]);
export const TrendEnum = z.enum(["rising", "stable", "declining"]);
export const EntryModeEnum = z.enum(["direct_dropship", "fba_only", "overseas_warehouse", "local_entity", "skip"]);
export const ConfidenceEnum = z.enum(["H", "M", "L"]);
export const SourceTypeEnum = z.enum(["gov_api", "paid_report", "company_filing", "scrape", "community", "ngo_report"]);
export const GlossaryCategoryEnum = z.enum(["regulation", "tax", "logistics", "payment", "platform_ops", "ecom_metric"]);
export const SanctionsStatusEnum = z.enum(["none", "comprehensive", "sectoral"]);

// ============================================================
// Source Metadata（所有数据点的追溯单元）
// ============================================================

export const SourceMetaSchema = z.object({
  source_name: z.string().optional(),
  source_url: z.string().optional(),
  fetched_at: z.string().optional(),
  confidence: ConfidenceEnum.optional(),
  /** Verbatim quote from the source PDF / page (when vision-verified). */
  source_quote: z.string().optional(),
  /** Publisher of the source (e.g. "Statista Market Insights"). */
  publisher: z.string().optional(),
  /** How the value was extracted: "vision (Claude read PDF page as image)" | "text" | etc. */
  extraction_method: z.string().optional(),
  /** Free-form caveat the data team wants to surface in tooltips. */
  warning: z.string().optional(),
}).passthrough();

export const SourceMetadataMapSchema = z.record(z.string(), SourceMetaSchema);

// ============================================================
// 1. Country (meta)
// ============================================================

export const CountrySchema = z.object({
  iso_alpha3: z.string().length(3),
  iso_alpha2: z.string().length(2),
  name_en: z.string(),
  name_zh: z.string(),
  region: RegionEnum,
  sub_region: z.string().nullable().optional(),
  currency_code: z.string().length(3),
  official_language: z.string(),
  flag_emoji: z.string().optional(),
  is_eu: z.boolean(),
  sanctions_status: SanctionsStatusEnum.default("none"),
  notes: z.string().optional(),
});
export type Country = z.infer<typeof CountrySchema>;

// ============================================================
// 2. Macro Indicators
// ============================================================

export const MacroIndicatorSchema = z.object({
  year: z.number().int(),
  population: z.number().nullable().optional(),
  gdp_usd_billion: z.number().nullable().optional(),
  gdp_per_capita_usd: z.number().nullable().optional(),
  disposable_income_usd: z.number().nullable().optional(),
  inflation_rate_pct: z.number().nullable().optional(),
  fx_volatility_pct: z.number().nullable().optional(),
  internet_penetration_pct: z.number().nullable().optional(),
  smartphone_penetration_pct: z.number().nullable().optional(),
  mobile_internet_users_million: z.number().nullable().optional(),
  urban_population_pct: z.number().nullable().optional(),
  median_age: z.number().nullable().optional(),
  source_metadata: SourceMetadataMapSchema.optional(),
});
export type MacroIndicator = z.infer<typeof MacroIndicatorSchema>;

// ============================================================
// 3. E-commerce Market
// ============================================================

export const EcommerceMarketSchema = z.object({
  year: z.number().int(),
  gmv_total_usd_million: z.number().nullable().optional(),
  gmv_yoy_pct: z.number().nullable().optional(),
  cagr_2025_2030_pct: z.number().nullable().optional(),
  ecom_share_of_retail_pct: z.number().nullable().optional(),
  per_capita_spend_usd: z.number().nullable().optional(),
  online_buyers_million: z.number().nullable().optional(),
  online_buyer_penetration_pct: z.number().nullable().optional(),
  mobile_share_pct: z.number().nullable().optional(),
  social_commerce_gmv_usd_million: z.number().nullable().optional(),
  cross_border_share_pct: z.number().nullable().optional(),
  domestic_share_pct: z.number().nullable().optional(),
  top_cross_border_origin_countries: z.array(z.string()).optional(),
  source_metadata: SourceMetadataMapSchema.optional(),
});
export type EcommerceMarket = z.infer<typeof EcommerceMarketSchema>;

// ============================================================
// 4. Platforms + Platform Metrics
// ============================================================

export const PlatformMetricsSchema = z.object({
  country_code: z.string().length(3),
  gmv_usd_million: z.number().nullable().optional(),
  traffic_monthly_million: z.number().nullable().optional(),
  market_share_pct: z.number().nullable().optional(),
  commission_rate_pct: z.number().nullable().optional(),
  fulfillment_fee_model: z.string().optional(),
  chinese_seller_share_pct: z.number().nullable().optional(),
  rank_in_country: z.number().int().nullable().optional(),
  source_metadata: SourceMetadataMapSchema.optional(),
});

export const PlatformSchema = z.object({
  platform_code: z.string(),
  name: z.string(),
  parent_company: z.string().optional(),
  platform_type: PlatformTypeEnum,
  coverage_countries: z.array(z.string()).optional(),
  website: z.string().optional(),
  founded_year: z.number().int().nullable().optional(),
  metrics_2024: PlatformMetricsSchema.optional(),
  metrics_2023: PlatformMetricsSchema.optional(),
  notes: z.string().optional(),
});
export type Platform = z.infer<typeof PlatformSchema>;

// ============================================================
// 5. Category Metrics
// ============================================================

export const CategoryMetricSchema = z.object({
  category_code: CategoryEnum,
  year: z.number().int(),
  gmv_usd_million: z.number().nullable().optional(),
  yoy_growth_pct: z.number().nullable().optional(),
  forecast_2030_usd_million: z.number().nullable().optional(),
  typical_gross_margin_pct: z.number().nullable().optional(),
  typical_return_rate_pct: z.number().nullable().optional(),
  regulatory_complexity: IntensityEnum.optional(),
  chinese_supply_advantage: IntensityEnum.optional(),
  notes: z.string().optional(),
  source_metadata: SourceMetadataMapSchema.optional(),
});
export type CategoryMetric = z.infer<typeof CategoryMetricSchema>;

// ============================================================
// 6. Top SKU
// ============================================================

export const TopSkuSchema = z.object({
  country_code: z.string().length(3),
  category_code: CategoryEnum,
  platform_code: z.string(),
  rank: z.number().int(),
  sku_title: z.string().optional(),
  sku_image_url: z.string().optional(),
  asin_or_id: z.string().optional(),
  price_usd: z.number().nullable().optional(),
  estimated_monthly_sales: z.number().int().nullable().optional(),
  seller_name: z.string().optional(),
  seller_country: z.string().optional(),
  fetched_at: z.string().optional(),
  source_url: z.string().optional(),
});
export type TopSku = z.infer<typeof TopSkuSchema>;

// ============================================================
// 7. Payments
// ============================================================

export const PaymentMethodSchema = z.object({
  payment_method: z.string(),
  share_pct: z.number().nullable().optional(),
  year: z.number().int(),
  forecast_2030_pct: z.number().nullable().optional(),
  is_local_unique: z.boolean().optional(),
  operator: z.string().optional(),
  source_url: z.string().optional(),
  confidence: ConfidenceEnum.optional(),
  notes: z.string().optional(),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// ============================================================
// 8. Logistics
// ============================================================

export const LogisticsSchema = z.object({
  year: z.number().int(),
  lpi_score: z.number().nullable().optional(),
  lpi_global_rank: z.number().int().nullable().optional(),
  avg_last_mile_days: z.number().nullable().optional(),
  avg_last_mile_cost_usd: z.number().nullable().optional(),
  parcel_volume_million: z.number().nullable().optional(),
  top_carriers: z.array(z.string()).optional(),
  amazon_fba_available: z.boolean().optional(),
  typical_overseas_warehouse_providers: z.array(z.string()).optional(),
  return_rate_pct: z.number().nullable().optional(),
  source_metadata: SourceMetadataMapSchema.optional(),
  notes: z.string().optional(),
});
export type Logistics = z.infer<typeof LogisticsSchema>;

// ============================================================
// 9. Compliance
// ============================================================

export const ComplianceSchema = z.object({
  rule_type: ComplianceRuleTypeEnum,
  rule_name: z.string(),
  description: z.string().optional(),
  applies_to_categories: z.array(z.string()).optional(),
  effective_date: z.string().nullable().optional(),
  threshold_value: z.string().optional(),
  severity: SeverityEnum.optional(),
  source_url: z.string().optional(),
});
export type Compliance = z.infer<typeof ComplianceSchema>;

// ============================================================
// 10. Policy Events
// ============================================================

export const PolicyEventSchema = z.object({
  event_date: z.string(),
  countries_affected: z.array(z.string()).optional(),
  categories_affected: z.array(z.string()).optional(),
  event_type: PolicyEventTypeEnum,
  title: z.string(),
  description: z.string().optional(),
  source_url: z.string().optional(),
  severity: SeverityEnum.optional(),
});
export type PolicyEvent = z.infer<typeof PolicyEventSchema>;

// ============================================================
// 11. Traffic Economics
// ============================================================

export const TrafficEconomicsSchema = z.object({
  channel: TrafficChannelEnum,
  cpm_usd: z.number().nullable().optional(),
  cpc_usd: z.number().nullable().optional(),
  typical_conversion_rate_pct: z.number().nullable().optional(),
  year: z.number().int(),
  source_url: z.string().optional(),
  notes: z.string().optional(),
});
export type TrafficEconomics = z.infer<typeof TrafficEconomicsSchema>;

// ============================================================
// 12. China Seller Density
// ============================================================

export const ChinaSellerDensitySchema = z.object({
  platform_code: z.string(),
  year: z.number().int(),
  top100_china_count: z.number().int().nullable().optional(),
  top1000_china_count: z.number().int().nullable().optional(),
  trend_yoy: TrendEnum.optional(),
  notable_chinese_sellers: z.array(z.string()).optional(),
  chinese_pl_competition_intensity: IntensityEnum.optional(),
  notes: z.string().optional(),
  source_url: z.string().optional(),
  confidence: ConfidenceEnum.optional(),
});
export type ChinaSellerDensity = z.infer<typeof ChinaSellerDensitySchema>;

// ============================================================
// 13. Hachimi Scores
// ============================================================

// ============================================================
// Geopolitical risk assessment (per country)
// ============================================================

export const RiskLevelEnum = z.enum(["extreme", "high", "medium", "low"]);

export const RiskFactorTypeEnum = z.enum([
  "armed_conflict",
  "sanctions",
  "trade_policy",
  "platform_regulation",
  "currency_volatility",
  "domestic_unrest",
  "diplomatic_tension",
  "supply_chain",
]);

export const RiskFactorSchema = z.object({
  type: RiskFactorTypeEnum,
  title: z.string(),
  description: z.string(),
  impact_on_china_sellers: z.string(),
  severity: SeverityEnum,
});

export const RiskSourceSchema = z.object({
  name: z.string(),
  url: z.string(),
  fetched_at: z.string(),
});

export const GeopoliticalRiskSchema = z.object({
  _assessed_at: z.string(),
  _assessed_by: z.string(),
  overall_level: RiskLevelEnum,
  headline: z.string(),
  factors: z.array(RiskFactorSchema),
  entry_recommendation_adjustment: z.string(),
  sources: z.array(RiskSourceSchema),
});
export type GeopoliticalRisk = z.infer<typeof GeopoliticalRiskSchema>;

export const HachimiScoresSchema = z.object({
  _version: z.string(),
  _notes: z.string().optional(),
  market_attractiveness: z.number().nullable().optional(),
  operational_feasibility: z.number().nullable().optional(),
  competition_intensity: z.number().nullable().optional(),
  ai_leverage_potential: z.number().nullable().optional(),
  composite_score: z.number().nullable().optional(),
  recommended_entry_mode: EntryModeEnum.optional(),
  recommended_categories: z.array(CategoryEnum).optional(),
  methodology_url: z.string().optional(),
  computed_at: z.string().optional(),
  rationale: z.string().optional(),
});
export type HachimiScores = z.infer<typeof HachimiScoresSchema>;

// ============================================================
// 14. Glossary Entry
// ============================================================

export const GlossaryEntrySchema = z.object({
  term: z.string(),
  term_full: z.string().optional(),
  term_zh: z.string().optional(),
  category: GlossaryCategoryEnum,
  short_def: z.string(),
  full_def: z.string().optional(),
  applies_to_countries: z.array(z.string()).optional(),
  applies_to_categories: z.array(z.string()).optional(),
  example_case: z.string().optional(),
  seller_impact: z.string().optional(),
  reference_urls: z.array(z.string()).optional(),
});
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;

// ============================================================
// MAIN: Country Data (the JSON file format for each country)
// ============================================================

export const CountryDataSchema = z.object({
  _schema_version: z.string(),
  _country_status: z.enum(["pilot_country", "completed", "in_progress", "pending"]).optional(),
  _last_updated: z.string(),
  _notes: z.string().optional(),
  country: CountrySchema,
  macro_indicators: z.array(MacroIndicatorSchema),
  ecommerce_market: z.array(EcommerceMarketSchema),
  platforms: z.array(PlatformSchema),
  category_metrics: z.array(CategoryMetricSchema),
  top_skus: z.union([
    z.array(TopSkuSchema),
    z.object({ _status: z.string(), _notes: z.string().optional(), _target_count: z.string().optional() }),
  ]).optional(),
  payments: z.array(PaymentMethodSchema),
  logistics: z.array(LogisticsSchema),
  compliance: z.array(ComplianceSchema),
  policy_events: z.array(PolicyEventSchema),
  traffic_economics: z.array(TrafficEconomicsSchema),
  china_seller_density: z.array(ChinaSellerDensitySchema),
  hachimi_scores: HachimiScoresSchema,
  ai_adaptation_notes: z.object({}).passthrough().optional(),
  cross_border_specific: z.object({}).passthrough().optional(),
  geopolitical_risk: GeopoliticalRiskSchema.optional(),
  _data_completeness: z.record(z.string(), z.string()).optional(),
});
export type CountryData = z.infer<typeof CountryDataSchema>;

// ============================================================
// Helper: Validate all country JSONs at build/dev time
// ============================================================

export function validateCountryData(data: unknown): CountryData {
  return CountryDataSchema.parse(data);
}

export function validateGlossary(data: unknown): GlossaryEntry[] {
  return z.array(GlossaryEntrySchema).parse(data);
}

// ============================================================
// Decision Knowledge — pros/cons for payments, carriers, warehouses
// ============================================================

export const PaymentInfoSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  category: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  partnership: z.string().optional(),
  website: z.string().optional(),
});
export type PaymentInfo = z.infer<typeof PaymentInfoSchema>;

export const CarrierInfoSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  country_hq: z.string().optional(),
  type: z.string(),
  coverage: z.array(z.string()).optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  partnership: z.string().optional(),
  website: z.string().optional(),
});
export type CarrierInfo = z.infer<typeof CarrierInfoSchema>;

export const WarehouseInfoSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  parent: z.string().optional(),
  type: z.string(),
  specialties: z.array(z.string()).optional(),
  coverage: z.array(z.string()).optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  partnership: z.string().optional(),
  website: z.string().optional(),
});
export type WarehouseInfo = z.infer<typeof WarehouseInfoSchema>;

export const DecisionKnowledgeSchema = z.object({
  _schema_version: z.string(),
  _last_updated: z.string(),
  _notes: z.string().optional(),
  payments: z.array(PaymentInfoSchema),
  carriers: z.array(CarrierInfoSchema),
  warehouses: z.array(WarehouseInfoSchema),
});
export type DecisionKnowledge = z.infer<typeof DecisionKnowledgeSchema>;

// ============================================================
// Lebesgue Meta CPM benchmark (external third-party dataset)
// ============================================================

export const LebesgueCpmSchema = z.object({
  _schema_version: z.string(),
  _source_name: z.string(),
  _source_url: z.string(),
  _period: z.string(),
  _fetched_at: z.string(),
  _confidence: ConfidenceEnum,
  _notes: z.string().optional(),
  channel: z.string(),
  metric: z.string(),
  by_country: z.record(z.string(), z.number()),
}).passthrough();
export type LebesgueCpm = z.infer<typeof LebesgueCpmSchema>;

// ============================================================
// Brand-fit raw metrics — 选国决策表 派生 (DTC% / Direct&Brand /
// Luxury / TikTok Shop / AOV)，喂给运行时品牌化适配评分模型。
// ============================================================

export const BrandFitEntrySchema = z.object({
  dtc_pct: z.number().nullable().optional(),
  direct_brand_search_pct: z.number().nullable().optional(),
  luxury_size_usd_b: z.number().nullable().optional(),
  luxury_share_pct: z.number().nullable().optional(),
  aov_usd: z.number().nullable().optional(),
  /** TikTok Shop 上线状态 one-hot：1=已上线，0=未上线（全覆盖）。 */
  tiktok_shop: z.union([z.literal(0), z.literal(1)]),
  // ---- 选国决策表的人工品牌化适配评级与理由（缺失=决策表未覆盖） ----
  /** 品牌化适配度评级 1-5（决策表人工评定）。 */
  adaptation_rating: z.number().nullable().optional(),
  /** 资源分层：P0 主战场 / P1 扩展 / P2 测试 / 谨慎 / 特殊策略 / 暂缓 等。 */
  tier: z.string().optional(),
  /** 推荐打法（决策表）。 */
  play: z.string().optional(),
  /** 一句话核心理由（决策表）。 */
  reason: z.string().optional(),
});
export type BrandFitEntry = z.infer<typeof BrandFitEntrySchema>;

export const BrandFitSchema = z.object({
  _schema_version: z.string(),
  _source_name: z.string(),
  _source_file: z.string().optional(),
  _period: z.string().optional(),
  _fetched_at: z.string(),
  _confidence: ConfidenceEnum,
  _notes: z.string().optional(),
  by_country: z.record(z.string(), BrandFitEntrySchema),
}).passthrough();
export type BrandFit = z.infer<typeof BrandFitSchema>;

// ============================================================
// Category catalog — team alignment / scan-and-learn page
// ============================================================

export const CatalogSubgroupSchema = z.object({
  name: z.string(),
  products: z.array(z.string()),
});

export const CatalogCategorySchema = z.object({
  id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  icon: z.string().optional(),
  /** Maps to the 12 Hachimi country-data categories (apparel/beauty/electronics/...) when applicable. */
  hachimi_category: z.string().nullable().optional(),
  blurb: z.string().optional(),
  subgroups: z.array(CatalogSubgroupSchema),
});

export const CategoryCatalogSchema = z.object({
  _schema_version: z.string(),
  _last_updated: z.string(),
  _notes: z.string().optional(),
  categories: z.array(CatalogCategorySchema),
});
export type CategoryCatalog = z.infer<typeof CategoryCatalogSchema>;
export type CatalogCategory = z.infer<typeof CatalogCategorySchema>;

// ============================================================
// ROI calculator benchmarks
// ============================================================

const TripleSchema = z.object({
  low: z.number(),
  median: z.number(),
  high: z.number(),
});

export const RoiModeIdEnum = z.enum(["meta_to_dtc", "tiktok_to_dtc", "tiktok_to_shop"]);

export const RoiModeSchema = z.object({
  id: RoiModeIdEnum,
  name_zh: z.string(),
  name_en: z.string(),
  kind: z.enum(["dtc", "shop"]),
});

export const RoiRegionSchema = z.object({
  id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  countries: z.array(z.string()),
  default_vat_pct: z.number(),
  default_cpm: z.record(z.string(), z.number()),
  cvr_multiplier: z.number(),
  ctr_multiplier: z.number(),
  notes: z.string().optional(),
});

export const RoiCategorySchema = z.object({
  id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  default_rr_pct: z.number(),
  confidence: z.string().optional(),
  cvr: z.record(z.string(), TripleSchema),
  ctr: z.record(z.string(), TripleSchema),
});

export const RoiBenchmarksSchema = z.object({
  _schema_version: z.string(),
  _last_updated: z.string(),
  _source_name: z.string(),
  _source_url: z.string(),
  _notes: z.string().optional(),
  modes: z.array(RoiModeSchema),
  regions: z.array(RoiRegionSchema),
  categories: z.array(RoiCategorySchema),
  platform_defaults: z.record(
    z.string(),
    z.object({
      platform_fee_pct: z.number(),
      platform_fee_label: z.string(),
      affiliate_pct: z.number(),
      stripe_fee_usd: z.number(),
    }),
  ),
  health_thresholds: z.object({
    roi_marginal: z.object({ excellent: z.number(), healthy: z.number(), warning: z.number() }),
    net_profit_margin: z.object({ excellent: z.number(), healthy: z.number(), warning: z.number() }),
    roas: z.object({ excellent: z.number(), healthy: z.number(), warning: z.number() }),
    gross_margin: z.object({ excellent: z.number(), healthy: z.number(), warning: z.number() }),
    contribution_margin: z.object({ excellent: z.number(), healthy: z.number(), warning: z.number() }),
  }),
});
export type RoiBenchmarks = z.infer<typeof RoiBenchmarksSchema>;
export type RoiMode = z.infer<typeof RoiModeSchema>;
export type RoiRegion = z.infer<typeof RoiRegionSchema>;
export type RoiCategory = z.infer<typeof RoiCategorySchema>;
export type RoiModeId = z.infer<typeof RoiModeIdEnum>;
