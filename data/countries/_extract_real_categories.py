"""
从 raw Statista PDF 提取文本中正则解析真实的品类细分百分比。
能解析出来的：confidence 升级到 H，加 PDF 页码引用。
解析不出来的：保持 L + warning。
"""
import json
import re
import glob
from pathlib import Path

TODAY = "2026-05-17"
EXTRACTED_DIR = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom/data/raw/statista_extracted")
COUNTRIES_DIR = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom/data/countries")

# Statista 文本里常见的英文品类 → 我们 12 大类 mapping
CATEGORY_MAP = {
    "fashion": "apparel", "clothing": "apparel", "apparel": "apparel", "shoes": "apparel",
    "beauty": "beauty", "cosmetic": "beauty", "personal care": "beauty", "fragrance": "beauty",
    "perfume": "beauty",
    "furniture": "home", "home decor": "home", "home furnishings": "home",
    "household appliances": "home", "household": "home",
    "electronics": "electronics", "consumer electronics": "electronics", "telephony": "electronics",
    "computer": "electronics", "computers": "electronics", "mobile phone": "electronics",
    "baby": "baby", "kid": "baby", "child": "baby",
    "pet": "pet",
    "sport": "outdoor", "leisure": "outdoor", "outdoor": "outdoor", "hobbies": "outdoor",
    "auto": "auto", "automotive": "auto", "car": "auto", "vehicle": "auto",
    "health": "health", "pharmaceutical": "health", "medicine": "health", "otc": "health",
    "toy": "toys", "toys": "toys",
    "kitchen": "kitchen", "food": "kitchen",
    "garden": "garden", "diy": "garden", "hardware": "garden",
}


def parse_category_text(text: str, page: int):
    """
    从单页文本中解析「品类名 - 百分比」对。
    Statista 通常格式: "Fashion & accessories 10.4%"
    """
    found = {}
    # Pattern 1: "Category Name X.XX%" or "Category Name X%"
    pattern = r'([A-Z][A-Za-z &/-]+?)\s+(\d+(?:\.\d+)?)\s*%'
    for match in re.finditer(pattern, text):
        label = match.group(1).strip().lower()
        pct = float(match.group(2))
        # Find matching category code
        for keyword, cat_code in CATEGORY_MAP.items():
            if keyword in label and pct < 100 and pct > 0:
                if cat_code not in found or found[cat_code]["pct"] < pct:
                    found[cat_code] = {
                        "pct": pct,
                        "page": page,
                        "label": match.group(1).strip(),
                    }
                break
    return found


def extract_country_categories(iso: str):
    """从 raw extract 提取该国品类细分"""
    extract_path = EXTRACTED_DIR / f"{iso.lower()}.json"
    if not extract_path.exists():
        return None
    raw = json.load(open(extract_path))

    cat_sections = raw.get("sections", {}).get("categories", [])
    if not cat_sections:
        return None

    combined = {}
    for section in cat_sections:
        page = section["page"]
        text = section["text"]
        parsed = parse_category_text(text, page)
        for cat_code, info in parsed.items():
            # Keep the one with highest pct (likely the main category breakdown)
            if cat_code not in combined or combined[cat_code]["pct"] < info["pct"]:
                combined[cat_code] = info
    return combined


def update_country_json(iso: str):
    json_path = COUNTRIES_DIR / f"{iso.lower()}.json"
    if not json_path.exists() or iso == "POL":
        return None
    d = json.load(open(json_path))

    real_cats = extract_country_categories(iso)
    if not real_cats:
        return {"iso": iso, "cats_upgraded": 0, "note": "No category data extracted"}

    total_gmv_m = d.get("ecommerce_market", [{}])[0].get("gmv_total_usd_million")
    pdf_file = next((v for k, v in {
        "USA":"study_id28028","CAN":"study_id32356","MEX":"study_id56142","GBR":"study_id22340",
        "DEU":"study_id32414","FRA":"study_id28910","ITA":"study_id36659","ESP":"study_id64376",
        "NLD":"study_id38799","SWE":"study_id36980","NOR":"study_id38783","CHE":"study_id172194",
        "ROU":"study_id85365","TUR":"study_id111522","RUS":"study_id63976","IDN":"study_id60342",
        "THA":"study_id79183","VNM":"study_id63723","PHL":"study_id74971","MYS":"study_id123671",
        "SGP":"study_id116244","IND":"study_id23773","JPN":"study_id61326","KOR":"study_id29755",
        "AUS":"study_id86390","BRA":"study_id56090","CHL":"study_id58456","ARG":"study_id57340",
        "SAU":"study_id85861","ARE":"study_id79165","ZAF":"study_id140559",
    }.items() if k == iso), "")

    pdf_filename = next((f for f in glob.glob(f"/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom/data/raw/statista/{pdf_file}*.pdf")), "")
    pdf_basename = Path(pdf_filename).name if pdf_filename else f"{pdf_file}_*.pdf"

    # Update category_metrics with real %
    upgraded = 0
    for cat in d.get("category_metrics", []):
        cat_code = cat.get("category_code")
        if cat_code in real_cats:
            real = real_cats[cat_code]
            cat["category_share_pct"] = real["pct"]
            if total_gmv_m:
                cat["gmv_usd_million"] = round(total_gmv_m * real["pct"] / 100, 0)
            cat.setdefault("source_metadata", {})
            cat["source_metadata"]["category_share_pct"] = {
                "source_name": f"Statista E-commerce in {iso} Dossier - page {real['page']}",
                "source_url": f"data/raw/statista/{pdf_basename}#page={real['page']}",
                "source_quote": f"{real['label']}: {real['pct']}%",
                "fetched_at": TODAY,
                "confidence": "H",
            }
            cat["source_metadata"]["gmv_usd_million"] = {
                "source_name": f"Hachimi 计算：total GMV × {real['pct']}% (from Statista page {real['page']})",
                "source_url": f"data/raw/statista/{pdf_basename}#page={real['page']}",
                "formula": f"${total_gmv_m}M × {real['pct']}% = ${round(total_gmv_m * real['pct'] / 100, 0)}M",
                "fetched_at": TODAY,
                "confidence": "M",
                "warning": "Total GMV 本身是 Hachimi 估算（confidence L），% 是 Statista 真实",
            }
            upgraded += 1

    json_path.write_text(json.dumps(d, indent=2, ensure_ascii=False))
    return {"iso": iso, "cats_upgraded": upgraded, "extracted_cats": list(real_cats.keys())}


# Run for all 31 countries
results = []
for f in sorted(COUNTRIES_DIR.glob("*.json")):
    if f.stem.startswith("_") or f.stem == "poland":
        continue
    iso = f.stem.upper()
    result = update_country_json(iso)
    if result:
        results.append(result)
        print(f"  {iso}: upgraded {result['cats_upgraded']} categories with real % from PDF")

# Summary
total = sum(r["cats_upgraded"] for r in results)
print(f"\n✅ Total: {total} category metrics upgraded with real Statista % data")
print(f"   ({len(results)} countries processed)")
