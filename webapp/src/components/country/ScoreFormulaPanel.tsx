"use client";

import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import type { HachimiScores } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Hachimi composite-score formula panel (collapsible).
 * Formula from schema.md v1:
 *   composite = market_attractiveness × 0.4
 *             + operational_feasibility × 0.3
 *             + (100 - competition_intensity) × 0.15
 *             + ai_leverage_potential × 0.15
 */
const WEIGHTS = {
  market_attractiveness: 0.4,
  operational_feasibility: 0.3,
  competition_intensity: 0.15, // applied as (100 - x) — inverted
  ai_leverage_potential: 0.15,
} as const;

type Props = {
  score: HachimiScores;
  defaultOpen?: boolean;
};

export function ScoreFormulaPanel({ score, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const ma = score.market_attractiveness ?? null;
  const of = score.operational_feasibility ?? null;
  const ci = score.competition_intensity ?? null;
  const ai = score.ai_leverage_potential ?? null;

  const contrib = {
    market: ma != null ? ma * WEIGHTS.market_attractiveness : null,
    ops: of != null ? of * WEIGHTS.operational_feasibility : null,
    comp: ci != null ? (100 - ci) * WEIGHTS.competition_intensity : null,
    ai: ai != null ? ai * WEIGHTS.ai_leverage_potential : null,
  };

  const reproduced =
    contrib.market != null &&
    contrib.ops != null &&
    contrib.comp != null &&
    contrib.ai != null
      ? contrib.market + contrib.ops + contrib.comp + contrib.ai
      : null;
  const reported = score.composite_score ?? null;
  const matches =
    reproduced != null && reported != null
      ? Math.abs(reproduced - reported) < 0.5
      : null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--color-surface-2)]"
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Calculator className="size-3.5 text-[var(--color-primary)]" />
          综合评分计算方法（schema v1）
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[var(--color-text-dim)] transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--color-border)] px-3 py-3 text-xs">
          <p className="text-[var(--color-text-dim)]">
            综合评分由 4 个 0-100 维度加权得到。竞争烈度（competition_intensity）越低越好，
            所以加权时用 <code className="rounded bg-[var(--color-surface)] px-1">100 − 该值</code> 反向。
          </p>

          <pre className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[11px] leading-relaxed">
{`composite =  市场吸引力 × 0.40
           + 运营可行性 × 0.30
           + (100 − 竞争烈度) × 0.15
           + AI 杠杆度 × 0.15`}
          </pre>

          <div className="overflow-hidden rounded-md border border-[var(--color-border)]">
            <table className="w-full text-[11px]">
              <thead className="bg-[var(--color-surface-2)] text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-2 py-1.5 text-left">维度</th>
                  <th className="px-2 py-1.5 text-right">原始值</th>
                  <th className="px-2 py-1.5 text-right">权重</th>
                  <th className="px-2 py-1.5 text-right">贡献</th>
                </tr>
              </thead>
              <tbody>
                <FormulaRow
                  label="市场吸引力"
                  raw={ma}
                  weight="× 0.40"
                  contribution={contrib.market}
                />
                <FormulaRow
                  label="运营可行性"
                  raw={of}
                  weight="× 0.30"
                  contribution={contrib.ops}
                />
                <FormulaRow
                  label="竞争烈度（反向）"
                  raw={ci != null ? 100 - ci : null}
                  weight="× 0.15"
                  contribution={contrib.comp}
                  rawHint={ci != null ? `(100 − ${ci.toFixed(0)})` : undefined}
                />
                <FormulaRow
                  label="AI 杠杆度"
                  raw={ai}
                  weight="× 0.15"
                  contribution={contrib.ai}
                />
                <tr className="border-t-2 border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 font-semibold">
                  <td className="px-2 py-1.5">合计 (Hachimi 重算)</td>
                  <td colSpan={2} className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {reproduced != null ? reproduced.toFixed(1) : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1.5 text-[var(--color-text-dim)]">
                    JSON 上报的 composite_score
                  </td>
                  <td colSpan={2} className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {reported != null ? reported.toFixed(1) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {matches != null && (
            <div
              className={cn(
                "rounded-md px-2 py-1.5 text-[11px]",
                matches
                  ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "border border-amber-400/30 bg-amber-500/10 text-amber-300",
              )}
            >
              {matches
                ? "✓ 公式重算与 JSON 上报值一致（差异 < 0.5）"
                : `⚠ 公式重算与上报值差异 ${Math.abs((reproduced ?? 0) - (reported ?? 0)).toFixed(1)} 分；可能采用了不同权重或子项还没填全`}
            </div>
          )}

          <div className="text-[10px] text-[var(--color-text-dim)]">
            来源：
            <code className="rounded bg-[var(--color-surface)] px-1">
              webapp-spec/schema.md
            </code>{" "}
            §15 hachimi_scores
            {score.methodology_url && (
              <>
                {" "}· 方法论：
                <code className="rounded bg-[var(--color-surface)] px-1">
                  {score.methodology_url}
                </code>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormulaRow({
  label,
  raw,
  weight,
  contribution,
  rawHint,
}: {
  label: string;
  raw: number | null;
  weight: string;
  contribution: number | null;
  rawHint?: string;
}) {
  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-2 py-1.5">{label}</td>
      <td className="px-2 py-1.5 text-right tabular-nums">
        {raw != null ? raw.toFixed(0) : "—"}
        {rawHint && (
          <div className="text-[9px] text-[var(--color-text-dim)]">{rawHint}</div>
        )}
      </td>
      <td className="px-2 py-1.5 text-right text-[var(--color-text-dim)]">
        {weight}
      </td>
      <td className="px-2 py-1.5 text-right tabular-nums font-medium">
        {contribution != null ? contribution.toFixed(1) : "—"}
      </td>
    </tr>
  );
}
