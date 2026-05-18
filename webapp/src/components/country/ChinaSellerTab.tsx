import type { CountryData } from "@/types";
import { PendingBadge, EstimateBadge } from "@/components/SourceBadge";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAvailableCountryIsos,
  getCountryData,
  getAllCountries,
} from "@/lib/data";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";

const INTENSITY_STYLE: Record<string, string> = {
  low: "text-emerald-300 bg-emerald-500/15 ring-emerald-400/30",
  medium: "text-amber-300 bg-amber-500/15 ring-amber-400/30",
  high: "text-orange-300 bg-orange-500/15 ring-orange-400/30",
  extreme: "text-red-300 bg-red-500/15 ring-red-400/30",
};

const TREND_ICON: Record<string, React.ReactNode> = {
  rising: <TrendingUp className="size-3.5 text-emerald-300" />,
  declining: <TrendingDown className="size-3.5 text-red-300" />,
  stable: <Minus className="size-3.5 text-[var(--color-text-dim)]" />,
};

export function ChinaSellerTab({ data }: { data: CountryData }) {
  const iso = data.country.iso_alpha3;
  const allCountries = getAllCountries();

  // Build a 32-country benchmark: max Top100 China count across each country's platforms
  const top100Rows: BenchmarkRow[] = [];
  const top1000Rows: BenchmarkRow[] = [];
  for (const i of getAvailableCountryIsos()) {
    const d = getCountryData(i);
    if (!d) continue;
    const csd = d.china_seller_density ?? [];
    const top100 = Math.max(0, ...csd.map((c) => c.top100_china_count ?? 0));
    const top1000 = Math.max(0, ...csd.map((c) => c.top1000_china_count ?? 0));
    const c = allCountries.find((c) => c.iso_alpha3 === i);
    const label = `${c?.flag_emoji ?? ""} ${c?.name_zh ?? i}`;
    if (top100 > 0) top100Rows.push({ iso: i, label, value: top100 });
    if (top1000 > 0) top1000Rows.push({ iso: i, label, value: top1000 });
  }

  if (data.china_seller_density.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-dim)]">
          <PendingBadge /> 本国中国卖家密度数据待补
        </div>
        {(top100Rows.length > 0 || top1000Rows.length > 0) && (
          <Benchmark32 top100Rows={top100Rows} top1000Rows={top1000Rows} iso={iso} />
        )}
      </div>
    );
  }

  // Build a quick name lookup from platforms
  const platformNames = new Map(
    data.platforms.map((p) => [p.platform_code, p.name]),
  );

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.china_seller_density.map((d) => (
        <div
          key={d.platform_code}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-baseline justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              {platformNames.get(d.platform_code) ?? d.platform_code}
              <span className="text-xs font-normal text-[var(--color-text-dim)]">
                {d.year}
              </span>
              {d.confidence === "L" && (
                <EstimateBadge reason="该平台的中国卖家数据为估算（confidence=L · 爬虫/类比国推断）" />
              )}
            </h3>
            {d.chinese_pl_competition_intensity && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                  INTENSITY_STYLE[d.chinese_pl_competition_intensity],
                )}
              >
                竞争 {d.chinese_pl_competition_intensity}
              </span>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Stat
              label="Top 100 中国卖家数"
              value={d.top100_china_count?.toString() ?? "—"}
            />
            <Stat
              label="Top 1000 中国卖家数"
              value={d.top1000_china_count?.toString() ?? "—"}
            />
          </dl>

          {d.trend_yoy && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
              {TREND_ICON[d.trend_yoy]}
              <span>YoY 趋势：{d.trend_yoy}</span>
            </div>
          )}

          {d.notable_chinese_sellers && d.notable_chinese_sellers.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                代表性中国卖家
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {d.notable_chinese_sellers.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 px-2 py-0.5 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {d.notes && (
            <p className="mt-3 rounded-md bg-[var(--color-bg-from)]/40 p-2.5 text-xs text-[var(--color-text-dim)]">
              {d.notes}
            </p>
          )}

          {d.source_url && (
            <a
              href={
                d.source_url.startsWith("http") ? d.source_url : undefined
              }
              target={d.source_url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={cn(
                "mt-3 inline-flex items-center gap-1 text-[11px]",
                d.source_url.startsWith("http")
                  ? "text-[var(--color-primary)] hover:underline"
                  : "text-[var(--color-text-dim)]",
              )}
            >
              <ExternalLink className="size-3" /> {d.source_url}
            </a>
          )}
        </div>
      ))}
    </div>

    {(top100Rows.length > 1 || top1000Rows.length > 1) && (
      <Benchmark32 top100Rows={top100Rows} top1000Rows={top1000Rows} iso={iso} />
    )}
    </div>
  );
}

function Benchmark32({
  top100Rows,
  top1000Rows,
  iso,
}: {
  top100Rows: BenchmarkRow[];
  top1000Rows: BenchmarkRow[];
  iso: string;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">中国卖家密度 · 横向对比</h3>
        <span className="text-[11px] text-[var(--color-text-dim)]">
          当前国 emerald 高亮
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
        取每国所有平台中"Top X 中国卖家数"的最大值（通常是 Allegro / Amazon /
        本地领头平台）。竞争密度越高，中国卖家进入难度越大。
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BenchmarkChart
          rows={top100Rows}
          highlightIso={iso}
          title="Top 100 卖家中的中国卖家数"
          format={{ decimals: 0 }}
          height={Math.max(360, top100Rows.length * 16)}
        />
        <BenchmarkChart
          rows={top1000Rows}
          highlightIso={iso}
          title="Top 1000 卖家中的中国卖家数"
          format={{ decimals: 0 }}
          height={Math.max(360, top1000Rows.length * 16)}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-bg-from)]/40 px-3 py-2">
      <div className="text-[11px] text-[var(--color-text-dim)]">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
