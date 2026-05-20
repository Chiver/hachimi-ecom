"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { CountryData } from "@/types";
import { HachimiDerivedBadge, PendingBadge } from "@/components/SourceBadge";
import { categoryLabel } from "@/lib/categories";
import { Sparkles, Compass } from "lucide-react";
import { ScoreFormulaPanel } from "./ScoreFormulaPanel";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";
import { getAvailableCountryIsos, getCountryData, getAllCountries } from "@/lib/data";
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

  // Build a 32-country benchmark for composite_score
  const allCountries = getAllCountries();
  const compositeBenchmark: BenchmarkRow[] = [];
  for (const i of getAvailableCountryIsos()) {
    const d = getCountryData(i);
    const v = d?.hachimi_scores.composite_score;
    if (v != null && Number.isFinite(v)) {
      const c = allCountries.find((c) => c.iso_alpha3 === i);
      compositeBenchmark.push({
        iso: i,
        label: `${c?.flag_emoji ?? ""} ${c?.name_zh ?? i}`,
        value: v,
      });
    }
  }

  const radarData = [
    { axis: "市场吸引力", value: score.market_attractiveness ?? 0 },
    { axis: "运营可行性", value: score.operational_feasibility ?? 0 },
    {
      axis: "竞争空间",
      value:
        score.competition_intensity != null
          ? 100 - score.competition_intensity
          : 0,
    },
    { axis: "AI 杠杆度", value: score.ai_leverage_potential ?? 0 },
  ];

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
              Hachimi 评分维度
            </h3>
            <HachimiDerivedBadge />
          </div>
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
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-[var(--color-primary)]" />
            综合评分
          </h3>
          <div className="mt-3 text-5xl font-bold tabular-nums text-[var(--color-primary)]">
            {score.composite_score != null
              ? score.composite_score.toFixed(0)
              : "—"}
            <span className="ml-1 text-base font-normal text-[var(--color-text-dim)]">
              /100
            </span>
          </div>
          {score._version && (
            <div className="mt-1 text-[11px] text-[var(--color-text-dim)]">
              模型版本：{score._version}
            </div>
          )}
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

      {/* Formula explanation — collapsible */}
      <ScoreFormulaPanel score={score} />

      {/* 32 国 composite score benchmark */}
      {compositeBenchmark.length > 1 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-semibold">综合评分横向对比</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              {compositeBenchmark.length} 国 · 当前国 emerald 高亮
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            分数构成方式见上方"综合评分计算方法"折叠面板。
          </p>
          <div className="mt-3">
            <BenchmarkChart
              rows={compositeBenchmark}
              highlightIso={iso}
              title="Hachimi 综合评分 (0-100)"
              format={{ decimals: 0 }}
            />
          </div>
        </section>
      )}

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

      {!score.composite_score && (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-dim)]">
          <PendingBadge reason="Hachimi 综合评分模型 Phase 4 才正式建模" />
          <div className="mt-2">综合评分待补</div>
        </div>
      )}
    </div>
  );
}

function Dim({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-md bg-[var(--color-bg-from)]/50 px-3 py-2">
      <div className="text-[10px] text-[var(--color-text-dim)]">{label}</div>
      <div className="mt-0.5 text-lg font-bold tabular-nums">
        {value != null ? value.toFixed(0) : "—"}
      </div>
    </div>
  );
}
