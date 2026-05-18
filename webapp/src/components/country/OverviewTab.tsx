"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CountryData } from "@/types";
import { SourceBadge, HachimiDerivedBadge, PendingBadge, EstimateBadge } from "@/components/SourceBadge";
import { formatPct, formatUsdMillions, formatNumber } from "@/lib/utils";

function FlagEmoji({ name }: { name: string }) {
  const map: Record<string, string> = {
    China: "🇨🇳",
    Germany: "🇩🇪",
    "United Kingdom": "🇬🇧",
    USA: "🇺🇸",
    "United States": "🇺🇸",
    France: "🇫🇷",
    Poland: "🇵🇱",
  };
  return <span>{map[name] ?? name}</span>;
}

export function OverviewTab({ data }: { data: CountryData }) {
  const market2024 =
    data.ecommerce_market.find((m) => m.year === 2024) ?? data.ecommerce_market[0];
  const score = data.hachimi_scores;

  const chartData = data.ecommerce_market
    .filter((m) => m.gmv_total_usd_million != null)
    .map((m) => ({
      year: m.year,
      gmv: m.gmv_total_usd_million ?? 0,
    }))
    .sort((a, b) => a.year - b.year);

  // Data completeness progress bar
  const overallStr = data._data_completeness?.overall;
  const overallPct = overallStr
    ? parseInt(overallStr.replace(/[^0-9]/g, ""), 10)
    : null;

  return (
    <div className="space-y-8">
      {overallPct != null && Number.isFinite(overallPct) && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold">数据完整度</span>
            <span className="tabular-nums text-[var(--color-text-dim)]">
              {overallPct}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, Math.min(100, overallPct))}%`,
                background:
                  overallPct >= 80
                    ? "var(--color-primary)"
                    : overallPct >= 50
                      ? "#f59e0b"
                      : "#dc2626",
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-[var(--color-text-dim)]">
            数据来自{" "}
            <code className="rounded bg-[var(--color-bg-from)] px-1">
              _data_completeness
            </code>
            。Top SKU 等字段待 SellerSprite + Apify 抓取后补全。
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Hachimi 综合评分"
          value={
            score.composite_score != null
              ? score.composite_score.toFixed(0)
              : "—"
          }
          suffix="/100"
          accent="var(--color-primary)"
          extra={
            score.recommended_entry_mode &&
            score.recommended_entry_mode !== "skip" ? (
              <span className="text-xs text-[var(--color-primary)]">
                ↑ 推荐 · {score._version}
              </span>
            ) : null
          }
          rightSlot={<HachimiDerivedBadge />}
        />
        <KpiCard
          label="电商 GMV 2024"
          valueExtra={
            market2024?.source_metadata?.gmv_total_usd_million?.confidence === "L" ? (
              <EstimateBadge reason="GMV 为估算（confidence=L）" />
            ) : null
          }
          value={formatUsdMillions(market2024?.gmv_total_usd_million)}
          extra={
            market2024?.cagr_2025_2030_pct != null ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)]">
                ↑ CAGR {market2024.cagr_2025_2030_pct.toFixed(1)}% (2025-2030)
                {market2024.source_metadata?.cagr_2025_2030_pct?.confidence === "L" && (
                  <EstimateBadge reason="CAGR 数据为估算（confidence=L）" />
                )}
              </span>
            ) : null
          }
          rightSlot={
            market2024?.source_metadata?.gmv_total_usd_million ? (
              <SourceBadge
                source={market2024.source_metadata.gmv_total_usd_million}
                label="电商 GMV 2024"
                size="md"
              />
            ) : null
          }
        />
        <KpiCard
          label="在线买家 / 人均支出"
          valueExtra={
            market2024?.source_metadata?.online_buyers_million?.confidence === "L" ? (
              <EstimateBadge reason="在线买家数为估算（confidence=L）" />
            ) : null
          }
          value={
            market2024?.online_buyers_million != null
              ? `${market2024.online_buyers_million.toFixed(1)}M`
              : "—"
          }
          extra={
            market2024?.per_capita_spend_usd != null ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
                ${formatNumber(market2024.per_capita_spend_usd, { decimals: 0 })}{" "}
                / buyer / year
                {market2024.source_metadata?.per_capita_spend_usd?.confidence === "L" && (
                  <EstimateBadge reason="人均支出为估算（confidence=L）" />
                )}
              </span>
            ) : null
          }
          rightSlot={
            market2024?.source_metadata?.online_buyers_million ? (
              <SourceBadge
                source={market2024.source_metadata.online_buyers_million}
                label="在线买家"
                size="md"
              />
            ) : null
          }
        />
        <KpiCard
          label="跨境占比"
          valueExtra={
            market2024?.source_metadata?.cross_border_share_pct?.confidence === "L" ? (
              <EstimateBadge reason="跨境占比为估算（confidence=L）" />
            ) : null
          }
          value={formatPct(market2024?.cross_border_share_pct, 0)}
          accent="#f59e0b"
          extra={
            market2024?.top_cross_border_origin_countries &&
            market2024.top_cross_border_origin_countries.length > 0 ? (
              <span className="text-xs text-[var(--color-text-dim)]">
                主要来源：{" "}
                {market2024.top_cross_border_origin_countries.slice(0, 4).map((c, i) => (
                  <span key={c} className="ml-0.5">
                    <FlagEmoji name={c} />
                    {i < 3 ? " " : ""}
                  </span>
                ))}
              </span>
            ) : null
          }
          rightSlot={
            market2024?.source_metadata?.cross_border_share_pct ? (
              <SourceBadge
                source={market2024.source_metadata.cross_border_share_pct}
                label="跨境占比"
                size="md"
              />
            ) : null
          }
        />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">
            电商 GMV 预测 · {chartData[0]?.year ?? "—"} – {chartData[chartData.length - 1]?.year ?? "—"}
          </h2>
          <span className="text-xs text-[var(--color-text-dim)]">
            数据源：Statista Digital Market Outlook
          </span>
        </div>
        {chartData.length > 0 ? (
          <div className="h-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="#2a335a" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="#7a86b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#7a86b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}B`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#131a36",
                    border: "1px solid #2a335a",
                    borderRadius: 8,
                  }}
                  formatter={(v) => {
                    const num = typeof v === "number" ? v : Number(v ?? 0);
                    return [`$${(num / 1000).toFixed(2)}B`, "GMV"];
                  }}
                />
                <Bar dataKey="gmv" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-dim)]">
            <PendingBadge reason="无 ecommerce_market 数据点" />
            <div className="mt-2">电商市场体量数据待补</div>
          </div>
        )}
      </section>

      {data._notes && (
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-dim)]">
          <div className="text-xs font-semibold text-[var(--color-text)]">备注</div>
          <div className="mt-1">{data._notes}</div>
        </section>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  accent,
  extra,
  rightSlot,
  valueExtra,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: string;
  extra?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** Small slot rendered to the right of the big number — for badges. */
  valueExtra?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
          {label}
        </span>
        {rightSlot}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color: accent ?? "var(--color-text)" }}
        >
          {value}
        </span>
        {suffix && <span className="text-sm text-[var(--color-text-dim)]">{suffix}</span>}
        {valueExtra}
      </div>
      <div className="mt-2 min-h-[16px]">{extra}</div>
    </div>
  );
}
