import type { CountryData } from "@/types";
import { SourceBadge, PendingBadge } from "@/components/SourceBadge";
import { formatPct, formatUsdMillions, formatNumber } from "@/lib/utils";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";

const PLATFORM_TYPE_LABEL: Record<string, string> = {
  marketplace: "Marketplace",
  dtc_aggregator: "DTC 聚合",
  social_commerce: "社交电商",
  vertical_specialist: "垂直平台",
};

export function PlatformsTab({ data }: { data: CountryData }) {
  const platforms = [...data.platforms].sort((a, b) => {
    const ra = a.metrics_2024?.rank_in_country ?? 99;
    const rb = b.metrics_2024?.rank_in_country ?? 99;
    return ra - rb;
  });

  if (platforms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-dim)]">
        <PendingBadge /> 平台数据待补
      </div>
    );
  }

  // Sorted GMV ranking chart
  const gmvRows: BenchmarkRow[] = platforms
    .filter((p) => p.metrics_2024?.gmv_usd_million != null)
    .map((p) => ({
      iso: p.platform_code,
      label: p.name,
      value: p.metrics_2024?.gmv_usd_million ?? 0,
    }));

  return (
    <div className="space-y-6">
    {gmvRows.length > 1 && (
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-base font-semibold">平台市场容量排名</h3>
          <span className="text-[11px] text-[var(--color-text-dim)]">
            GMV 2024 · 高→低
          </span>
        </div>
        <BenchmarkChart
          rows={gmvRows}
          title="平台 GMV 2024 (M USD)"
          format={{ millionsToBillions: true, decimals: 2 }}
        />
      </section>
    )}

    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-2)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
          <tr>
            <th className="px-4 py-3 text-left">平台</th>
            <th className="px-4 py-3 text-left">类型</th>
            <th className="px-4 py-3 text-right">GMV 2024</th>
            <th className="px-4 py-3 text-right">市占</th>
            <th className="px-4 py-3 text-right">月访</th>
            <th className="px-4 py-3 text-right">抽佣</th>
            <th className="px-4 py-3 text-right">中国卖家份额</th>
            <th className="px-4 py-3 text-left">物流模式</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p) => {
            const m = p.metrics_2024;
            return (
              <tr
                key={p.platform_code}
                className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-[var(--color-text)]">
                    {m?.rank_in_country ? `${m.rank_in_country}.` : ""} {p.name}
                  </div>
                  {p.parent_company && (
                    <div className="text-[11px] text-[var(--color-text-dim)]">
                      {p.parent_company}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-dim)]">
                  {PLATFORM_TYPE_LABEL[p.platform_type] ?? p.platform_type}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    {formatUsdMillions(m?.gmv_usd_million)}
                    {m?.source_metadata?.gmv_usd_million && (
                      <SourceBadge
                        source={m.source_metadata.gmv_usd_million}
                        label={`${p.name} GMV`}
                      />
                    )}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{
                    color:
                      (m?.market_share_pct ?? 0) > 25
                        ? "var(--color-primary)"
                        : undefined,
                  }}
                >
                  {formatPct(m?.market_share_pct)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-dim)]">
                  {m?.traffic_monthly_million != null
                    ? `${formatNumber(m.traffic_monthly_million, { decimals: 1 })}M`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-dim)]">
                  <span className="inline-flex items-center gap-1">
                    {formatPct(m?.commission_rate_pct)}
                    {m?.source_metadata?.commission_rate_pct && (
                      <SourceBadge
                        source={m.source_metadata.commission_rate_pct}
                        label="抽佣"
                      />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    {formatPct(m?.chinese_seller_share_pct)}
                    {m?.source_metadata?.chinese_seller_share_pct && (
                      <SourceBadge
                        source={m.source_metadata.chinese_seller_share_pct}
                        label="中国卖家份额"
                      />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-text-dim)]">
                  {m?.fulfillment_fee_model ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}
