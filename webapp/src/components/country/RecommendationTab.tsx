"use client";

import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { CountryData, BrandFitEntry } from "@/types";
import { HachimiDerivedBadge, PendingBadge } from "@/components/SourceBadge";
import { categoryLabel } from "@/lib/categories";
import { Sparkles, Compass, ChevronDown, Star, StarHalf, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreFormulaPanel } from "./ScoreFormulaPanel";
import { BrandFitFormulaPanel } from "./BrandFitFormulaPanel";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";
import { getAllCountries, getBrandFit } from "@/lib/data";
import { getCountryScoreSummaries } from "@/lib/scores";
import { computeBrandFit } from "@/lib/brand-fit";
import { GeopoliticalRiskSection } from "./GeopoliticalRiskSection";

const ENTRY_MODE_LABEL: Record<string, { title: string; desc: string }> = {
  direct_dropship: {
    title: "直邮模式",
    desc: "无海外仓库，从国内直接发货。轻资产但时效慢。",
  },
  fba_only: {
    title: "FBA 优先",
    desc: "亚马逊 FBA 仓储+配送，Pan-EU 可一站覆盖多国。",
  },
  overseas_warehouse: {
    title: "海外仓模式",
    desc: "自营或第三方海外仓，时效快、可控性高。",
  },
  local_entity: {
    title: "本地实体",
    desc: "注册本地公司，深度本地化运营。",
  },
  skip: { title: "暂不进入", desc: "Hachimi 综合评估认为当前阶段不推荐进入。" },
};

export function RecommendationTab({ data }: { data: CountryData }) {
  const score = data.hachimi_scores;
  const iso = data.country.iso_alpha3;

  // ---- 品牌化适配评分（运行时模型） ----
  const summaries = getCountryScoreSummaries();
  const allCountries = getAllCountries();
  const summary = summaries[iso];
  const brandFit = summary ? computeBrandFit(summary, iso) : null;
  const bf = getBrandFit(iso);

  // 32 国品牌化适配评分横向对比（只取数据充分的国家）
  const brandFitBenchmark: BenchmarkRow[] = [];
  for (const [i, s] of Object.entries(summaries)) {
    const bf = computeBrandFit(s, i);
    if (bf.composite != null) {
      const c = allCountries.find((c) => c.iso_alpha3 === i);
      brandFitBenchmark.push({
        iso: i,
        label: `${c?.flag_emoji ?? ""} ${c?.name_zh ?? i}`,
        value: bf.composite,
      });
    }
  }

  const radarData =
    brandFit?.dimensions.map((d) => ({
      axis: d.label,
      value: d.value ?? 0,
    })) ?? [];

  const entry = score.recommended_entry_mode
    ? ENTRY_MODE_LABEL[score.recommended_entry_mode]
    : null;

  return (
    <div className="space-y-6">
      {/* Geopolitical risk — placed at the TOP because it's a kill-switch
          consideration before any other recommendation has meaning. */}
      {data.geopolitical_risk && (
        <GeopoliticalRiskSection risk={data.geopolitical_risk} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Compass className="size-4 text-[var(--color-primary)]" />
              品牌化适配评分维度
            </h3>
            <HachimiDerivedBadge />
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            围绕品牌化 + 差异化高端选品战略，四维均衡（各 25%）：DTC 渠道适配 / 品牌溢价空间 /
            视频·社媒契合 / 流量成本效率
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a335a" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "#b4bce3", fontSize: 12 }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {brandFit?.dimensions.map((d) => (
              <Dim key={d.key} label={d.label} value={d.value} partial={d.partial} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-[var(--color-primary)]" />
            品牌化适配评分
          </h3>
          <div className="mt-3 text-5xl font-bold tabular-nums text-[var(--color-primary)]">
            {brandFit?.composite != null ? brandFit.composite.toFixed(0) : "—"}
            <span className="ml-1 text-base font-normal text-[var(--color-text-dim)]">
              /100
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            {brandFit?.composite != null
              ? `运行时模型 v1 · 用 ${brandFit.availableDimCount}/4 维度`
              : "数据不足（可得维度 < 3），待补 DTC / Luxury / CPM"}
          </div>
          {entry && (
            <div className="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
                推荐入市模式
              </div>
              <div className="mt-0.5 text-base font-semibold">{entry.title}</div>
              <div className="mt-1 text-xs text-[var(--color-text-dim)]">
                {entry.desc}
              </div>
            </div>
          )}
          {score.recommended_categories && score.recommended_categories.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                推荐品类
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {score.recommended_categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                  >
                    {categoryLabel(c)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 选国决策表 · 人工品牌化适配评级与理由 */}
      {bf?.adaptation_rating != null && <DecisionTablePanel bf={bf} />}

      {/* 新模型公式说明 */}
      {brandFit && <BrandFitFormulaPanel result={brandFit} />}

      {/* 32 国品牌化适配评分横向对比 */}
      {brandFitBenchmark.length > 1 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-semibold">品牌化适配评分横向对比</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              {brandFitBenchmark.length} 国有足够数据 · 当前国 emerald 高亮
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            按品牌化适配评分排序（四维均衡）。数据不足 (&lt; 3 维) 的国家未纳入；
            构成方式见上方「品牌化适配评分计算方法」折叠面板。
          </p>
          <div className="mt-3">
            <BenchmarkChart
              rows={brandFitBenchmark}
              highlightIso={iso}
              title="品牌化适配评分 (0-100)"
              format={{ decimals: 0 }}
            />
          </div>
        </section>
      )}

      {/* 旧版 Hachimi 综合评分（市场吸引力/运营/竞争/AI）—— 降为次要参考 */}
      <LegacyScorePanel score={score} />

      {score.rationale && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-base font-semibold">入市理由</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text)]">
            {score.rationale}
          </p>
          {score.methodology_url && (
            <a
              href={
                score.methodology_url.startsWith("http")
                  ? score.methodology_url
                  : undefined
              }
              className="mt-3 inline-block text-xs text-[var(--color-primary)] hover:underline"
            >
              方法论：{score.methodology_url}
            </a>
          )}
        </section>
      )}

      {!brandFit?.sufficient && (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-dim)]">
          <PendingBadge reason="该国 DTC / Luxury / Direct&Brand / CPM 等数据待补" />
          <div className="mt-2">品牌化适配评分数据不足</div>
        </div>
      )}
    </div>
  );
}

/** 旧版四维评分折叠面板（市场吸引力/运营可行性/竞争烈度/AI 杠杆度）。 */
function LegacyScorePanel({
  score,
}: {
  score: CountryData["hachimi_scores"];
}) {
  const [open, setOpen] = useState(false);
  const legacyRadar = [
    { axis: "市场吸引力", value: score.market_attractiveness ?? 0 },
    { axis: "运营可行性", value: score.operational_feasibility ?? 0 },
    {
      axis: "竞争空间",
      value: score.competition_intensity != null ? 100 - score.competition_intensity : 0,
    },
    { axis: "AI 杠杆度", value: score.ai_leverage_potential ?? 0 },
  ];
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-5 py-3 text-left hover:bg-[var(--color-surface-2)]"
      >
        <span className="text-sm font-semibold">
          旧版 Hachimi 综合评分（市场吸引力 / 运营 / 竞争 / AI · 参考)
          {score.composite_score != null && (
            <span className="ml-2 text-[var(--color-text-dim)]">
              {score.composite_score.toFixed(0)}/100
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[var(--color-text-dim)] transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-[var(--color-border)] p-5">
          <p className="text-[11px] text-[var(--color-text-dim)]">
            旧版模型（schema v1）以市场吸引力/运营/竞争/AI 加权，未纳入品牌化战略维度，
            现保留作横向参考。当前主用上方的品牌化适配评分。
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={legacyRadar}>
                <PolarGrid stroke="#2a335a" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "#b4bce3", fontSize: 12 }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#7a86b8"
                  fill="#7a86b8"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Dim label="市场吸引力" value={score.market_attractiveness} />
            <Dim label="运营可行性" value={score.operational_feasibility} />
            <Dim
              label="竞争烈度 (反向)"
              value={
                score.competition_intensity != null
                  ? 100 - score.competition_intensity
                  : null
              }
            />
            <Dim label="AI 杠杆度" value={score.ai_leverage_potential} />
          </div>
          <ScoreFormulaPanel score={score} />
        </div>
      )}
    </div>
  );
}

/** 资源分层 → 颜色。 */
function tierClasses(tier?: string): string {
  if (!tier) return "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]";
  if (tier.startsWith("P0")) return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  if (tier.startsWith("P1")) return "border-sky-400/40 bg-sky-500/15 text-sky-300";
  if (tier.startsWith("P2")) return "border-amber-400/40 bg-amber-500/15 text-amber-300";
  if (tier.includes("谨慎") || tier.includes("特殊")) return "border-amber-400/40 bg-amber-500/15 text-amber-300";
  if (tier.includes("暂缓")) return "border-rose-400/40 bg-rose-500/15 text-rose-300";
  return "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]";
}

/** 选国决策表的人工品牌化适配评级（1-5 ★）+ Tier + 推荐打法 + 核心理由。 */
function DecisionTablePanel({ bf }: { bf: BrandFitEntry }) {
  const rating = bf.adaptation_rating ?? 0;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Target className="size-4 text-[var(--color-primary)]" />
          选国决策表 · 品牌化适配评级
        </h3>
        <span className="text-[11px] text-[var(--color-text-dim)]">
          人工研究评定 · 来源 选国决策表
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              if (i < full)
                return <Star key={i} className="size-5 fill-amber-400 text-amber-400" />;
              if (i === full && hasHalf)
                return <StarHalf key={i} className="size-5 fill-amber-400 text-amber-400" />;
              return <Star key={i} className="size-5 text-[var(--color-text-dim)]/40" />;
            })}
          </span>
          <span className="ml-1 text-lg font-bold tabular-nums">
            {rating} <span className="text-sm font-normal text-[var(--color-text-dim)]">/ 5</span>
          </span>
        </div>
        {bf.tier && (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium",
              tierClasses(bf.tier),
            )}
          >
            {bf.tier}
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {bf.play && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/50 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              推荐打法
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{bf.play}</dd>
          </div>
        )}
        {bf.reason && (
          <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
              核心理由
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{bf.reason}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function Dim({
  label,
  value,
  partial,
}: {
  label: string;
  value: number | null | undefined;
  partial?: boolean;
}) {
  return (
    <div className="rounded-md bg-[var(--color-bg-from)]/50 px-3 py-2">
      <div className="text-[10px] text-[var(--color-text-dim)]">
        {label}
        {partial && <span className="ml-1 text-amber-300">估</span>}
      </div>
      <div className="mt-0.5 text-lg font-bold tabular-nums">
        {value != null ? value.toFixed(0) : "—"}
      </div>
    </div>
  );
}
