import type { CountryData } from "@/types";
import { SourceBadge, PendingBadge } from "@/components/SourceBadge";
import { CATEGORY_CODES, CATEGORY_LABEL } from "@/lib/categories";
import { cn, formatPct, formatUsdMillions } from "@/lib/utils";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";

const COMPLEXITY_COLOR: Record<string, string> = {
  low: "text-emerald-300 bg-emerald-500/10 ring-emerald-400/30",
  medium: "text-amber-300 bg-amber-500/10 ring-amber-400/30",
  high: "text-red-300 bg-red-500/10 ring-red-400/30",
  extreme: "text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-400/30",
};

export function CategoriesTab({ data }: { data: CountryData }) {
  const byCode = new Map(data.category_metrics.map((c) => [c.category_code, c]));
  const maxGmv = Math.max(
    ...data.category_metrics
      .map((c) => c.gmv_usd_million ?? 0)
      .filter((n) => n > 0),
    1,
  );

  const gmvRows: BenchmarkRow[] = data.category_metrics
    .filter((c) => c.gmv_usd_million != null && c.gmv_usd_million > 0)
    .map((c) => ({
      iso: c.category_code,
      label: CATEGORY_LABEL[c.category_code] ?? c.category_code,
      value: c.gmv_usd_million ?? 0,
    }));

  return (
    <div className="space-y-6">
      {gmvRows.length > 1 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-base font-semibold">品类市场容量排名</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              GMV · 高→低 · {gmvRows.length} / 12 大类有数据
            </span>
          </div>
          <BenchmarkChart
            rows={gmvRows}
            title="品类 GMV (M USD)"
            format={{ millionsToBillions: true, decimals: 2 }}
            height={Math.max(220, gmvRows.length * 32)}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_CODES.map((code) => {
          const cat = byCode.get(code as never);
          if (!cat) {
            return (
              <div
                key={code}
                className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-4"
              >
                <div className="text-sm text-[var(--color-text-dim)]">
                  {CATEGORY_LABEL[code]}
                </div>
                <div className="mt-3 text-xs">
                  <PendingBadge reason="此品类暂无数据" />
                </div>
              </div>
            );
          }
          const intensity = Math.min(
            1,
            Math.max(0.3, (cat.gmv_usd_million ?? 0) / maxGmv),
          );
          const isHighGrowth = (cat.yoy_growth_pct ?? 0) > 15;
          return (
            <div
              key={code}
              className={cn(
                "rounded-lg border bg-[var(--color-surface)] p-4 transition-colors",
                isHighGrowth
                  ? "border-emerald-400/40 ring-1 ring-emerald-400/30"
                  : "border-[var(--color-border)]",
              )}
              style={{
                background: `linear-gradient(180deg, rgba(16,185,129,${0.05 + intensity * 0.18}) 0%, rgba(19,26,54,1) 100%)`,
              }}
            >
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-semibold">
                  {CATEGORY_LABEL[code]}
                </div>
                {cat.source_metadata?.gmv_usd_million && (
                  <SourceBadge
                    source={cat.source_metadata.gmv_usd_million}
                    label={`${CATEGORY_LABEL[code]} GMV`}
                  />
                )}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums">
                {formatUsdMillions(cat.gmv_usd_million)}
              </div>
              {cat.yoy_growth_pct != null && (
                <div
                  className={cn(
                    "mt-1 text-xs font-medium",
                    cat.yoy_growth_pct > 0
                      ? "text-emerald-300"
                      : "text-red-300",
                  )}
                >
                  {cat.yoy_growth_pct > 0 ? "↑" : "↓"} {formatPct(Math.abs(cat.yoy_growth_pct))}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-[var(--color-text-dim)]">
                {cat.typical_gross_margin_pct != null && (
                  <div>
                    毛利{" "}
                    <span className="text-[var(--color-text)]">
                      {formatPct(cat.typical_gross_margin_pct, 0)}
                    </span>
                  </div>
                )}
                {cat.typical_return_rate_pct != null && (
                  <div>
                    退货{" "}
                    <span className="text-[var(--color-text)]">
                      {formatPct(cat.typical_return_rate_pct, 0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {cat.regulatory_complexity && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] ring-1 ring-inset",
                      COMPLEXITY_COLOR[cat.regulatory_complexity],
                    )}
                  >
                    监管 {cat.regulatory_complexity}
                  </span>
                )}
                {cat.chinese_supply_advantage && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] ring-1 ring-inset",
                      cat.chinese_supply_advantage === "high"
                        ? "text-emerald-300 bg-emerald-500/10 ring-emerald-400/30"
                        : "text-[var(--color-text-dim)] bg-[var(--color-surface-2)] ring-[var(--color-border)]",
                    )}
                  >
                    中国供应 {cat.chinese_supply_advantage}
                  </span>
                )}
              </div>
              {cat.notes && (
                <p className="mt-2 line-clamp-3 text-[11px] text-[var(--color-text-dim)]">
                  {cat.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
