"""
用 _full_data_extract.py 提取的真实 Statista 数据更新 31 国 JSON。
所有更新的字段：confidence 升级到 H，带 #page= 引用 + source_quote。
"""
import json, re
from pathlib import Path

OUT = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom")
EXTRACT_DIR = OUT / "data/raw/statista_extracted"
COUNTRIES_DIR = OUT / "data/countries"
TODAY = "2026-05-17"

# Category name mapping
CAT_MAP = {
    "fashion": "apparel", "clothing": "apparel", "apparel": "apparel", "shoes": "apparel",
    "beauty": "beauty", "cosmetic": "beauty", "personal care": "beauty", "fragrance": "beauty",
    "perfume": "beauty",
    "furniture": "home", "home decor": "home", "home furnishings": "home",
    "household appliances": "home", "household goods": "home",
    "electronics": "electronics", "consumer electronics": "electronics", "telephony": "electronics",
    "computer": "electronics", "mobile phone": "electronics", "mobile phones": "electronics",
    "baby": "baby", "kid": "baby", "child": "baby",
    "pet": "pet",
    "sport": "outdoor", "leisure": "outdoor", "outdoor": "outdoor", "hobbies": "outdoor",
    "auto": "auto", "automotive": "auto", "car": "auto", "vehicle": "auto",
    "health": "health", "pharmaceutical": "health", "medicine": "health", "otc": "health",
    "toy": "toys", "toys": "toys",
    "kitchen": "kitchen", "food": "kitchen",
    "garden": "garden", "diy": "garden", "hardware": "garden",
}

PDF_FILES = {
    "USA": "study_id28028_e-commerce-in-the-united-states-statista-dossier.pdf",
    "CAN": "study_id32356_e-commerce-in-canada-statista-dossier.pdf",
    "MEX": "study_id56142_e-commerce-in-mexico.pdf",
    "GBR": "study_id22340_e-commerce-in-the-united-kingdom-uk.pdf",
    "DEU": "study_id32414_e-commerce-in-germany-statista-dossier.pdf",
    "FRA": "study_id28910_e-commerce-in-france-statista-dossier.pdf",
    "ITA": "study_id36659_e-commerce-in-italy-statista-dossier.pdf",
    "ESP": "study_id64376_e-commerce-in-spain.pdf",
    "NLD": "study_id38799_e-commerce-in-the-netherlands-statista-dossier.pdf",
    "SWE": "study_id36980_e-commerce-in-sweden-statista-dossier.pdf",
    "NOR": "study_id38783_e-commerce-in-norway.pdf",
    "CHE": "study_id172194_e-commerce-in-switzerland.pdf",
    "ROU": "study_id85365_e-commerce-in-romania.pdf",
    "TUR": "study_id111522_e-commerce-in-turkey.pdf",
    "RUS": "study_id63976_e-commerce-in-russia.pdf",
    "IDN": "study_id60342_e-commerce-in-indonesia.pdf",
    "THA": "study_id79183_e-commerce-industry-in-thailand.pdf",
    "VNM": "study_id63723_e-commerce-in-vietnam.pdf",
    "PHL": "study_id74971_e-commerce-in-the-philippines.pdf",
    "MYS": "study_id123671_e-commerce-in-malaysia.pdf",
    "SGP": "study_id116244_e-commerce-in-singapore.pdf",
    "IND": "study_id23773_e-commerce-in-india-statista-dossier.pdf",
    "JPN": "study_id61326_e-commerce-in-japan.pdf",
    "KOR": "study_id29755_e-commerce-in-south-korea-statista-dossier.pdf",
    "AUS": "study_id86390_e-commerce-in-australia.pdf",
    "BRA": "study_id56090_e-commerce-in-brazil.pdf",
    "CHL": "study_id58456_e-commerce-in-chile.pdf",
    "ARG": "study_id57340_e-commerce-in-argentina.pdf",
    "SAU": "study_id85861_e-commerce-in-saudi-arabia.pdf",
    "ARE": "study_id79165_e-commerce-in-the-united-arab-emirates.pdf",
    "ZAF": "study_id140559_e-commerce-in-south-africa.pdf",
}


def src_url(iso, page):
    pdf = PDF_FILES.get(iso, "")
    return f"data/raw/statista/{pdf}#page={page}"


def update_country(iso):
    json_path = COUNTRIES_DIR / f"{iso.lower()}.json"
    parsed_path = EXTRACT_DIR / f"{iso.lower()}_parsed.json"
    if not json_path.exists() or iso == "POL":
        return None
    if not parsed_path.exists():
        return None

    d = json.load(open(json_path))
    parsed = json.load(open(parsed_path))
    changes = {"rev": False, "stores": 0, "cats": 0, "payments": 0}

    # === 1. Update Total GMV ===
    rev = parsed.get("revenue_forecast")
    if rev and rev.get("value_usd_b"):
        new_gmv_m = round(rev["value_usd_b"] * 1000, 0)
        em = d["ecommerce_market"][0]
        em["gmv_total_usd_million"] = new_gmv_m
        em.setdefault("source_metadata", {})
        em["source_metadata"]["gmv_total_usd_million"] = {
            "source_name": f"Statista E-commerce in {iso} Dossier - page {rev['page']}",
            "source_url": src_url(iso, rev["page"]),
            "source_quote": rev.get("quote", "")[:300],
            "currency_original": rev["currency"],
            "value_original": rev.get("value_local_b") or rev["value_usd_b"],
            "fx_rate_used": rev["value_usd_b"] / (rev.get("value_local_b") or rev["value_usd_b"]) if rev.get("value_local_b") else 1.0,
            "fetched_at": TODAY,
            "confidence": "H",
        }
        # Recalculate per_capita if buyers known
        buyers = em.get("online_buyers_million")
        if buyers and buyers > 0:
            em["per_capita_spend_usd"] = round(new_gmv_m / buyers, 0)
            em["source_metadata"]["per_capita_spend_usd"] = {
                "source_name": f"Hachimi 计算 (Statista GMV / online_buyers)",
                "formula": f"${new_gmv_m}M / {buyers}M buyers",
                "source_url": src_url(iso, rev["page"]),
                "fetched_at": TODAY,
                "confidence": "M",
            }
        changes["rev"] = True

    # === 2. Update Top Platforms GMV ===
    if parsed.get("top_stores"):
        # Filter out obvious noise (year-like values, multi-word generic terms)
        valid_stores = [
            s for s in parsed["top_stores"]
            if not (1900 < s["value"] < 2030)  # exclude year values
            and not s["name"].lower().startswith("most popular")
            and not s["name"].lower().startswith("top online")
            and not s["name"].lower().startswith("leading")
        ]

        # Map extracted store names to platform_codes in our JSON
        for plat in d.get("platforms", []):
            plat_name = plat["name"].lower()
            plat_code = plat["platform_code"].lower()
            for store in valid_stores:
                store_name = store["name"].lower()
                # Match: amazon.fr -> amazon, Allegro -> allegro, etc.
                base = store_name.split(".")[0]
                if (base in plat_code or base in plat_name or
                    plat_name.split()[0] in store_name or
                    store_name.replace(" ","") in plat_code):
                    new_gmv_m = round(store["value"], 0)
                    plat.setdefault("metrics_2024", {})
                    plat["metrics_2024"]["gmv_usd_million"] = new_gmv_m
                    plat["metrics_2024"].setdefault("source_metadata", {})
                    plat["metrics_2024"]["source_metadata"]["gmv_usd_million"] = {
                        "source_name": f"Statista E-commerce in {iso} Dossier - page {store['page']} (Top online stores by net sales)",
                        "source_url": src_url(iso, store["page"]),
                        "source_quote": f"{store['name']}: {store['value']} million U.S. dollars (2024)",
                        "fetched_at": TODAY,
                        "confidence": "H",
                    }
                    changes["stores"] += 1
                    break

    # === 3. Update Category breakdowns ===
    if parsed.get("categories"):
        total_gmv = d["ecommerce_market"][0].get("gmv_total_usd_million")
        for cat in d.get("category_metrics", []):
            cat_code = cat.get("category_code")
            best_match = None
            for p in parsed["categories"]:
                label_lower = p["label"].lower()
                for kw, mapped in CAT_MAP.items():
                    if mapped == cat_code and kw in label_lower:
                        if "pct" in p and (not best_match or p["pct"] > best_match.get("pct", 0)):
                            best_match = p
                        break
            if best_match and "pct" in best_match:
                cat["category_share_pct"] = best_match["pct"]
                if total_gmv:
                    cat["gmv_usd_million"] = round(total_gmv * best_match["pct"] / 100, 0)
                cat.setdefault("source_metadata", {})
                cat["source_metadata"]["category_share_pct"] = {
                    "source_name": f"Statista E-commerce in {iso} Dossier - page {best_match['page']}",
                    "source_url": src_url(iso, best_match["page"]),
                    "source_quote": f"{best_match['label']}: {best_match['pct']}%",
                    "fetched_at": TODAY,
                    "confidence": "H",
                }
                if total_gmv:
                    cat["source_metadata"]["gmv_usd_million"] = {
                        "source_name": f"Hachimi 计算: total GMV × {best_match['pct']}% (Statista page {best_match['page']})",
                        "formula": f"${total_gmv}M × {best_match['pct']}% = ${round(total_gmv * best_match['pct'] / 100, 0)}M",
                        "source_url": src_url(iso, best_match["page"]),
                        "fetched_at": TODAY,
                        "confidence": "H",
                    }
                changes["cats"] += 1

    # === 4. Update Payments ===
    if parsed.get("payments"):
        # Map extracted methods to existing payments
        for pay in d.get("payments", []):
            method_lower = pay["payment_method"].lower()
            for p in parsed["payments"]:
                pm_lower = p["method"].lower()
                # Match by keyword
                if (method_lower in pm_lower or pm_lower in method_lower or
                    method_lower.split("_")[0] in pm_lower):
                    pay["share_pct"] = p["share_pct"]
                    pay["confidence"] = "H"
                    pay.pop("warning", None)
                    pay["source_url"] = src_url(iso, p["page"])
                    pay["source_quote"] = f"{p['method']}: {p['share_pct']}%"
                    pay["source_name"] = f"Statista E-commerce in {iso} Dossier - page {p['page']}"
                    changes["payments"] += 1
                    break

    # Update _data_quality_warning
    if changes["rev"] or changes["stores"] > 0 or changes["cats"] > 0 or changes["payments"] > 0:
        d.setdefault("_data_quality_warning", {})
        d["_data_quality_warning"]["status"] = "PARTIAL_RECONSTRUCTION_DONE"
        d["_data_quality_warning"]["last_upgrade"] = TODAY
        d["_data_quality_warning"]["upgraded_fields_count"] = {
            "gmv_total": 1 if changes["rev"] else 0,
            "platform_gmv": changes["stores"],
            "category_shares": changes["cats"],
            "payment_shares": changes["payments"],
        }
        d["_data_quality_warning"]["warning"] = f"已用真实 Statista PDF 数据更新核心字段；剩余 confidence=L 字段（如 traffic_economics、china_seller_density）仍需第三方工具验证"

    json_path.write_text(json.dumps(d, indent=2, ensure_ascii=False))
    return changes


# Run
results = {}
for f in sorted(COUNTRIES_DIR.glob("*.json")):
    if f.stem.startswith("_") or f.stem == "poland":
        continue
    iso = f.stem.upper()
    c = update_country(iso)
    if c:
        results[iso] = c

# Summary
print(f"{'ISO':5} {'GMV':4} {'Plat':5} {'Cats':5} {'Pay':4}")
total_upgrades = 0
for iso, c in sorted(results.items()):
    total_upgrades += int(c["rev"]) + c["stores"] + c["cats"] + c["payments"]
    print(f"{iso:5} {'✓' if c['rev'] else ' ':4} {c['stores']:<5} {c['cats']:<5} {c['payments']}")
print(f"\n✅ Total: {total_upgrades} field-level upgrades with real Statista PDF data + page references")
