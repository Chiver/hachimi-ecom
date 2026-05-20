"use client";

import type { Country } from "@/types";
import type { CountryScoreSummary } from "@/lib/scores";
import { formatUsdMillions, formatPct, formatNumber } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { MetricKey } from "@/lib/metrics";

const EST_BADGE_TITLE: Record<string, string> = {
  L: "估算（confidence=L · 爬虫/推算/类比国推断）",
  M: "二手数据（confidence=M · 付费报告/行业研报）",
};

const CHANNEL_LABEL: Record<string, string> = {
  meta: "Meta",
  google_search: "Google",
  google_display: "Google Display",
  tiktok: "TikTok",
  amazon_ppc: "Amazon",
  kakao: "Kakao",
  naver_search: "Naver",
  vk_ads: "VK Ads",
  yahoo_search: "Yahoo",
  yandex_search: "Yandex",
};

/** Tiny inline "估算" pill — used in hover panel where space is tight. */
function ConfPill({ conf }: { conf?: "H" | "M" | "L" }) {
  if (!conf || conf === "H") return null;
  const isL = conf === "L";
  return (
    <span
      title={EST_BADGE_TITLE[conf]}
      className={cn(
        "ml-1 inline-flex items-center rounded-full px-1 py-[1px] text-[9px] font-medium ring-1 ring-inset",
        isL
          ? "bg-[var(--color-surface-2)] text-[var(--color-text-dim)] ring-[var(--color-border)]"
          : "bg-amber-500/10 text-amber-300/90 ring-amber-400/20",
      )}
    >
      {isL ? "估算" : "二手"}
    </span>
  );
}

type Props = {
  country: Country;
  summary: CountryScoreSummary | null;
  activeMetric?: MetricKey;
};

export function HoverPanel({ country, summary, activeMetric }: Props) {
  const hasData = summary !== null;
  const score = summary?.composite_score ?? null;
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 w-[260px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 text-sm shadow-xl backdrop-blur-md">
      <div className="flex items-baseline gap-2">
        <span className="text-xl">{country.flag_emoji}</span>
        <h3 className="text-lg font-semibold tracking-tight">{country.name_zh}</h3>
        <span className="text-xs text-[var(--color-text-dim)]">{country.name_en}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--color-text-dim)]">
        {country.region} · {country.is_eu ? "欧盟" : "非欧盟"} · {country.currency_code}
      </div>

      {summary?.geo_risk_level && (
        <div
          className={cn(
            "mt-2 rounded-md border px-2 py-1.5",
            summary.geo_risk_level === "extreme" && "border-red-400/50 bg-red-500/15",
            summary.geo_risk_level === "high" && "border-red-400/30 bg-red-500/10",
            summary.geo_risk_level === "medium" && "border-amber-400/30 bg-amber-500/10",
            summary.geo_risk_level === "low" && "border-emerald-400/30 bg-emerald-500/10",
          )}
        >
          <div
            className={cn(
              "text-[9px] uppercase tracking-wider font-semibold",
              summary.geo_risk_level === "extreme" && "text-red-200",
              summary.geo_risk_level === "high" && "text-red-300",
              summary.geo_risk_level === "medium" && "text-amber-300",
              summary.geo_risk_level === "low" && "text-emerald-300",
            )}
          >
            地缘政治：
            {summary.geo_risk_level === "extreme"
              ? "极端风险"
              : summary.geo_risk_level === "high"
                ? "高风险"
                : summary.geo_risk_level === "medium"
                  ? "中等风险"
                  : "低风险"}
          </div>
          {summary.geo_risk_headline && (
            <div className="mt-0.5 text-[10px] leading-tight">
              {summary.geo_risk_headline}
            </div>
          )}
        </div>
      )}

      {hasData ? (
        <>
          <div
            className={cn(
              "mt-3 rounded-lg bg-[var(--color-bg-from)]/70 p-3 ring-1 transition-colors",
              activeMetric === "composite_score"
                ? "ring-[var(--color-primary)]/60"
                : "ring-transparent",
            )}
          >
            <div className="text-[11px] text-[var(--color-text-dim)]">
              Hachimi 综合评分
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span
                className="text-3xl font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {score !== null ? score.toFixed(0) : "—"}
              </span>
              <span className="text-xs text-[var(--color-text-dim)]">/100</span>
              {summary?.recommended_entry_mode &&
                summary.recommended_entry_mode !== "skip" && (
                  <span className="ml-auto text-[10px] text-[var(--color-primary)]">
                    ↑ 推荐
                  </span>
                )}
            </div>
          </div>

          <dl className="mt-3 space-y-1.5">
            <Row
              label="电商 GMV (2024)"
              value={formatUsdMillions(summary?.gmv_total_usd_million)}
              active={activeMetric === "gmv_total_usd_million"}
              confidence={summary?.confidence.gmv_total_usd_million}
            />
            <Row
              label="CAGR 25-30"
              value={formatPct(summary?.cagr_2025_2030_pct, 1)}
              accent={
                summary?.cagr_2025_2030_pct && summary.cagr_2025_2030_pct > 0
                  ? "var(--color-primary)"
                  : undefined
              }
              active={activeMetric === "cagr_2025_2030_pct"}
              confidence={summary?.confidence.cagr_2025_2030_pct}
            />
            <Row
              label="人均电商支出"
              value={`$${formatNumber(summary?.per_capita_spend_usd, { decimals: 0 })}`}
              active={activeMetric === "per_capita_spend_usd"}
              confidence={summary?.confidence.per_capita_spend_usd}
            />
            <Row
              label="在线买家"
              value={
                summary?.online_buyers_million != null
                  ? `${summary.online_buyers_million.toFixed(1)}M`
                  : "—"
              }
              active={activeMetric === "online_buyers_million"}
              confidence={summary?.confidence.online_buyers_million}
            />
            <Row
              label="跨境占比"
              value={formatPct(summary?.cross_border_share_pct, 0)}
              accent="#f59e0b"
              active={activeMetric === "cross_border_share_pct"}
              confidence={summary?.confidence.cross_border_share_pct}
            />
          </dl>

          {/* Legend if any L-confidence values are present */}
          {summary &&
            Object.values(summary.confidence).some((c) => c === "L") && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--color-text-dim)]">
                <ConfPill conf="L" />
                <span>= 估算值（爬虫 / 类比国推断）</span>
              </div>
            )}

          {summary?.meta_cpm_lebesgue_usd != null && (
            <div className="mt-3 rounded-md border border-blue-400/30 bg-blue-500/5 p-2">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-[var(--color-text-dim)]">
                  Meta CPM
                </span>
                <span
                  className="rounded-full bg-blue-500/15 px-1.5 py-[1px] text-[9px] font-medium text-blue-300 ring-1 ring-inset ring-blue-400/30"
                  title="Lebesgue 2026 Facebook Ads CPM by Country · 第三方独立基准"
                >
                  Lebesgue &apos;26
                </span>
              </div>
              <div className="mt-0.5 text-base font-bold tabular-nums">
                ${summary.meta_cpm_lebesgue_usd.toFixed(2)}
              </div>
            </div>
          )}

          {summary?.traffic && summary.traffic.length > 0 && (
            <div className="mt-3">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-[var(--color-text-dim)]">
                  广告成本（CPM / CPC）· Hachimi
                </span>
                {summary.traffic.some((t) => t.estimated) && (
                  <span
                    className="rounded-full bg-[var(--color-surface-2)] px-1 py-[1px] text-[9px] font-medium text-[var(--color-text-dim)] ring-1 ring-inset ring-[var(--color-border)]"
                    title="全部或部分为 Hachimi 全球基准外推（非本地实测）"
                  >
                    估算
                  </span>
                )}
              </div>
              <ul className="mt-1 space-y-0.5">
                {summary.traffic.map((t) => (
                  <li
                    key={t.channel}
                    className="flex items-baseline justify-between gap-2 text-[11px]"
                  >
                    <span className="text-[var(--color-text-dim)]">
                      {CHANNEL_LABEL[t.channel] ?? t.channel}
                    </span>
                    <span className="font-medium tabular-nums">
                      {t.cpm_usd != null ? `$${t.cpm_usd.toFixed(2)}` : "—"}
                      <span className="mx-1 text-[var(--color-text-dim)]">/</span>
                      {t.cpc_usd != null ? `$${t.cpc_usd.toFixed(2)}` : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary?.recommended_categories && summary.recommended_categories.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] text-[var(--color-text-dim)]">推荐品类</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {summary.recommended_categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-[var(--color-primary)]/20 px-2 py-0.5 text-[11px]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {categoryLabel(cat)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 py-2 text-center text-xs text-[var(--color-primary)]">
            点击进入详情页 →
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-bg-from)]/40 p-3 text-center text-xs text-[var(--color-text-dim)]">
          <div>数据待补</div>
          <div className="mt-1 text-[10px]">点击查看占位页</div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  active,
  confidence,
}: {
  label: string;
  value: string;
  accent?: string;
  active?: boolean;
  confidence?: "H" | "M" | "L";
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-2 rounded-md px-2 py-1 -mx-2 transition-colors",
        active
          ? "bg-[var(--color-primary)]/15 ring-1 ring-inset ring-[var(--color-primary)]/30"
          : "",
      )}
    >
      <span className="text-[11px] text-[var(--color-text-dim)]">{label}</span>
      <span className="flex items-baseline gap-0">
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: active ? "var(--color-primary)" : accent ?? "var(--color-text)" }}
        >
          {value}
        </span>
        <ConfPill conf={confidence} />
      </span>
    </div>
  );
}
