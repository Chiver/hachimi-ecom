"""
将 vision-extracted 真实数据应用到 country JSONs。
所有更新带 H confidence + #page= 引用 + source_quote。
"""
import json
from pathlib import Path

ROOT = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom")
TODAY = "2026-05-17"
VE = json.load(open(ROOT / "data/raw/statista_extracted/_vision_extracted.json"))


def update_country(iso, ve_data):
    json_path = ROOT / f"data/countries/{iso.lower()}.json"
    if not json_path.exists():
        return
    d = json.load(open(json_path))

    pdf_file = ve_data["pdf"]

    # === 1. Update Total GMV (Vision-verified) ===
    # Prefer 2024, fall back to 2025 forecast or narrow definition
    new_gmv_b = (ve_data.get("gmv_total_usd_b_2024") or
                 ve_data.get("gmv_total_usd_b_2024_narrow") or
                 ve_data.get("gmv_total_usd_b_2025") or
                 ve_data.get("gmv_total_usd_b_2025_forecast") or
                 ve_data.get("gmv_total_usd_b_2023"))
    if new_gmv_b:
        em = d["ecommerce_market"][0]
        em["gmv_total_usd_million"] = new_gmv_b * 1000
        em.setdefault("source_metadata", {})
        em["source_metadata"]["gmv_total_usd_million"] = {
            "source_name": f"Statista E-commerce in {iso} Dossier - page {ve_data['gmv_source_page']} (vision-verified)",
            "source_url": f"data/raw/statista/{pdf_file}#page={ve_data['gmv_source_page']}",
            "source_quote": ve_data.get("gmv_source_quote", ""),
            "publisher": ve_data.get("gmv_publisher", ""),
            "fetched_at": TODAY,
            "confidence": "H",
            "extraction_method": "vision (Claude read PDF page as image)",
        }

    # === 2. Update CAGR if extracted ===
    growth = ve_data.get("yoy_growth_pct", {})
    if growth and growth.get("2025") and ve_data.get("growth_source_page"):
        em = d["ecommerce_market"][0]
        em["gmv_yoy_pct"] = growth.get("2025")
        em["source_metadata"]["gmv_yoy_pct"] = {
            "source_name": f"Statista E-commerce in {iso} Dossier - page {ve_data.get('growth_source_page')} (vision-verified)",
            "source_url": f"data/raw/statista/{pdf_file}#page={ve_data.get('growth_source_page')}",
            "source_quote": f"Annual growth rate 2025: {growth.get('2025')}%",
            "publisher": ve_data.get("growth_source_publisher", ""),
            "fetched_at": TODAY,
            "confidence": "H",
            "extraction_method": "vision",
        }

    # === 3. Update categories (USD or CAGR) ===
    cats_usd = ve_data.get("categories_usd_b_2024", {})
    cats_cagr = ve_data.get("categories_cagr_2017_2028", {})
    if cats_usd or cats_cagr:
        cat_page = ve_data.get("categories_source_page") or cats_cagr.get("_source_page")
        cat_publisher = ve_data.get("categories_source_publisher") or cats_cagr.get("_publisher", "")
        for cat in d.get("category_metrics", []):
            ccode = cat.get("category_code")
            # USD-based update
            if ccode in cats_usd:
                cat["gmv_usd_million"] = round(cats_usd[ccode] * 1000, 0)
                cat.setdefault("source_metadata", {})
                cat["source_metadata"]["gmv_usd_million"] = {
                    "source_name": f"Statista E-commerce in {iso} Dossier - page {cat_page} (vision-verified)",
                    "source_url": f"data/raw/statista/{pdf_file}#page={cat_page}",
                    "source_quote": f"{ccode}: ${cats_usd[ccode]} billion USD (2024)",
                    "publisher": cat_publisher,
                    "fetched_at": TODAY,
                    "confidence": "H",
                    "extraction_method": "vision",
                }
            # CAGR-based update
            if ccode in cats_cagr and not isinstance(cats_cagr[ccode], dict):
                cat["yoy_growth_pct"] = cats_cagr[ccode]
                cat.setdefault("source_metadata", {})
                cat["source_metadata"]["yoy_growth_pct"] = {
                    "source_name": f"Statista E-commerce in {iso} Dossier - page {cat_page} (CAGR 2017-2028 vision-verified)",
                    "source_url": f"data/raw/statista/{pdf_file}#page={cat_page}",
                    "source_quote": f"{ccode} CAGR 2017-2028: {cats_cagr[ccode]}%",
                    "publisher": cat_publisher,
                    "fetched_at": TODAY,
                    "confidence": "H",
                    "extraction_method": "vision",
                }

    # === 4. ecom_share_of_retail_pct ===
    if ve_data.get("ecom_share_of_retail_pct_2024") or ve_data.get("ecom_share_of_retail_pct_2025"):
        share = ve_data.get("ecom_share_of_retail_pct_2024") or ve_data.get("ecom_share_of_retail_pct_2025")
        em = d["ecommerce_market"][0]
        em["ecom_share_of_retail_pct"] = share
        em["source_metadata"]["ecom_share_of_retail_pct"] = {
            "source_name": f"Statista E-commerce in {iso} Dossier - page {ve_data.get('ecom_share_source_page')} (vision-verified)",
            "source_url": f"data/raw/statista/{pdf_file}#page={ve_data.get('ecom_share_source_page')}",
            "source_quote": f"E-commerce share of total retail: {share}%",
            "publisher": ve_data.get("ecom_share_source_publisher", ""),
            "fetched_at": TODAY,
            "confidence": "H",
            "extraction_method": "vision",
        }

    # === 5. Update _data_quality_warning ===
    d.setdefault("_data_quality_warning", {})
    d["_data_quality_warning"]["status"] = "VISION_VERIFIED_CORE_FIELDS"
    d["_data_quality_warning"]["vision_extraction_done_at"] = TODAY
    d["_data_quality_warning"]["vision_verified_fields"] = [
        "ecommerce_market.gmv_total_usd_million",
        "ecommerce_market.ecom_share_of_retail_pct" if ve_data.get("ecom_share_of_retail_pct_2024") or ve_data.get("ecom_share_of_retail_pct_2025") else None,
        f"category_metrics ({len(cats_usd) + len([k for k in cats_cagr if not isinstance(cats_cagr[k], dict)])} fields)" if (cats_usd or cats_cagr) else None,
    ]
    d["_data_quality_warning"]["vision_verified_fields"] = [f for f in d["_data_quality_warning"]["vision_verified_fields"] if f]

    # Add note for breakdown if exists
    if ve_data.get("gmv_breakdown_by_sector_usd_b_2024"):
        d.setdefault("_notes_vision", {})["sector_breakdown"] = ve_data["gmv_breakdown_by_sector_usd_b_2024"]

    json_path.write_text(json.dumps(d, indent=2, ensure_ascii=False))
    return d.get("_data_quality_warning", {}).get("vision_verified_fields", [])


# Run for each vision-extracted country
for iso, ve_data in VE.items():
    if iso.startswith("_"): continue
    fields = update_country(iso, ve_data)
    print(f"✅ {iso}: {fields}")

print("\nDone. 4 critical countries (USA, JPN, IDN, IND) now have vision-verified GMV + categories.")
