import { getCategoryCatalog } from "@/lib/data";
import { CatalogClient } from "@/components/CatalogClient";

export const metadata = {
  title: "品类图谱 · Hachimi 全球电商研究",
  description:
    "16 大品类 × 主要二三级产品举例 · 团队扫盲对齐用。",
};

export default function CatalogPage() {
  const catalog = getCategoryCatalog();
  const totalProducts = catalog.categories.reduce(
    (acc, c) =>
      acc + c.subgroups.reduce((s, g) => s + g.products.length, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">品类图谱</h1>
        <p className="mt-2 text-sm text-[var(--color-text-dim)]">
          {catalog.categories.length} 个主要品类 · 共 {totalProducts}{" "}
          个二级 / 三级产品举例 · 用于团队扫盲与对齐
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
          注：这套 16 大类按"选品视角"划分，比国家详情页用的 12 Hachimi
          大类更细。每个卡片右上角会标注对应的 Hachimi 大类，方便回到国家市场数据。
        </p>
      </header>
      <CatalogClient catalog={catalog} />
    </div>
  );
}
