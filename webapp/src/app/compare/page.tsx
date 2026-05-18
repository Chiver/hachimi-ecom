import { Suspense } from "react";
import { getAllCountries, getAvailableCountryIsos, getCountryData } from "@/lib/data";
import { CompareClient, type CountrySnapshot } from "@/components/CompareClient";

export const metadata = {
  title: "国家对比 · Hachimi 全球电商研究",
  description: "选 2-4 国并排对比电商市场体量、Hachimi 评分、推荐入市模式。",
};

export default function ComparePage() {
  const countries = getAllCountries();
  // Build a snapshot of every country with data, for the picker.
  const snapshots: Record<string, CountrySnapshot> = {};
  for (const iso of getAvailableCountryIsos()) {
    const d = getCountryData(iso);
    if (!d) continue;
    const market =
      d.ecommerce_market.find((m) => m.year === 2024) ?? d.ecommerce_market[0];
    const macro =
      d.macro_indicators.find((m) => m.year === 2024) ?? d.macro_indicators[0];
    const traffic: CountrySnapshot["traffic"] = {};
    for (const t of d.traffic_economics ?? []) {
      const src = t.source_url ?? "";
      traffic[t.channel] = {
        cpm_usd: t.cpm_usd ?? null,
        cpc_usd: t.cpc_usd ?? null,
        estimated:
          src.toLowerCase().startsWith("hachimi") ||
          src.toLowerCase().includes("hachimi benchmark"),
      };
    }
    snapshots[iso] = {
      iso_alpha3: iso,
      country: d.country,
      composite_score: d.hachimi_scores.composite_score ?? null,
      market_attractiveness: d.hachimi_scores.market_attractiveness ?? null,
      operational_feasibility: d.hachimi_scores.operational_feasibility ?? null,
      competition_intensity: d.hachimi_scores.competition_intensity ?? null,
      ai_leverage_potential: d.hachimi_scores.ai_leverage_potential ?? null,
      recommended_entry_mode: d.hachimi_scores.recommended_entry_mode ?? null,
      recommended_categories: d.hachimi_scores.recommended_categories ?? [],
      gmv_total_usd_million: market?.gmv_total_usd_million ?? null,
      cagr_2025_2030_pct: market?.cagr_2025_2030_pct ?? null,
      per_capita_spend_usd: market?.per_capita_spend_usd ?? null,
      online_buyers_million: market?.online_buyers_million ?? null,
      cross_border_share_pct: market?.cross_border_share_pct ?? null,
      population: macro?.population ?? null,
      gdp_per_capita_usd: macro?.gdp_per_capita_usd ?? null,
      internet_penetration_pct: macro?.internet_penetration_pct ?? null,
      traffic,
    };
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">国家对比</h1>
        <p className="mt-2 text-sm text-[var(--color-text-dim)]">
          选 2-4 个国家进行并排对比 · 雷达图（4 维 Hachimi 评分）+ 关键指标表格。
        </p>
      </header>
      <Suspense
        fallback={
          <div className="mt-12 text-sm text-[var(--color-text-dim)]">加载…</div>
        }
      >
        <CompareClient countries={countries} snapshots={snapshots} />
      </Suspense>
    </div>
  );
}
