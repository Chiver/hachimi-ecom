/**
 * Hachimi 全球电商调研 — Drizzle Schema v1.0
 *
 * 使用方式：
 *   pnpm add drizzle-orm postgres
 *   pnpm add -D drizzle-kit
 *   pnpm drizzle-kit generate
 *
 * Frozen at: 2026-05-17
 */

import {
  pgTable,
  varchar,
  text,
  integer,
  bigint,
  numeric,
  boolean,
  date,
  timestamp,
  jsonb,
  pgEnum,
  primaryKey,
  index,
  bigserial,
  char,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const regionEnum = pgEnum("region", [
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

export const categoryEnum = pgEnum("category_code", [
  "apparel",
  "beauty",
  "home",
  "electronics",
  "baby",
  "pet",
  "outdoor",
  "auto",
  "health",
  "toys",
  "kitchen",
  "garden",
]);

export const platformTypeEnum = pgEnum("platform_type", [
  "marketplace",
  "dtc_aggregator",
  "social_commerce",
  "vertical_specialist",
]);

export const tradeDirectionEnum = pgEnum("trade_direction", ["export", "import"]);

export const complianceRuleTypeEnum = pgEnum("compliance_rule_type", [
  "de_minimis",
  "vat_threshold",
  "marketplace_facilitator",
  "data_privacy",
  "product_cert",
  "ip_enforcement",
  "labeling",
]);

export const policyEventTypeEnum = pgEnum("policy_event_type", [
  "tariff",
  "vat_change",
  "de_minimis_change",
  "cert_requirement",
  "data_law",
  "sanctions",
]);

export const severityEnum = pgEnum("severity", [
  "critical",
  "high",
  "medium",
  "low",
  "blocking",
]);

export const trafficChannelEnum = pgEnum("traffic_channel", [
  "meta",
  "google_search",
  "google_display",
  "tiktok",
  "amazon_ppc",
]);

export const competitionIntensityEnum = pgEnum("competition_intensity", [
  "low",
  "medium",
  "high",
  "extreme",
]);

export const trendEnum = pgEnum("trend", ["rising", "stable", "declining"]);

export const entryModeEnum = pgEnum("entry_mode", [
  "direct_dropship",
  "fba_only",
  "overseas_warehouse",
  "local_entity",
  "skip",
]);

export const confidenceEnum = pgEnum("confidence", ["H", "M", "L"]);

export const sourceTypeEnum = pgEnum("source_type", [
  "gov_api",
  "paid_report",
  "company_filing",
  "scrape",
  "community",
  "ngo_report",
]);

export const glossaryCategoryEnum = pgEnum("glossary_category", [
  "regulation",
  "tax",
  "logistics",
  "payment",
  "platform_ops",
  "ecom_metric",
]);

export const sanctionsStatusEnum = pgEnum("sanctions_status", [
  "none",
  "comprehensive",
  "sectoral",
]);

// ============================================================
// 1. countries — 国家主表
// ============================================================

export const countries = pgTable("countries", {
  isoAlpha3: varchar("iso_alpha3", { length: 3 }).primaryKey(),
  isoAlpha2: varchar("iso_alpha2", { length: 2 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameZh: varchar("name_zh", { length: 100 }).notNull(),
  region: regionEnum("region").notNull(),
  subRegion: varchar("sub_region", { length: 50 }),
  currencyCode: varchar("currency_code", { length: 3 }).notNull(),
  officialLanguage: varchar("official_language", { length: 50 }).notNull(),
  flagEmoji: varchar("flag_emoji", { length: 8 }),
  isEu: boolean("is_eu").notNull().default(false),
  sanctionsStatus: sanctionsStatusEnum("sanctions_status").default("none"),
  notes: text("notes"),
});

// ============================================================
// 2. macro_indicators
// ============================================================

export const macroIndicators = pgTable(
  "macro_indicators",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    year: integer("year").notNull(),
    population: bigint("population", { mode: "number" }),
    gdpUsdBillion: numeric("gdp_usd_billion", { precision: 12, scale: 2 }),
    gdpPerCapitaUsd: numeric("gdp_per_capita_usd", { precision: 12, scale: 2 }),
    disposableIncomeUsd: numeric("disposable_income_usd", { precision: 12, scale: 2 }),
    inflationRatePct: numeric("inflation_rate_pct", { precision: 6, scale: 2 }),
    fxVolatilityPct: numeric("fx_volatility_pct", { precision: 6, scale: 2 }),
    internetPenetrationPct: numeric("internet_penetration_pct", { precision: 5, scale: 2 }),
    smartphonePenetrationPct: numeric("smartphone_penetration_pct", { precision: 5, scale: 2 }),
    mobileInternetUsersMillion: numeric("mobile_internet_users_million", { precision: 10, scale: 2 }),
    urbanPopulationPct: numeric("urban_population_pct", { precision: 5, scale: 2 }),
    medianAge: numeric("median_age", { precision: 4, scale: 1 }),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.year] }) }),
);

// ============================================================
// 3. trade_flows
// ============================================================

export const tradeFlows = pgTable(
  "trade_flows",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    partnerCode: varchar("partner_code", { length: 3 }),
    direction: tradeDirectionEnum("direction").notNull(),
    hsCode: varchar("hs_code", { length: 6 }),
    categoryCode: categoryEnum("category_code"),
    valueUsdMillion: numeric("value_usd_million", { precision: 14, scale: 2 }),
    year: integer("year").notNull(),
    sourceUrl: text("source_url"),
    confidence: confidenceEnum("confidence"),
  },
  (t) => ({
    countryYearIdx: index("trade_country_year_idx").on(t.countryCode, t.year),
    hsIdx: index("trade_hs_idx").on(t.hsCode),
  }),
);

// ============================================================
// 4. ecommerce_market
// ============================================================

export const ecommerceMarket = pgTable(
  "ecommerce_market",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    year: integer("year").notNull(),
    gmvTotalUsdMillion: numeric("gmv_total_usd_million", { precision: 14, scale: 2 }),
    gmvYoyPct: numeric("gmv_yoy_pct", { precision: 6, scale: 2 }),
    cagr20252030Pct: numeric("cagr_2025_2030_pct", { precision: 6, scale: 2 }),
    ecomShareOfRetailPct: numeric("ecom_share_of_retail_pct", { precision: 5, scale: 2 }),
    perCapitaSpendUsd: numeric("per_capita_spend_usd", { precision: 10, scale: 2 }),
    onlineBuyersMillion: numeric("online_buyers_million", { precision: 10, scale: 2 }),
    onlineBuyerPenetrationPct: numeric("online_buyer_penetration_pct", { precision: 5, scale: 2 }),
    mobileSharePct: numeric("mobile_share_pct", { precision: 5, scale: 2 }),
    socialCommerceGmvUsdMillion: numeric("social_commerce_gmv_usd_million", { precision: 12, scale: 2 }),
    crossBorderSharePct: numeric("cross_border_share_pct", { precision: 5, scale: 2 }),
    domesticSharePct: numeric("domestic_share_pct", { precision: 5, scale: 2 }),
    topCrossBorderOriginCountries: jsonb("top_cross_border_origin_countries"),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.year] }) }),
);

// ============================================================
// 5. platforms
// ============================================================

export const platforms = pgTable("platforms", {
  platformCode: varchar("platform_code", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  parentCompany: varchar("parent_company", { length: 100 }),
  platformType: platformTypeEnum("platform_type").notNull(),
  coverageCountries: jsonb("coverage_countries"),
  website: varchar("website", { length: 200 }),
  foundedYear: integer("founded_year"),
});

// ============================================================
// 6. platform_metrics
// ============================================================

export const platformMetrics = pgTable(
  "platform_metrics",
  {
    platformCode: varchar("platform_code", { length: 50 })
      .notNull()
      .references(() => platforms.platformCode),
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    year: integer("year").notNull(),
    gmvUsdMillion: numeric("gmv_usd_million", { precision: 14, scale: 2 }),
    trafficMonthlyMillion: numeric("traffic_monthly_million", { precision: 10, scale: 2 }),
    marketSharePct: numeric("market_share_pct", { precision: 5, scale: 2 }),
    commissionRatePct: numeric("commission_rate_pct", { precision: 5, scale: 2 }),
    fulfillmentFeeModel: text("fulfillment_fee_model"),
    chineseSellerSharePct: numeric("chinese_seller_share_pct", { precision: 5, scale: 2 }),
    rankInCountry: integer("rank_in_country"),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.platformCode, t.countryCode, t.year] }) }),
);

// ============================================================
// 7. category_metrics
// ============================================================

export const categoryMetrics = pgTable(
  "category_metrics",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    categoryCode: categoryEnum("category_code").notNull(),
    year: integer("year").notNull(),
    gmvUsdMillion: numeric("gmv_usd_million", { precision: 14, scale: 2 }),
    yoyGrowthPct: numeric("yoy_growth_pct", { precision: 6, scale: 2 }),
    forecast2030UsdMillion: numeric("forecast_2030_usd_million", { precision: 14, scale: 2 }),
    typicalGrossMarginPct: numeric("typical_gross_margin_pct", { precision: 5, scale: 2 }),
    typicalReturnRatePct: numeric("typical_return_rate_pct", { precision: 5, scale: 2 }),
    regulatoryComplexity: competitionIntensityEnum("regulatory_complexity"),
    chineseSupplyAdvantage: competitionIntensityEnum("chinese_supply_advantage"),
    notes: text("notes"),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.categoryCode, t.year] }) }),
);

// ============================================================
// 8. top_skus
// ============================================================

export const topSkus = pgTable(
  "top_skus",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    categoryCode: categoryEnum("category_code").notNull(),
    platformCode: varchar("platform_code", { length: 50 })
      .notNull()
      .references(() => platforms.platformCode),
    rank: integer("rank").notNull(),
    skuTitle: text("sku_title"),
    skuImageUrl: text("sku_image_url"),
    asinOrId: varchar("asin_or_id", { length: 50 }),
    priceUsd: numeric("price_usd", { precision: 10, scale: 2 }),
    estimatedMonthlySales: integer("estimated_monthly_sales"),
    sellerName: varchar("seller_name", { length: 200 }),
    sellerCountry: varchar("seller_country", { length: 3 }),
    fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
    sourceUrl: text("source_url"),
  },
  (t) => ({
    countryCatPlatformIdx: index("topsku_ccp_idx").on(t.countryCode, t.categoryCode, t.platformCode),
  }),
);

// ============================================================
// 9. payments
// ============================================================

export const payments = pgTable(
  "payments",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    paymentMethod: varchar("payment_method", { length: 100 }).notNull(),
    sharePct: numeric("share_pct", { precision: 5, scale: 2 }),
    year: integer("year").notNull(),
    forecast2030Pct: numeric("forecast_2030_pct", { precision: 5, scale: 2 }),
    isLocalUnique: boolean("is_local_unique").default(false),
    operator: varchar("operator", { length: 100 }),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({
    countryIdx: index("payments_country_idx").on(t.countryCode, t.year),
  }),
);

// ============================================================
// 10. logistics
// ============================================================

export const logistics = pgTable(
  "logistics",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    year: integer("year").notNull(),
    lpiScore: numeric("lpi_score", { precision: 3, scale: 2 }),
    lpiGlobalRank: integer("lpi_global_rank"),
    avgLastMileDays: numeric("avg_last_mile_days", { precision: 4, scale: 1 }),
    avgLastMileCostUsd: numeric("avg_last_mile_cost_usd", { precision: 6, scale: 2 }),
    parcelVolumeMillion: numeric("parcel_volume_million", { precision: 10, scale: 2 }),
    topCarriers: jsonb("top_carriers"),
    amazonFbaAvailable: boolean("amazon_fba_available"),
    typicalOverseasWarehouseProviders: jsonb("typical_overseas_warehouse_providers"),
    returnRatePct: numeric("return_rate_pct", { precision: 5, scale: 2 }),
    sourceMetadata: jsonb("source_metadata"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.year] }) }),
);

// ============================================================
// 11. compliance
// ============================================================

export const compliance = pgTable("compliance", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  countryCode: varchar("country_code", { length: 3 })
    .notNull()
    .references(() => countries.isoAlpha3),
  ruleType: complianceRuleTypeEnum("rule_type").notNull(),
  ruleName: varchar("rule_name", { length: 200 }).notNull(),
  description: text("description"),
  appliesToCategories: jsonb("applies_to_categories"),
  effectiveDate: date("effective_date"),
  thresholdValue: text("threshold_value"),
  severity: severityEnum("severity"),
  sourceUrl: text("source_url"),
});

// ============================================================
// 12. policy_events
// ============================================================

export const policyEvents = pgTable("policy_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  eventDate: date("event_date").notNull(),
  countriesAffected: jsonb("countries_affected"),
  categoriesAffected: jsonb("categories_affected"),
  eventType: policyEventTypeEnum("event_type").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  sourceUrl: text("source_url"),
  severity: severityEnum("severity"),
});

// ============================================================
// 13. traffic_economics
// ============================================================

export const trafficEconomics = pgTable(
  "traffic_economics",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    channel: trafficChannelEnum("channel").notNull(),
    cpmUsd: numeric("cpm_usd", { precision: 8, scale: 2 }),
    cpcUsd: numeric("cpc_usd", { precision: 8, scale: 2 }),
    typicalConversionRatePct: numeric("typical_conversion_rate_pct", { precision: 5, scale: 2 }),
    year: integer("year").notNull(),
    sourceUrl: text("source_url"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.channel, t.year] }) }),
);

// ============================================================
// 14. china_seller_density
// ============================================================

export const chinaSellerDensity = pgTable(
  "china_seller_density",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    platformCode: varchar("platform_code", { length: 50 })
      .notNull()
      .references(() => platforms.platformCode),
    year: integer("year").notNull(),
    top100ChinaCount: integer("top100_china_count"),
    top1000ChinaCount: integer("top1000_china_count"),
    trendYoy: trendEnum("trend_yoy"),
    notableChineseSellers: jsonb("notable_chinese_sellers"),
    chinesePlCompetitionIntensity: competitionIntensityEnum("chinese_pl_competition_intensity"),
    notes: text("notes"),
    sourceUrl: text("source_url"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.platformCode, t.year] }) }),
);

// ============================================================
// 15. hachimi_scores
// ============================================================

export const hachimiScores = pgTable(
  "hachimi_scores",
  {
    countryCode: varchar("country_code", { length: 3 })
      .notNull()
      .references(() => countries.isoAlpha3),
    version: varchar("version", { length: 20 }).notNull(),
    marketAttractiveness: numeric("market_attractiveness", { precision: 5, scale: 2 }),
    operationalFeasibility: numeric("operational_feasibility", { precision: 5, scale: 2 }),
    competitionIntensity: numeric("competition_intensity", { precision: 5, scale: 2 }),
    aiLeveragePotential: numeric("ai_leverage_potential", { precision: 5, scale: 2 }),
    compositeScore: numeric("composite_score", { precision: 5, scale: 2 }),
    recommendedEntryMode: entryModeEnum("recommended_entry_mode"),
    recommendedCategories: jsonb("recommended_categories"),
    methodologyUrl: text("methodology_url"),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
    isDerived: boolean("is_derived").notNull().default(true),
  },
  (t) => ({ pk: primaryKey({ columns: [t.countryCode, t.version] }) }),
);

// ============================================================
// 16. glossary
// ============================================================

export const glossary = pgTable("glossary", {
  term: varchar("term", { length: 100 }).primaryKey(),
  termFull: varchar("term_full", { length: 300 }),
  termZh: varchar("term_zh", { length: 200 }),
  category: glossaryCategoryEnum("category").notNull(),
  shortDef: text("short_def").notNull(),
  fullDef: text("full_def"),
  appliesToCountries: jsonb("applies_to_countries"),
  appliesToCategories: jsonb("applies_to_categories"),
  exampleCase: text("example_case"),
  sellerImpact: text("seller_impact"),
  referenceUrls: jsonb("reference_urls"),
});

// ============================================================
// 17. data_sources
// ============================================================

export const dataSources = pgTable("data_sources", {
  sourceId: varchar("source_id", { length: 100 }).primaryKey(),
  sourceName: varchar("source_name", { length: 300 }).notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  sourceUrl: text("source_url"),
  publisher: varchar("publisher", { length: 100 }),
  confidenceDefault: confidenceEnum("confidence_default"),
  localFilePath: text("local_file_path"),
  lastFetchedAt: timestamp("last_fetched_at"),
});

// ============================================================
// Exports
// ============================================================

export const allTables = {
  countries,
  macroIndicators,
  tradeFlows,
  ecommerceMarket,
  platforms,
  platformMetrics,
  categoryMetrics,
  topSkus,
  payments,
  logistics,
  compliance,
  policyEvents,
  trafficEconomics,
  chinaSellerDensity,
  hachimiScores,
  glossary,
  dataSources,
};
