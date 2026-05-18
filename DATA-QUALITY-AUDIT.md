# 数据质量审计 — 31 国污染清单

> **审计时间**: 2026-05-17
> **触发原因**: 用户发现巴西服装 $9B 与 Statista 真实数据 $5.2B 严重不符
> **结论**: 31 国 JSON 中大量字段是 Hachimi 估算而非数据源直接提取，需重做

---

## 🔴 严重污染（必修）

| 字段 | 31 国数据来源 | Poland 数据来源 | 影响 |
|---|---|---|---|
| `ecommerce_market[0].gmv_total_usd_million` | 我硬编码估算（如美国 1100B, 巴西 50B）| Statista PDF page=62 | 战略评分依赖 |
| `ecommerce_market[0].online_buyers_million` | 我硬编码估算 | Statista PDF | per_capita 计算依赖 |
| `ecommerce_market[0].mobile_share_pct` | 我硬编码估算 | Statista PDF | 移动 vs 桌面策略依赖 |
| `platforms[].metrics_2024.gmv_usd_million` | 我估算（从市占×估算总 GMV）| Statista p.7 ECDB 真实 | 平台选择依赖 |
| `platforms[].metrics_2024.market_share_pct` | 我估算 | Statista | 平台选择依赖 |
| `category_metrics[].gmv_usd_million` | **完全是我估算** | Statista p.44 真实 | 品类选择**核心**依赖 |
| `payments[].share_pct` | 我估算 | Statista p.45 真实 | 支付接入决策依赖 |

## 🟡 中度污染（应修但优先级低）

| 字段 | 来源 | 修复建议 |
|---|---|---|
| `compliance[]` | 我的领域知识（法规事实正确但无 URL）| 加官方政府站 URL |
| `policy_events[]` | 我的领域知识 | 加 USTR/EU 公报 URL |
| `traffic_economics[]` | 行业基准估算 | 加 Revealbot/WordStream URL |
| `china_seller_density[]` | 我估算 | 等 Apify 抓取后填真值 |
| `ai_adaptation_notes` | 我主观判断 | 标 `confidence: L` |
| `hachimi_scores` | 我建模 | 已标 is_derived + Phase 4 重做 |

## 🟢 未污染（可信）

| 字段 | 数据源 | 置信度 |
|---|---|---|
| `country.*` | ISO 标准 | H |
| `macro_indicators[0].*`（除 disposable_income） | World Bank API 真实 | H |
| `ecommerce_market[0].cagr_2025_2030_pct`（22 国）| Statista xlsx 真实 | H |
| `ecommerce_market[0].cross_border_share_pct` | Statista xlsx 真实 | H |
| `ecommerce_market[0].domestic_share_pct` | Statista xlsx 真实 | H |
| `ecommerce_market[0].per_capita_spend_usd` | Hachimi 计算（GMV/buyers）| M（但 GMV 不可信→实际是 L）|
| Poland 全部字段 | 我人工 PDF 提取 | H/M |
| Glossary 25 词 | 我专业知识 + 官方 URL | H |

---

## 修复执行计划

**Phase 2-fix A**：从 31 个 Statista PDF 重新提取真实数据，重新生成 JSON
**Phase 2-fix B**：所有数据点带 PDF 页码级别的 source_url（不只是文件名）
**Phase 2-fix C**：webapp UI 必须显示具体来源文件名 + 页码 + confidence

---

## 修复后期望

每个数据点的 source 应该长这样：

```json
{
  "source_name": "Statista E-commerce in Brazil 2025 Dossier - p.14 Online retail revenue share by category",
  "source_url": "data/raw/statista/study_id56090_e-commerce-in-brazil.pdf#page=14",
  "source_quote": "Fashion & accessories: 10.4% of total e-commerce revenues 2024",
  "fetched_at": "2026-05-17",
  "confidence": "H",
  "publisher": "Associação Brasileira de Comércio Eletrônico (via Statista)"
}
```

webapp 上点击数据，弹出框显示：
- 数据值：5,200 (USD M)
- 来源：Statista E-commerce in Brazil 2025 Dossier
- 引用页：page 14
- 原文：Fashion & accessories: 10.4% of total e-commerce revenues 2024
- 计算方式：$50B × 10.4% = $5.2B
- 抓取时间：2026-05-17
- 置信度：H 🟢
