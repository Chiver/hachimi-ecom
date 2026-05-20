import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Country, GeopoliticalRisk } from "@/types";
import { formatNumber } from "@/lib/utils";
import { GeopoliticalRiskBadge } from "./GeopoliticalRiskBadge";

type Props = {
  country: Country;
  population?: number | null;
  gdp_usd_billion?: number | null;
  geopoliticalRisk?: GeopoliticalRisk;
};

export function CountryHeader({
  country,
  population,
  gdp_usd_billion,
  geopoliticalRisk,
}: Props) {
  return (
    <header className="border-b border-[var(--color-border)] pb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="size-3" />
        返回全球地图
      </Link>
      <div className="mt-3 flex items-end gap-5">
        <div className="text-6xl leading-none">{country.flag_emoji}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {country.name_zh}
            <span className="ml-3 text-2xl font-normal text-[var(--color-text-dim)]">
              {country.name_en}
            </span>
          </h1>
          <div className="mt-1 text-sm text-[var(--color-text-dim)]">
            {country.region}
            {country.sub_region ? ` · ${country.sub_region}` : ""} ·{" "}
            {country.is_eu ? "欧盟成员" : "非欧盟"} · {country.currency_code}
            {population != null && ` · 人口 ${formatNumber(population / 1_000_000, { decimals: 1 })}M`}
            {gdp_usd_billion != null &&
              ` · GDP $${formatNumber(gdp_usd_billion, { decimals: 1 })}B`}
            {country.sanctions_status && country.sanctions_status !== "none" && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-300 ring-1 ring-inset ring-red-400/40">
                制裁状态：{country.sanctions_status}
              </span>
            )}
          </div>
          {geopoliticalRisk && (
            <div className="mt-2">
              <GeopoliticalRiskBadge
                level={geopoliticalRisk.overall_level}
                headline={geopoliticalRisk.headline}
                size="md"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/compare?selected=${country.iso_alpha3}`}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          >
            对比国家
          </Link>
          <Link
            href={`/timeline?country=${country.iso_alpha3}`}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          >
            政策时间轴
          </Link>
        </div>
      </div>
    </header>
  );
}
