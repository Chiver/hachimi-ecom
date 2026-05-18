"""
Fetch macro indicators from World Bank Open Data API for all 32 Hachimi countries.
Output: data/raw/free-apis/worldbank_macro.json
No API key required.

Run: python3 fetch_worldbank.py
"""
import json
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# 32 国 ISO alpha-3 -> 国家名（英文）
COUNTRIES = {
    "USA": "United States", "CAN": "Canada", "MEX": "Mexico",
    "GBR": "United Kingdom", "DEU": "Germany", "FRA": "France",
    "ITA": "Italy", "ESP": "Spain", "NLD": "Netherlands",
    "SWE": "Sweden", "NOR": "Norway", "CHE": "Switzerland",
    "POL": "Poland", "ROU": "Romania", "TUR": "Turkey", "RUS": "Russia",
    "IDN": "Indonesia", "THA": "Thailand", "VNM": "Vietnam",
    "PHL": "Philippines", "MYS": "Malaysia", "SGP": "Singapore",
    "IND": "India",
    "JPN": "Japan", "KOR": "Korea", "AUS": "Australia",
    "BRA": "Brazil", "CHL": "Chile", "ARG": "Argentina",
    "SAU": "Saudi Arabia", "ARE": "UAE", "ZAF": "South Africa",
}

# World Bank indicator codes
INDICATORS = {
    "population": "SP.POP.TOTL",
    "gdp_usd": "NY.GDP.MKTP.CD",
    "gdp_per_capita_usd": "NY.GDP.PCAP.CD",
    "inflation_pct": "FP.CPI.TOTL.ZG",
    "internet_users_pct": "IT.NET.USER.ZS",
    "mobile_subs_per100": "IT.CEL.SETS.P2",
    "urban_pop_pct": "SP.URB.TOTL.IN.ZS",
    "gni_per_capita_usd": "NY.GNP.PCAP.CD",
}

API_BASE = "https://api.worldbank.org/v2"
YEARS = "2018:2024"


def fetch(country_iso3, indicator_code):
    """Fetch a single indicator for a country (2018-2024)."""
    url = f"{API_BASE}/country/{country_iso3}/indicator/{indicator_code}?date={YEARS}&format=json&per_page=20"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.loads(r.read().decode())
        # World Bank API returns [metadata, [data_rows]]
        if not isinstance(data, list) or len(data) < 2 or data[1] is None:
            return {}
        return {row["date"]: row["value"] for row in data[1] if row["value"] is not None}
    except Exception as e:
        return {"_error": str(e)}


def main():
    out = {iso: {"name_en": name, "indicators": {}} for iso, name in COUNTRIES.items()}
    tasks = [(iso, ind_name, ind_code)
             for iso in COUNTRIES
             for ind_name, ind_code in INDICATORS.items()]

    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = {pool.submit(fetch, iso, code): (iso, name)
                   for iso, name, code in tasks}
        done = 0
        for fut in as_completed(futures):
            iso, ind_name = futures[fut]
            out[iso]["indicators"][ind_name] = fut.result()
            done += 1
            if done % 32 == 0:
                print(f"  {done}/{len(tasks)}")
    out_path = Path(__file__).parent / "worldbank_macro.json"
    out_path.write_text(json.dumps({
        "_meta": {
            "source": "World Bank Open Data",
            "source_url": "https://api.worldbank.org/v2",
            "fetched_at": datetime.now().isoformat(),
            "confidence": "H",
            "indicators": INDICATORS,
            "year_range": YEARS,
        },
        "data": out,
    }, indent=2, ensure_ascii=False))
    print(f"\n✅ Saved to {out_path}")


if __name__ == "__main__":
    main()
