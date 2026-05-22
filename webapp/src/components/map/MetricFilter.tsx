"use client";

import { cn } from "@/lib/utils";
import {
  METRICS,
  COMPOSITE_LEGEND_GRADIENT,
  CPM_LEGEND_GRADIENT,
  type MetricDef,
  type MetricKey,
} from "@/lib/metrics";

type Props = {
  value: MetricKey;
  onChange: (k: MetricKey) => void;
  domain: [number, number];
  metric: MetricDef;
};

export function MetricFilter({ value, onChange, domain, metric }: Props) {
  const [lo, hi] = domain;
  return (
    <div className="pointer-events-auto absolute bottom-6 left-6 w-[260px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 text-xs shadow-xl backdrop-blur-md">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
        配色维度
      </div>
      <ul className="space-y-1">
        {METRICS.map((m) => {
          const active = m.key === value;
          return (
            <li key={m.key}>
              <button
                type="button"
                onClick={() => onChange(m.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  active
                    ? "bg-[var(--color-primary)]/15 text-[var(--color-text)]"
                    : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
                )}
              >
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full ring-1 ring-inset ring-white/10",
                    active ? "bg-[var(--color-primary)]" : "bg-[var(--color-text-dim)]/40",
                  )}
                />
                <span className="text-[12px]">{m.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-[var(--color-border)] pt-2">
        <div className="text-[10px] text-[var(--color-text-dim)]">
          {metric.label}
        </div>
        {metric.binary ? (
          <div className="mt-1.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
              <span className="size-2.5 rounded-sm" style={{ background: "rgb(16,185,129)" }} />
              已上线
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
              <span className="size-2.5 rounded-sm" style={{ background: "rgb(71,85,105)" }} />
              未上线
            </span>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-[var(--color-text-dim)]">
              {metric.format(lo)}
            </span>
            <div
              className="h-2 flex-1 rounded"
              style={{
                background:
                  metric.key === "composite_score"
                    ? COMPOSITE_LEGEND_GRADIENT
                    : metric.key === "meta_cpm_usd"
                      ? CPM_LEGEND_GRADIENT
                      : "linear-gradient(90deg, rgb(35,46,68) 0%, rgb(16,185,129) 100%)",
              }}
            />
            <span className="text-[10px] tabular-nums text-[var(--color-text-dim)]">
              {metric.format(hi)}
            </span>
          </div>
        )}
        {metric.log && (
          <div className="mt-1 text-[10px] text-[var(--color-text-dim)]">
            * 对数刻度（跨越多数量级）
          </div>
        )}
        {metric.lowerIsBetter && (
          <div className="mt-1 text-[10px] text-[var(--color-text-dim)]">
            * 越低越好（流量成本越便宜）· 来源 Lebesgue &apos;26
          </div>
        )}
        <div className="mt-1.5 text-[10px] text-[var(--color-text-dim)]">
          灰色 = 数据待补
        </div>
      </div>
    </div>
  );
}
