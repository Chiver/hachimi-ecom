"use client";

import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_FIT_WEIGHTS, type BrandFitResult } from "@/lib/brand-fit";

type Props = {
  result: BrandFitResult;
  defaultOpen?: boolean;
};

/**
 * 品牌化适配评分公式面板（可折叠）。展示四维均衡权重、各维度贡献，
 * 以及"可得维度 < 3 不出综合分"的规则——透明可复算。
 */
export function BrandFitFormulaPanel({ result, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const available = result.dimensions.filter((d) => d.value != null);
  const totalWeight = available.reduce((s, d) => s + BRAND_FIT_WEIGHTS[d.key], 0);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--color-surface-2)]"
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Calculator className="size-3.5 text-[var(--color-primary)]" />
          品牌化适配评分计算方法（v1 · 四维均衡）
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
            围绕「品牌化 + 差异化高端选品」战略，把团队核心能力（CVR/CTR 优化、品牌建设、
            短视频/网红投放、Meta+TikTok 引流 → 独立站 + TikTok Shop 转化）拆成 4 个 0-100
            维度，<strong className="text-[var(--color-text)]">各占 25% 均衡加权</strong>，
            按该国实际可得的维度再归一化。
          </p>

          <pre className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[11px] leading-relaxed">
{`品牌化适配 = ( DTC 渠道适配 × 0.25
           + 品牌溢价空间 × 0.25
           + 视频/社媒契合 × 0.25
           + 流量成本效率 × 0.25 ) / 可得维度权重之和`}
          </pre>

          <div className="overflow-hidden rounded-md border border-[var(--color-border)]">
            <table className="w-full text-[11px]">
              <thead className="bg-[var(--color-surface-2)] text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-2 py-1.5 text-left">维度</th>
                  <th className="px-2 py-1.5 text-right">值</th>
                  <th className="px-2 py-1.5 text-right">权重</th>
                  <th className="px-2 py-1.5 text-right">贡献</th>
                </tr>
              </thead>
              <tbody>
                {result.dimensions.map((d) => {
                  const w = BRAND_FIT_WEIGHTS[d.key];
                  const contrib =
                    d.value != null && result.composite != null
                      ? (d.value * w) / totalWeight
                      : null;
                  return (
                    <tr key={d.key} className="border-t border-[var(--color-border)]">
                      <td className="px-2 py-1.5">
                        {d.label}
                        {d.partial && (
                          <span className="ml-1 rounded bg-amber-500/10 px-1 text-[9px] text-amber-300">
                            部分估算
                          </span>
                        )}
                        <div className="text-[9px] text-[var(--color-text-dim)]">
                          {d.detail}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums">
                        {d.value != null ? d.value.toFixed(0) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-[var(--color-text-dim)]">
                        × {w.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-medium">
                        {contrib != null ? contrib.toFixed(1) : "—"}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 font-semibold">
                  <td className="px-2 py-1.5">品牌化适配评分</td>
                  <td colSpan={2} className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {result.composite != null ? result.composite.toFixed(1) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            className={cn(
              "rounded-md px-2 py-1.5 text-[11px]",
              result.sufficient
                ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border border-amber-400/30 bg-amber-500/10 text-amber-300",
            )}
          >
            {result.sufficient
              ? `✓ 已用 ${result.availableDimCount}/4 个维度计算（≥3 即出分）`
              : `⚠ 仅 ${result.availableDimCount}/4 个维度有数据（< 3），综合分置空，待补 DTC / Luxury / CPM 等数据`}
          </div>

          <div className="text-[10px] text-[var(--color-text-dim)]">
            数据来源：选国决策表（DTC% / Direct&amp;Brand Search / Luxury 占比 / TikTok Shop / AOV）
            + Lebesgue Meta CPM；英文素材复用度为团队能力假设。维度归一化参考：DTC 20%、
            Direct&amp;Brand 60%、Luxury 占比 40%、AOV $120、CPM $1–18 为各档满分/零分锚点。
          </div>
        </div>
      )}
    </div>
  );
}
