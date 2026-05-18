import { notFound } from "next/navigation";
import {
  getAllCountries,
  getAvailableCountryIsos,
  getCountryData,
  getCountryMeta,
} from "@/lib/data";
import { CountryHeader } from "@/components/country/CountryHeader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OverviewTab } from "@/components/country/OverviewTab";
import { PlatformsTab } from "@/components/country/PlatformsTab";
import { CategoriesTab } from "@/components/country/CategoriesTab";
import { PaymentsLogisticsTab } from "@/components/country/PaymentsLogisticsTab";
import { ComplianceTab } from "@/components/country/ComplianceTab";
import { TrafficTab } from "@/components/country/TrafficTab";
import { ChinaSellerTab } from "@/components/country/ChinaSellerTab";
import { RecommendationTab } from "@/components/country/RecommendationTab";

export const dynamicParams = false;

export function generateStaticParams() {
  // Pre-render: every tracked country (meta) and every country with full data.
  // Countries without data get a "数据待补" placeholder page.
  return getAllCountries().map((c) => ({ iso: c.iso_alpha3 }));
}

type Props = { params: Promise<{ iso: string }> };

export default async function CountryPage({ params }: Props) {
  const { iso } = await params;
  const isoUpper = iso.toUpperCase();
  const meta = getCountryMeta(isoUpper);
  if (!meta) notFound();

  const data = getCountryData(isoUpper);

  if (!data) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <CountryHeader country={meta} />
        <div className="mt-12 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-12 text-center">
          <h2 className="text-xl font-semibold">数据待补</h2>
          <p className="mt-2 text-sm text-[var(--color-text-dim)]">
            {meta.name_zh} 的详细数据尚未交付。Cowork 团队产出 JSON 后将自动上线。
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-dim)]">
            已交付国家：
            {getAvailableCountryIsos().map((i) => (
              <a
                key={i}
                href={`/country/${i}`}
                className="ml-2 inline-flex items-center rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-primary)] hover:underline"
              >
                {i}
              </a>
            ))}
          </p>
        </div>
      </div>
    );
  }

  const macro = data.macro_indicators.find((m) => m.year === 2024) ?? data.macro_indicators[0];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <CountryHeader
        country={data.country}
        population={macro?.population}
        gdp_usd_billion={macro?.gdp_usd_billion}
      />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="platforms">平台</TabsTrigger>
          <TabsTrigger value="categories">品类</TabsTrigger>
          <TabsTrigger value="payments">支付物流</TabsTrigger>
          <TabsTrigger value="compliance">合规与政策</TabsTrigger>
          <TabsTrigger value="traffic">流量经济</TabsTrigger>
          <TabsTrigger value="china">中国卖家</TabsTrigger>
          <TabsTrigger value="recommend">入市建议</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab data={data} />
        </TabsContent>
        <TabsContent value="platforms">
          <PlatformsTab data={data} />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab data={data} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsLogisticsTab data={data} />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab data={data} />
        </TabsContent>
        <TabsContent value="traffic">
          <TrafficTab data={data} />
        </TabsContent>
        <TabsContent value="china">
          <ChinaSellerTab data={data} />
        </TabsContent>
        <TabsContent value="recommend">
          <RecommendationTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { iso } = await params;
  const meta = getCountryMeta(iso.toUpperCase());
  if (!meta) return { title: "国家未找到 · Hachimi" };
  return {
    title: `${meta.name_zh} · Hachimi 全球电商研究`,
    description: `${meta.name_zh} (${meta.name_en}) 电商市场全景：平台、品类、支付物流、合规与政策、入市建议。`,
  };
}
