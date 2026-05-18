"""
深度提取 31 国 Statista PDF 关键数据：
1. Total e-commerce revenue (latest + forecast)
2. Top 10 online stores with revenue
3. Category breakdowns (% or USD)
4. Payment methods with %

Output: data/raw/statista_extracted/{iso}_parsed.json
"""
import json, re
from pathlib import Path
from datetime import datetime

OUT = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom/data/raw/statista_extracted")
PI = json.load(open(OUT / "_page_index.json"))
TODAY = "2026-05-17"

# Currency conversion to USD (approximate 2024 rates)
FX = {
    "EUR": 1.09, "GBP": 1.27, "CHF": 1.13, "SEK": 0.095, "NOK": 0.093,
    "PLN": 0.25, "RON": 0.22, "TRY": 0.03, "RUB": 0.011, "INR": 0.012,
    "JPY": 0.0067, "KRW": 0.00073, "CNY": 0.14, "AUD": 0.66, "CAD": 0.73,
    "BRL": 0.18, "CLP": 0.0011, "ARS": 0.001, "MXN": 0.054, "SAR": 0.27,
    "AED": 0.27, "ZAR": 0.054, "SGD": 0.74, "MYR": 0.22, "THB": 0.028,
    "VND": 0.000040, "PHP": 0.018, "IDR": 0.000063,
}

# ISO -> currency
COUNTRY_CCY = {
    "USA":"USD","CAN":"CAD","MEX":"MXN","GBR":"GBP","DEU":"EUR","FRA":"EUR","ITA":"EUR","ESP":"EUR","NLD":"EUR",
    "SWE":"SEK","NOR":"NOK","CHE":"CHF","ROU":"EUR","TUR":"TRY","RUS":"RUB",
    "IDN":"IDR","THA":"THB","VNM":"VND","PHL":"PHP","MYS":"MYR","SGP":"SGD","IND":"INR",
    "JPN":"JPY","KOR":"KRW","AUS":"AUD","BRA":"BRL","CHL":"USD","ARG":"USD",
    "SAU":"SAR","ARE":"AED","ZAF":"ZAR",
}

def to_usd_m(value_m, currency):
    if currency == "USD": return value_m
    rate = FX.get(currency, 1.0)
    return value_m * rate


def extract_revenue_forecast(iso, pages_data):
    """Extract latest year e-commerce revenue (in local + USD)."""
    candidates = []
    for p_num in PI[iso].get("ecom_revenue", []):
        page = next((p for p in pages_data if p["page"] == p_num), None)
        if not page: continue
        text = page["text"]
        # Pattern 1: "X.X billion U.S. dollars"
        m = re.search(r'(\d+(?:\.\d+)?)\s*billion\s+U\.S\.\s+dollars', text, re.IGNORECASE)
        if m:
            candidates.append({"value_usd_b": float(m.group(1)), "currency": "USD", "page": p_num,
                              "quote": text[max(0,m.start()-100):m.end()+30].replace("\n", " ")[:300]})
        # Pattern 2: "X.X billion euros" / "X.X billion SEK" etc.
        for ccy_word, ccy in [("euros","EUR"),("british pounds","GBP"),("Swiss francs","CHF"),
                              ("brazilian reals","BRL"),("Chinese yuan","CNY"),("Japanese yen","JPY"),
                              ("Swedish kroner","SEK"),("Swedish SEK","SEK"),("SEK","SEK"),
                              ("Norwegian kroner","NOK"),("polish złoty","PLN"),("Russian rubles","RUB"),
                              ("rupees","INR"),("AED","AED"),("Saudi riyals","SAR"),("Thai baht","THB"),
                              ("South African rand","ZAR"),("Indonesian rupiah","IDR"),("South Korean won","KRW"),
                              ("Australian dollars","AUD"),("Canadian dollars","CAD"),("Mexican pesos","MXN")]:
            for m in re.finditer(rf'(\d+(?:[\.,]\d+)?)\s*billion\s+{ccy_word}', text, re.IGNORECASE):
                local_b = float(m.group(1).replace(",","."))
                candidates.append({"value_local_b": local_b, "currency": ccy,
                                  "value_usd_b": to_usd_m(local_b*1000, ccy)/1000, "page": p_num,
                                  "quote": text[max(0,m.start()-100):m.end()+30].replace("\n"," ")[:300]})
    # Pick the highest-value mention (usually the latest year forecast)
    if candidates:
        best = max(candidates, key=lambda x: x.get("value_usd_b", 0))
        return best
    return None


def extract_top_stores(iso, pages_data):
    """Extract top online stores with revenue."""
    results = []
    for p_num in PI[iso].get("top_stores", []):
        page = next((p for p in pages_data if p["page"] == p_num), None)
        if not page: continue
        text = page["text"]
        # Pattern: "amazon.com 426,593" or "Allegro 14,441.4"
        # Look for domain-like or capitalized name followed by number
        for line in text.split("\n"):
            line = line.strip()
            # Match: "site.com 1234.5" or "Site Name 1234.5"
            m = re.match(r'^([a-zA-Z][a-zA-Z0-9\.\-_ &]+?)\s+([\d,]+\.?\d*)\s*$', line)
            if m:
                name = m.group(1).strip()
                try:
                    val = float(m.group(2).replace(",",""))
                    # Skip tiny/silly values, must be > 50 for stores
                    if val > 50 and len(name) < 40:
                        results.append({"name": name, "value": val, "page": p_num})
                except ValueError:
                    pass
    # Dedup by name, keep highest
    seen = {}
    for r in results:
        key = r["name"].lower().replace(".com","").replace(".pl","").replace(".de","").replace(".jp","").replace(".au","")
        if key not in seen or seen[key]["value"] < r["value"]:
            seen[key] = r
    return list(seen.values())[:10]


def extract_categories(iso, pages_data):
    """Extract category breakdowns - % or absolute values."""
    results = []
    for p_num in PI[iso].get("categories_breakdown", []):
        page = next((p for p in pages_data if p["page"] == p_num), None)
        if not page: continue
        text = page["text"]
        # Pattern: "Fashion 10.4%" or "Household appliances 19.65%"
        for line in text.split("\n"):
            line = line.strip()
            m = re.match(r'^([A-Z][A-Za-z &/,-]{2,40}?)\s+([\d]+\.?\d*)%?\s*$', line)
            if m:
                name = m.group(1).strip()
                try:
                    pct = float(m.group(2))
                    if 0.1 < pct < 80:  # reasonable % range
                        results.append({"label": name, "pct": pct, "page": p_num})
                except ValueError:
                    pass
        # Also pattern: "Fashion 8.74" (in billions, not %)
        for line in text.split("\n"):
            m = re.match(r'^([A-Z][A-Za-z &/,-]{2,30})\s+([\d]+\.\d+)\s*$', line.strip())
            if m and "%" not in line:
                name = m.group(1).strip()
                try:
                    val = float(m.group(2))
                    if 0.01 < val < 200:
                        results.append({"label": name, "value_b": val, "page": p_num})
                except ValueError:
                    pass
    return results[:30]


def extract_payments(iso, pages_data):
    """Extract payment method shares."""
    results = []
    for p_num in PI[iso].get("payment_methods", []):
        page = next((p for p in pages_data if p["page"] == p_num), None)
        if not page: continue
        text = page["text"]
        for line in text.split("\n"):
            m = re.match(r'^([A-Z][A-Za-z &\-\(\)/]{2,40}?)\s+([\d]+\.?\d*)%\s*$', line.strip())
            if m:
                name = m.group(1).strip()
                try:
                    pct = float(m.group(2))
                    if 0.1 < pct < 95:
                        results.append({"method": name, "share_pct": pct, "page": p_num})
                except ValueError:
                    pass
    return results[:15]


# Process all
all_extracted = {}
for iso in PI.keys():
    pages_data = json.load(open(OUT / f"{iso.lower()}_fulltext.json"))["pages"]
    extracted = {
        "iso": iso,
        "currency": COUNTRY_CCY.get(iso, "USD"),
        "revenue_forecast": extract_revenue_forecast(iso, pages_data),
        "top_stores": extract_top_stores(iso, pages_data),
        "categories": extract_categories(iso, pages_data),
        "payments": extract_payments(iso, pages_data),
        "extracted_at": TODAY,
    }
    (OUT / f"{iso.lower()}_parsed.json").write_text(json.dumps(extracted, indent=2, ensure_ascii=False))
    all_extracted[iso] = {
        "rev": "✓" if extracted["revenue_forecast"] else "✗",
        "stores": len(extracted["top_stores"]),
        "cats": len(extracted["categories"]),
        "pay": len(extracted["payments"]),
    }

# Summary
print(f"{'ISO':5} {'rev':5} {'stores':8} {'cats':6} {'pay':5}")
for iso, s in all_extracted.items():
    print(f"{iso:5} {s['rev']:5} {s['stores']:<8} {s['cats']:<6} {s['pay']}")
