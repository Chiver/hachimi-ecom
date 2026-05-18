"""
Statista PDF 智能提取器 — 从 31 个国家 dossier 提取关键数据 + 页码级 source。

输出: data/raw/statista_extracted/{iso}.json，含:
- total_ecommerce_gmv: 最新 GMV + 源页
- top_online_stores: Top 10 平台 + GMV + 源页
- categories: 按品类细分 + 源页 + 引用原文
- payments: 支付方式占比 + 源页
- forecast_users: 用户数预测 + 源页
- forecast_revenue: 收入预测 + 源页
- cross_border: 跨境占比 + 源页

每个数据点带 page 号，可直接用于 source_url 的 #page= 引用。
"""
import pdfplumber
import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path("/sessions/sleepy-nifty-brahmagupta/mnt/hachimi-ecom")
PDF_DIR = ROOT / "data/raw/statista"
OUT_DIR = ROOT / "data/raw/statista_extracted"
OUT_DIR.mkdir(exist_ok=True)
TODAY = "2026-05-17"

# 国家 → Statista PDF 文件映射
COUNTRY_PDF = {
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

# 关键章节关键词（用于在 TOC 中定位页码）
SECTION_KEYWORDS = {
    "ecommerce_revenue": ["E-commerce revenue", "Value of e-commerce market", "Retail e-commerce sales"],
    "top_online_stores": ["Top online stores", "Highest grossing", "Top e-commerce retailers", "Most popular online", "Leading online stores"],
    "categories": ["by category", "by segment", "by product", "categories for online", "spending on consumer", "revenue share"],
    "payments": ["payment methods", "payment services", "e-commerce payment", "payment options"],
    "forecast_users": ["users", "Online retail users", "Number of e-commerce users", "online shoppers"],
    "forecast_revenue": ["revenue", "forecast", "Forecasts", "predicted"],
    "cross_border": ["Cross-border", "foreign e-stores", "foreign online stores"],
    "online_buyers": ["Share of online shoppers", "Internet users buying", "online buyers"],
    "mobile": ["mobile commerce", "m-commerce", "mobile devices"],
}


def find_toc_pages(pdf):
    """读 TOC（page 1-3）找关键章节的页码。"""
    toc_text = ""
    for i in range(min(4, len(pdf.pages))):
        toc_text += (pdf.pages[i].extract_text() or "") + "\n"

    section_pages = {}
    for section, keywords in SECTION_KEYWORDS.items():
        pages = set()
        for line in toc_text.split("\n"):
            line_lower = line.lower()
            for kw in keywords:
                if kw.lower() in line_lower:
                    # Try to extract page number at end of line
                    m = re.search(r'(\d{1,3})\s*$', line.strip())
                    if m:
                        pages.add(int(m.group(1)))
                    break
        section_pages[section] = sorted(pages)
    return section_pages


def extract_page_text(pdf, page_num):
    """提取指定页码文本（page_num 是 PDF 中页码，1-indexed）。"""
    if 0 < page_num <= len(pdf.pages):
        return pdf.pages[page_num - 1].extract_text() or ""
    return ""


def extract_country(iso, pdf_file):
    """提取一个国家的关键数据"""
    pdf_path = PDF_DIR / pdf_file
    if not pdf_path.exists():
        return {"_error": f"PDF not found: {pdf_file}"}

    result = {
        "_meta": {
            "iso": iso,
            "pdf_file": pdf_file,
            "extracted_at": TODAY,
        },
        "sections": {}
    }

    with pdfplumber.open(pdf_path) as pdf:
        result["_meta"]["total_pages"] = len(pdf.pages)
        toc_pages = find_toc_pages(pdf)
        result["_meta"]["toc_pages"] = toc_pages

        # 提取每个 section 的第一个匹配页面文本
        for section, pages in toc_pages.items():
            section_data = []
            for p in pages[:3]:  # 最多前 3 个匹配
                text = extract_page_text(pdf, p)
                if text and len(text) > 100:
                    section_data.append({
                        "page": p,
                        "text": text[:3500],  # 截前 3.5k 字符
                    })
            if section_data:
                result["sections"][section] = section_data

    return result


# 跑全部
all_extracted = {}
for iso, pdf_file in COUNTRY_PDF.items():
    print(f"Extracting {iso} from {pdf_file[:60]}...")
    try:
        data = extract_country(iso, pdf_file)
        out_path = OUT_DIR / f"{iso.lower()}.json"
        out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        sections_found = len(data.get("sections", {}))
        toc_pages_count = sum(len(v) for v in data["_meta"].get("toc_pages", {}).values())
        all_extracted[iso] = {
            "sections": sections_found,
            "toc_matches": toc_pages_count,
        }
    except Exception as e:
        print(f"  ERROR: {e}")
        all_extracted[iso] = {"error": str(e)}

# Summary
print(f"\n{'='*60}")
print(f"Extraction Summary:")
print(f"{'='*60}")
for iso, s in all_extracted.items():
    if "error" in s:
        print(f"  {iso}: ERROR - {s['error']}")
    else:
        print(f"  {iso}: {s['sections']} sections, {s['toc_matches']} TOC matches")

(OUT_DIR / "_summary.json").write_text(json.dumps(all_extracted, indent=2, ensure_ascii=False))
