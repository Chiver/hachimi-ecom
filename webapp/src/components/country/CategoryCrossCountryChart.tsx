"use client";

import { useMemo, useState } from "react";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";
import { CATEGORY_CODES, CATEGORY_LABEL } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * Per-category × per-country GMV map computed on the server:
 *   { apparel: [{ iso, label, gmv }], beauty: [...], ... }
 * Empty arrays for categories with no data.
 */
export type CategoryCountryMatrix = Record<
  string,
  { iso: string; label: string; gmv: number }[]
>;

type Props = {
  /** The country currently being viewed (its bar will be highlighted). */
  currentIso: string;
  /** Which category to default-select. Falls back to first non-empty. */
  initialCategory?: string;
  /** Matrix of every (category, country) → GMV. */
  matrix: CategoryCountryMatrix;
};

export function CategoryCrossCountryChart({
  currentIso,
  initialCategory,
  matrix,
}: Props) {
  // Determine which categories have any data — only show those as pickable
  const categoriesWithData = useMemo(
    () => CATEGORY_CODES.filter((code) => (matrix[code]?.length ?? 0) > 0),
    [matrix],
  );

  // Pick a sensible initial category: prefer initialCategory if it has data,
  // else first non-empty.
  const defaultPick =
    (initialCategory && (matrix[initialCategory]?.length ?? 0) > 0
      ? initialCategory
      : categoriesWithData[0]) ?? "apparel";

  const [selected, setSelected] = useState<string>(defaultPick);

  const rows: BenchmarkRow[] = useMemo(() => {
    const xs = matrix[selected] ?? [];
    return xs.map((x) => ({ iso: x.iso, label: x.label, value: x.gmv }));
  }, [matrix, selected]);

  const currentValue =
    rows.find((r) => r.iso === currentIso)?.value ?? null;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">
            品类 × 32 国市场容量横向对比
          </h3>
          <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            点击下方品类筛选，对比该品类在所有国家的 GMV（emerald 高亮 = 当前国）
          </p>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {CATEGORY_CODES.map((code) => {
          const hasData = (matrix[code]?.length ?? 0) > 0;
          const active = selected === code;
          return (
            <button
              key={code}
              type="button"
              disabled={!hasData}
              onClick={() => hasData && setSelected(code)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                !hasData && "cursor-not-allowed opacity-40",
                active &&
                  "bg-[var(--color-primary)] text-white ring-[var(--color-primary)]",
                hasData &&
                  !active &&
                  "bg-[var(--color-surface-2)] text-[var(--color-text-dim)] ring-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
                !hasData &&
                  "bg-[var(--color-surface-2)]/40 text-[var(--color-text-dim)] ring-[var(--color-border)]",
              )}
              title={hasData ? undefined : "暂无该品类的跨国数据"}
            >
              {CATEGORY_LABEL[code] ?? code}
              <span className="ml-1 text-[10px] opacity-70">
                ({matrix[code]?.length ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="mt-4">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-from)]/30 p-8 text-center text-sm text-[var(--color-text-dim)]">
            该品类暂无任何国家有数据
          </div>
        ) : (
          <>
            {/* Current country callout */}
            <div className="mb-3 flex flex-wrap items-baseline gap-3 rounded-md bg-[var(--color-primary)]/10 px-3 py-2 text-xs ring-1 ring-inset ring-[var(--color-primary)]/30">
              <span className="text-[var(--color-text-dim)]">
                {CATEGORY_LABEL[selected] ?? selected} · 当前国 GMV
              </span>
              <span className="font-bold text-[var(--color-primary)]">
                {currentValue != null ? formatBillions(currentValue) : "—"}
              </span>
              <span className="ml-auto text-[10px] text-[var(--color-text-dim)]">
                {currentValue != null
                  ? `全球第 ${rankOf(rows, currentIso)} / ${rows.length}`
                  : "本国无该品类数据"}
              </span>
            </div>
            <BenchmarkChart
              rows={rows}
              highlightIso={currentIso}
              title={`${CATEGORY_LABEL[selected] ?? selected} · GMV (M USD)`}
              format={{ millionsToBillions: true, decimals: 2 }}
            />
          </>
        )}
      </div>

      {categoriesWithData.length < CATEGORY_CODES.length && (
        <div className="mt-3 text-[10px] text-[var(--color-text-dim)]">
          注：括号内数字 = 有该品类数据的国家数。灰色不可选 = 全无数据。
        </div>
      )}
    </section>
  );
}

function formatBillions(m: number): string {
  return m >= 1000 ? `$${(m / 1000).toFixed(2)}B` : `$${m.toFixed(0)}M`;
}

function rankOf(rows: BenchmarkRow[], iso: string): number {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  return sorted.findIndex((r) => r.iso === iso) + 1;
}
