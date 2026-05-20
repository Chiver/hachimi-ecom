import {
  getRoiBenchmarks,
  getAllCountries,
  getLebesgueMetaCpm,
} from "@/lib/data";
import { RoiCalculator } from "@/components/RoiCalculator";

export const metadata = {
  title: "ROI 测算 · Hachimi 全球电商研究",
  description:
    "选模式 (Meta/TikTok → 独立站/Shop) × 国家 × 品类，输入 COGS/售价/物流/退货率，实时计算 ROI / ROAS / 净利率。",
};

export default function RoiPage() {
  const benchmarks = getRoiBenchmarks();
  const countries = getAllCountries();
  // Hand the Lebesgue CPM map down so the calculator can auto-fill Meta CPM
  // for countries that have third-party data.
  const lebesgueCpmByIso: Record<string, number> = {};
  for (const c of countries) {
    const v = getLebesgueMetaCpm(c.iso_alpha3);
    if (v) lebesgueCpmByIso[c.iso_alpha3] = v.cpm_usd;
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">ROI 测算</h1>
        <p className="mt-2 text-sm text-[var(--color-text-dim)]">
          Meta / TikTok 投放 × 独立站 / TikTok Shop · 32 国 × 18 品类 ·
          基于《ROI 公式合集 v1.0》+《独立站 CVR / CTR 基准报告》实时计算
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
          所有数值字段都可调整。默认值取品类中位数 × 区域系数；Meta CPM
          会优先用 Lebesgue 2026 国别数据。
        </p>
      </header>
      <RoiCalculator
        benchmarks={benchmarks}
        countries={countries}
        lebesgueCpmByIso={lebesgueCpmByIso}
      />
    </div>
  );
}
