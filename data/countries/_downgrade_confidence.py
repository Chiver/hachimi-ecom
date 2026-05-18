"""
诚实降级 31 国 JSON 的 confidence + 加 _data_quality_warning。
明确标识哪些字段是 Hachimi 估算（confidence=L），哪些是真实数据源（H/M）。
"""
import json
import glob
from pathlib import Path

TODAY = "2026-05-17"

# 31 国 JSON 中以下字段是 Hachimi 估算（不是 Statista PDF 直接提取）
POLLUTED_FIELDS = {
    "ecommerce_market[0].gmv_total_usd_million": "L",
    "ecommerce_market[0].online_buyers_million": "L",
    "ecommerce_market[0].mobile_share_pct": "L",
    "platforms[].metrics_2024.gmv_usd_million": "L",
    "platforms[].metrics_2024.market_share_pct": "L",
    "platforms[].metrics_2024.commission_rate_pct": "L",
    "platforms[].metrics_2024.chinese_seller_share_pct": "L",
    "category_metrics[].gmv_usd_million": "L",
    "payments[].share_pct": "L",
    "traffic_economics[].cpm_usd": "L",
    "traffic_economics[].cpc_usd": "L",
    "china_seller_density[].top100_china_count": "L",
}

# 真实数据源字段（继续保持 H）
TRUSTED_FIELDS = [
    "macro_indicators[0].population",
    "macro_indicators[0].gdp_usd_billion",
    "macro_indicators[0].gdp_per_capita_usd",
    "macro_indicators[0].inflation_rate_pct",
    "macro_indicators[0].internet_penetration_pct",
    "ecommerce_market[0].cagr_2025_2030_pct",  # 22 国 H, 13 国 L (已标记)
    "ecommerce_market[0].cross_border_share_pct",
    "ecommerce_market[0].domestic_share_pct",
]

countries_dir = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom/data/countries")

for f in sorted(countries_dir.glob("*.json")):
    if f.stem.startswith("_") or f.stem == "poland":
        continue  # 跳过波兰（已人工核实）和工具脚本
    d = json.load(open(f))

    # 加顶层 data quality warning
    d["_data_quality_warning"] = {
        "status": "PARTIAL_RECONSTRUCTION_NEEDED",
        "warning": "本国数据由 Cowork Phase 2-3 批量生成器产出，部分字段（GMV、平台市占、品类细分、支付占比、CPM/CPC、中国卖家密度）为 Hachimi 估算，confidence=L。决策前建议人工核对 Statista 原文。",
        "trusted_fields": TRUSTED_FIELDS,
        "polluted_fields": list(POLLUTED_FIELDS.keys()),
        "raw_pdf_extract_path": f"data/raw/statista_extracted/{f.stem}.json",
        "remediation_plan": "Phase 2.5 - 人工逐国校对 Statista PDF（约 30-60 分钟/国）",
        "audited_at": TODAY,
    }

    # 降级 ecommerce_market GMV/buyers/mobile_share confidence
    if d.get("ecommerce_market") and len(d["ecommerce_market"]) > 0:
        em = d["ecommerce_market"][0]
        em.setdefault("source_metadata", {})
        for fld in ["gmv_total_usd_million", "online_buyers_million", "mobile_share_pct"]:
            if em.get(fld) is not None:
                em["source_metadata"][fld] = {
                    "source_name": "Hachimi 领域知识估算（未直接从 Statista PDF 提取）",
                    "source_url": f"data/raw/statista_extracted/{f.stem}.json",
                    "fetched_at": TODAY,
                    "confidence": "L",
                    "warning": "待人工校对 Statista 原文精确化",
                }

    # 降级 platforms confidence
    for p in d.get("platforms", []):
        m = p.get("metrics_2024", {})
        m.setdefault("source_metadata", {})
        for fld in ["gmv_usd_million", "market_share_pct", "commission_rate_pct", "chinese_seller_share_pct"]:
            if m.get(fld) is not None:
                m["source_metadata"][fld] = {
                    "source_name": "Hachimi 估算（基于 Statista 摘要 + 公开市占数据）",
                    "fetched_at": TODAY,
                    "confidence": "L",
                    "warning": "精确数字待 Marketplace Pulse / SimilarWeb 验证",
                }

    # 降级 category_metrics
    for cat in d.get("category_metrics", []):
        cat.setdefault("source_metadata", {})
        if cat.get("gmv_usd_million") is not None:
            cat["source_metadata"]["gmv_usd_million"] = {
                "source_name": "Hachimi 估算（未从 Statista PDF 提取真实品类细分）",
                "source_url": f"data/raw/statista_extracted/{f.stem}.json (待人工解析)",
                "fetched_at": TODAY,
                "confidence": "L",
                "warning": "Statista PDF 通常给品类 % 而非 USD，需结合 total GMV 计算；当前数字仅供量级参考",
            }

    # 降级 payments
    for pm in d.get("payments", []):
        if pm.get("share_pct") is not None:
            pm["confidence"] = "L"
            pm["warning"] = "Hachimi 估算，精确占比待 Statista 支付章节人工解析"

    # 降级 traffic
    for tr in d.get("traffic_economics", []):
        if tr.get("cpm_usd") or tr.get("cpc_usd"):
            tr["warning"] = "Hachimi 基于行业 benchmark 估算（Revealbot/WordStream），实际值因品类/季节波动 ±30%"

    # 降级 china_seller_density
    for cs in d.get("china_seller_density", []):
        if "confidence" not in cs:
            cs["confidence"] = "L"
        cs["warning"] = "Hachimi 估算，精确数字待 Apify 抓取 Top 卖家 storefront 国别"

    # 重写 file
    f.write_text(json.dumps(d, indent=2, ensure_ascii=False))

print("✅ 31 国 JSON 已加 _data_quality_warning + confidence 降级")
print("⚠️  波兰未动（已人工核实）")
print("\n下次精确化时按这个优先级：")
print("  P0: ecommerce_market.gmv_total_usd_million（决策核心）")
print("  P1: category_metrics 真实 %（品类选择核心）")
print("  P2: platforms.market_share_pct（平台选择）")
print("  P3: payments.share_pct（支付接入）")
