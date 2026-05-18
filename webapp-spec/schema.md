# Hachimi 全球电商调研 — 数据 Schema v1.0

> **版本**: 1.0
> **最后更新**: 2026-05-17
> **状态**: Frozen (Phase 1 末确认；任何变更需写入 schema-changelog.md)

---

## 设计原则

1. **每个数据点（DataPoint）必须可追溯**：含 `source_url`、`source_name`、`fetched_at`、`confidence`
2. **国家 + 品类双索引**：所有指标按 `(country_code, category_code?)` 维度组织
3. **时间序列友好**：所有数值字段含 `year` 或 `period`，支持未来动态展示
4. **AI 衍生字段单独标记**：综合评分、P&L 等 Hachimi 自建模型字段标 `is_derived = true`
5. **冲突容忍**：同一字段可有多个数据源，UI 显示主源，hover 可见所有源

---

## 顶层实体（13 张主表）

```
countries (国家主表)
├── macro_indicators       (宏观经济，按 country + year)
├── trade_flows            (进出口贸易，按 country_a + country_b + hs_code + year)
├── ecommerce_market       (电商市场体量，按 country + year)
├── platforms              (电商平台主表)
├── platform_metrics       (平台数据，按 platform + country + year)
├── category_metrics       (品类数据，按 country + category + year)
├── top_skus               (Top SKU 列表，按 country + category + platform)
├── payments               (支付方式，按 country + payment_method + year)
├── logistics              (物流指标，按 country + year)
├── compliance             (合规与认证，按 country + rule_type)
├── policy_events          (政策时间轴，按 event_date)
├── traffic_economics      (流量经济 CPM/CPC，按 country + channel)
├── china_seller_density   (中国卖家密度，按 country + platform)
└── hachimi_scores         (综合评分，按 country)
```

---

## 1. countries — 国家主表

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| iso_alpha3 | varchar(3) PK | ✅ | "POL", "USA", "BRA" |
| iso_alpha2 | varchar(2) | ✅ | "PL", "US", "BR" |
| name_en | varchar(100) | ✅ | "Poland" |
| name_zh | varchar(100) | ✅ | "波兰" |
| region | varchar(50) | ✅ | "Eastern Europe & CIS" 等 9 大区之一 |
| sub_region | varchar(50) | | "Visegrad", "Andean" 等可选 |
| currency_code | varchar(3) | ✅ | "PLN" ISO 4217 |
| official_language | varchar(50) | ✅ | "Polish" |
| flag_emoji | varchar(8) | | "🇵🇱" |
| is_eu | boolean | ✅ | 影响合规规则 |
| sanctions_status | varchar(50) | | "none" / "comprehensive" / "sectoral"，用于俄罗斯等 |
| notes | text | | 特殊说明 |

**枚举 region**：North America、Western Europe、Northern Europe、Eastern Europe & CIS、Southeast Asia、South Asia、East Asia & Oceania、Latin America、MENA & Africa

---

## 2. macro_indicators — 宏观经济

| 字段 | 类型 | 单位 | 主要来源 |
|---|---|---|---|
| country_code | FK | | |
| year | int | | 2020-2030 |
| population | bigint | 人 | World Bank API |
| gdp_usd_billion | numeric | 亿 USD | World Bank API |
| gdp_per_capita_usd | numeric | USD | World Bank API |
| disposable_income_usd | numeric | USD/年 | OECD / 各国统计局 |
| inflation_rate_pct | numeric | % | IMF WEO |
| fx_volatility_pct | numeric | % | exchangerate.host 年波动率 |
| internet_penetration_pct | numeric | % | ITU |
| smartphone_penetration_pct | numeric | % | GSMA / DataReportal |
| mobile_internet_users_million | numeric | 百万 | DataReportal |
| urban_population_pct | numeric | % | World Bank |
| median_age | numeric | 岁 | UN World Population |
| source_metadata | jsonb | | 见 §15 |

**Source metadata 字段约定（所有数值字段统一格式）**：
```json
{
  "population": {"source_url": "...", "source_name": "World Bank Open Data", "fetched_at": "2026-05-17", "confidence": "H"},
  "gdp_usd_billion": {...}
}
```

---

## 3. trade_flows — 进出口贸易

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigserial PK | |
| country_code | FK | 报告国 |
| partner_code | FK | 贸易伙伴；NULL 表示与全球 |
| direction | enum | "export" / "import" |
| hs_code | varchar(6) | HS 2 或 6 位编码 |
| category_code | FK nullable | 我们 12 大类映射，可空 |
| value_usd_million | numeric | |
| year | int | |
| source_url | text | |
| confidence | char(1) | |

**核心查询场景**：
- 中国对各国出口 Top 品类（country=CHN, direction=export, group by partner）
- 各国跨境电商相关 HS 编码总值（特殊筛选 HS 编码白名单）

---

## 4. ecommerce_market — 电商市场体量

| 字段 | 类型 | 单位 | 主要来源 |
|---|---|---|---|
| country_code | FK | | |
| year | int | | |
| gmv_total_usd_million | numeric | 百万 USD | Statista |
| gmv_yoy_pct | numeric | % | |
| cagr_2025_2030_pct | numeric | % | Statista CAGR 报告 |
| ecom_share_of_retail_pct | numeric | % | Statista |
| per_capita_spend_usd | numeric | USD | |
| online_buyers_million | numeric | 百万人 | |
| online_buyer_penetration_pct | numeric | % | |
| mobile_share_pct | numeric | % | 移动 vs 桌面 |
| social_commerce_gmv_usd_million | numeric | 百万 USD | |
| cross_border_share_pct | numeric | % | Statista cross-border |
| domestic_share_pct | numeric | % | |
| top_cross_border_origin_countries | jsonb | 数组 | ["China", "USA", "Germany"] |
| source_metadata | jsonb | | |

---

## 5. platforms — 电商平台主表

| 字段 | 类型 | 说明 |
|---|---|---|
| platform_code | varchar PK | "amazon_us", "allegro", "shopee_id" |
| name | varchar | "Amazon US", "Allegro" |
| parent_company | varchar | "Amazon", "Sea Group" |
| platform_type | enum | "marketplace" / "dtc_aggregator" / "social_commerce" / "vertical_specialist" |
| coverage_countries | varchar[] | 经营国家 ISO 数组 |
| website | varchar | |
| founded_year | int | |

---

## 6. platform_metrics — 平台数据

| 字段 | 类型 | 单位 |
|---|---|---|
| platform_code | FK | |
| country_code | FK | |
| year | int | |
| gmv_usd_million | numeric | |
| traffic_monthly_million | numeric | 月访 |
| market_share_pct | numeric | 在该国电商总 GMV 占比 |
| commission_rate_pct | numeric | 抽佣 |
| fulfillment_fee_model | text | "FBA-like / 自提为主" 描述 |
| chinese_seller_share_pct | numeric | Top 1000 卖家中中国卖家占比 |
| rank_in_country | int | 在该国电商平台排名 |
| source_metadata | jsonb | |

---

## 7. category_metrics — 品类指标

**12 大类枚举（`category_code`）**：
- `apparel` 服装鞋帽
- `beauty` 美妆个护
- `home` 家居家具
- `electronics` 3C 电子
- `baby` 母婴用品
- `pet` 宠物用品
- `outdoor` 户外运动
- `auto` 汽配
- `health` 健康保健
- `toys` 玩具
- `kitchen` 厨房用品
- `garden` 园艺工具

| 字段 | 类型 | 单位 |
|---|---|---|
| country_code | FK | |
| category_code | FK | |
| year | int | |
| gmv_usd_million | numeric | |
| yoy_growth_pct | numeric | % |
| forecast_2030_usd_million | numeric | 5 年预测 |
| typical_gross_margin_pct | numeric | 行业基准 |
| typical_return_rate_pct | numeric | 行业基准 |
| regulatory_complexity | enum | "low" / "medium" / "high" |
| chinese_supply_advantage | enum | "low" / "medium" / "high" |
| notes | text | |
| source_metadata | jsonb | |

---

## 8. top_skus — Top SKU 表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigserial PK | |
| country_code | FK | |
| category_code | FK | |
| platform_code | FK | |
| rank | int | 1-100 |
| sku_title | text | |
| sku_image_url | text | |
| asin_or_id | varchar | |
| price_usd | numeric | |
| estimated_monthly_sales | int | 来自卖家精灵估算 |
| seller_name | varchar | |
| seller_country | varchar(3) | ISO，用于中国卖家密度统计 |
| fetched_at | timestamp | |
| source_url | text | |

---

## 9. payments — 支付方式

| 字段 | 类型 | 说明 |
|---|---|---|
| country_code | FK | |
| payment_method | varchar | "card", "BLIK", "PIX", "boleto", "wallet_OVO", "BNPL_klarna", "COD" |
| share_pct | numeric | 在该国电商支付占比 |
| year | int | |
| forecast_2030_pct | numeric | |
| is_local_unique | boolean | 是否本地独有（如 PIX、BLIK） |
| operator | varchar | "Mastercard", "Polski Standard", "Banco Central do Brasil" |
| source_metadata | jsonb | |

---

## 10. logistics — 物流

| 字段 | 类型 | 说明 |
|---|---|---|
| country_code | FK | |
| year | int | |
| lpi_score | numeric | World Bank Logistics Performance Index 0-5 |
| lpi_global_rank | int | |
| avg_last_mile_days | numeric | 平均最后一公里时效 |
| avg_last_mile_cost_usd | numeric | 平均成本 |
| parcel_volume_million | numeric | 年包裹量 |
| top_carriers | jsonb | ["InPost", "DHL", "DPD"] |
| amazon_fba_available | boolean | |
| typical_overseas_warehouse_providers | jsonb | |
| return_rate_pct | numeric | 平均退货率 |
| source_metadata | jsonb | |

---

## 11. compliance — 合规与认证

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigserial PK | |
| country_code | FK | |
| rule_type | enum | "de_minimis", "vat_threshold", "marketplace_facilitator", "data_privacy", "product_cert", "ip_enforcement", "labeling" |
| rule_name | varchar | "EU GPSR", "BIS India", "FCC USA" |
| description | text | |
| applies_to_categories | jsonb | 受影响品类数组，空表示全品类 |
| effective_date | date | |
| threshold_value | text | 例如 "USD 800 (US De Minimis)" |
| severity | enum | "blocking" / "high" / "medium" / "low" |
| source_url | text | |

---

## 12. policy_events — 政策时间轴

| 字段 | 类型 | 说明 |
|---|---|---|
| id | bigserial PK | |
| event_date | date | |
| countries_affected | varchar[] | ISO 数组 |
| categories_affected | varchar[] | 12 大类 |
| event_type | enum | "tariff", "vat_change", "de_minimis_change", "cert_requirement", "data_law", "sanctions" |
| title | varchar | |
| description | text | |
| source_url | text | |
| severity | enum | "critical" / "high" / "medium" / "low" |
| countdown_days | int | 计算字段：与今日距离 |

---

## 13. traffic_economics — 流量经济

| 字段 | 类型 | 说明 |
|---|---|---|
| country_code | FK | |
| channel | enum | "meta", "google_search", "google_display", "tiktok", "amazon_ppc" |
| cpm_usd | numeric | |
| cpc_usd | numeric | |
| typical_conversion_rate_pct | numeric | |
| year | int | |
| source_url | text | |

---

## 14. china_seller_density — 中国卖家密度（Hachimi 特色字段）

| 字段 | 类型 | 说明 |
|---|---|---|
| country_code | FK | |
| platform_code | FK | |
| year | int | |
| top100_china_count | int | Top 100 卖家中中国卖家数量 |
| top1000_china_count | int | Top 1000 中国卖家数量 |
| trend_yoy | enum | "rising" / "stable" / "declining" |
| notable_chinese_sellers | jsonb | ["Anker", "Aukey", "Vasagle"] |
| chinese_pl_competition_intensity | enum | "low" / "medium" / "high" / "extreme" |
| notes | text | |
| source_url | text | |

---

## 15. hachimi_scores — 综合评分（AI 衍生）

| 字段 | 类型 | 说明 |
|---|---|---|
| country_code | FK | |
| version | varchar | "v1.0" 等 |
| market_attractiveness | numeric | 0-100 |
| operational_feasibility | numeric | 0-100 |
| competition_intensity | numeric | 0-100（反向：越低越好） |
| ai_leverage_potential | numeric | 0-100 |
| composite_score | numeric | 0-100 加权 |
| recommended_entry_mode | enum | "direct_dropship" / "fba_only" / "overseas_warehouse" / "local_entity" / "skip" |
| recommended_categories | jsonb | 12 大类中推荐组合 |
| methodology_url | text | 解释链接 |
| computed_at | timestamp | |
| is_derived | boolean | 永远 true |

**权重默认（v1，可调）**：market_attractiveness × 0.4 + operational_feasibility × 0.3 + (100 - competition_intensity) × 0.15 + ai_leverage_potential × 0.15

---

## 16. glossary — 名词解释

| 字段 | 类型 | 说明 |
|---|---|---|
| term | varchar PK | "FCC" |
| term_full | varchar | "Federal Communications Commission" |
| term_zh | varchar | "美国联邦通信委员会" |
| category | enum | "regulation", "tax", "logistics", "payment", "platform_ops", "ecom_metric" |
| short_def | text | 50 字以内 |
| full_def | text | 完整解释 |
| applies_to_countries | varchar[] | ISO 数组 |
| applies_to_categories | varchar[] | 12 大类 |
| example_case | text | 真实案例 |
| seller_impact | text | 对中国跨境卖家影响 |
| reference_urls | jsonb | 官方链接列表 |

---

## 17. data_sources — 数据源注册表

| 字段 | 类型 | 说明 |
|---|---|---|
| source_id | varchar PK | "statista_pl_dossier" |
| source_name | varchar | "Statista - E-commerce in Poland 2025" |
| source_type | enum | "gov_api" / "paid_report" / "company_filing" / "scrape" / "community" / "ngo_report" |
| source_url | text | |
| publisher | varchar | "Statista", "World Bank", "Apify" |
| confidence_default | char(1) | H/M/L |
| local_file_path | text | data/raw/... 路径 |
| last_fetched_at | timestamp | |

---

## Confidence Level 约定

| 级别 | 含义 | UI 颜色 |
|---|---|---|
| **H** (High) | 政府/国际组织官方 / 上市公司年报 / Statista | 绿色 ✅ |
| **M** (Medium) | 付费工具（卖家精灵/SimilarWeb/Apify）/ 行业研报 | 黄色 ⚠️ |
| **L** (Low) | 爬虫推算 / 中文社区 / 跨源估算 / Hachimi AI 推算 | 灰色 ℹ️ |

---

## Webapp UI 与 Schema 的映射

| UI 模块 | 主要表 |
|---|---|
| 首页地图配色 | hachimi_scores.composite_score |
| 国家详情 - 概览 | macro_indicators + ecommerce_market |
| 国家详情 - 平台 | platforms + platform_metrics |
| 国家详情 - 品类 | category_metrics + top_skus |
| 国家详情 - 支付/物流 | payments + logistics |
| 国家详情 - 合规 | compliance + policy_events (filtered by country) |
| 国家详情 - AI 适配 | （hachimi_scores.ai_leverage_potential + 注释） |
| Glossary 悬浮 | glossary 表 |
| 数据源追溯弹窗 | data_sources 表 + 每条数据的 source_metadata |
| 政策时间轴 | policy_events |
| 国家对比 | 横向 select 多国，并排展示上述所有 |

---

## Schema 变更协议

1. v1 frozen 后，所有变更走 `webapp-spec/schema-changelog.md` 记录
2. 新增字段不算 breaking change（直接加，老数据 NULL）
3. 字段重命名、类型变更需出 migration 脚本
4. v2 前不引入新表
