import type { Compliance, CountryData } from "@/types";
import {
  getAvailableCountryIsos,
  getCountryData,
  getAllCountries,
} from "./data";

/** Parse a numeric "standard" VAT/GST/IVA/Sales-tax rate from rule_name + threshold_value. */
export function parseTaxRate(c: Compliance): number | null {
  const haystack = `${c.rule_name} ${c.threshold_value ?? ""}`;
  // Look for the first "X%" or "X.Y%" — that's almost always the standard rate.
  const m = haystack.match(/(\d{1,2}(?:\.\d)?)\s*%/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  if (n > 50) return null; // sanity
  return n;
}

export type TaxRow = {
  iso: string;
  name_zh: string;
  flag_emoji?: string;
  system: string; // VAT / GST / Sales Tax / IVA / Consumption Tax
  standard_rate: number | null;
  rule: Compliance;
};

const SYSTEM_PREFIX_PATTERNS: { re: RegExp; system: string }[] = [
  { re: /^VAT\b/i, system: "VAT 增值税" },
  { re: /^GST\b/i, system: "GST 商品服务税" },
  { re: /^IVA\b/i, system: "IVA 增值税" },
  { re: /^KDV\b/i, system: "KDV (土耳其 VAT)" },
  { re: /^ICMS\b/i, system: "ICMS 巴西州税" },
  { re: /^SST\b/i, system: "SST 销售服务税" },
  { re: /^消费税|^Consumption Tax/i, system: "消费税" },
  { re: /^Section 321/i, system: "免税额取消" },
  { re: /^Section 301/i, system: "对中关税" },
  { re: /^1099-K/i, system: "卖家收入申报" },
  { re: /^Poland VAT/i, system: "VAT 增值税" },
];

function classifySystem(c: Compliance): string {
  for (const p of SYSTEM_PREFIX_PATTERNS) {
    if (p.re.test(c.rule_name)) return p.system;
  }
  return c.rule_type === "tax" ? "其它税务" : c.rule_type;
}

/**
 * Build a 32-country tax-rate table. For each country, pick the first
 * compliance rule whose rule_type is vat_threshold / tax / marketplace_facilitator
 * AND has a parseable standard rate.
 */
export function getTaxTable(): TaxRow[] {
  const countries = getAllCountries();
  const out: TaxRow[] = [];
  for (const iso of getAvailableCountryIsos()) {
    const d = getCountryData(iso);
    if (!d) continue;
    const taxRules = d.compliance.filter(
      (c) => c.rule_type === "vat_threshold" || c.rule_type === "tax",
    );
    // Prefer the rule with a parseable rate; fall back to any tax rule.
    const withRate = taxRules.find((r) => parseTaxRate(r) != null);
    const rule = withRate ?? taxRules[0];
    if (!rule) continue;
    const c = countries.find((c) => c.iso_alpha3 === iso);
    out.push({
      iso,
      name_zh: c?.name_zh ?? iso,
      flag_emoji: c?.flag_emoji,
      system: classifySystem(rule),
      standard_rate: parseTaxRate(rule),
      rule,
    });
  }
  return out;
}

/**
 * Group product_cert rules by category. Returns a map of
 * category_code → array of { country_iso, rule }.
 */
export type CategoryCertItem = {
  iso: string;
  name_zh: string;
  flag_emoji?: string;
  rule: Compliance;
};
export function getCertsByCategory(): Record<string, CategoryCertItem[]> {
  const countries = getAllCountries();
  const map: Record<string, CategoryCertItem[]> = {};
  for (const iso of getAvailableCountryIsos()) {
    const d = getCountryData(iso);
    if (!d) continue;
    const c = countries.find((c) => c.iso_alpha3 === iso);
    for (const rule of d.compliance) {
      if (rule.rule_type !== "product_cert" && rule.rule_type !== "labeling") continue;
      const cats = rule.applies_to_categories ?? [];
      const target = cats.length > 0 ? cats : ["_general"];
      for (const cat of target) {
        if (!map[cat]) map[cat] = [];
        map[cat].push({
          iso,
          name_zh: c?.name_zh ?? iso,
          flag_emoji: c?.flag_emoji,
          rule,
        });
      }
    }
  }
  return map;
}

/** Group rules for a country by section. */
export function groupCountryCompliance(data: CountryData) {
  const tax: Compliance[] = [];
  const certs: Compliance[] = [];
  const dataPrivacy: Compliance[] = [];
  const platform: Compliance[] = [];
  const other: Compliance[] = [];
  for (const c of data.compliance) {
    switch (c.rule_type) {
      case "vat_threshold":
      case "tax":
        tax.push(c);
        break;
      case "product_cert":
      case "labeling":
        certs.push(c);
        break;
      case "data_privacy":
        dataPrivacy.push(c);
        break;
      case "marketplace_facilitator":
        platform.push(c);
        break;
      default:
        other.push(c);
    }
  }
  return { tax, certs, dataPrivacy, platform, other };
}
