"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  METRIC_INFO,
  getMetricBenchmark,
  type MetricInfoKey,
} from "@/lib/metric-info";
import { getAllCountries } from "@/lib/data";

type Props = {
  metricKey: MetricInfoKey;
  /** Current country's value for this metric (the one shown in the card). */
  currentValue: number | null | undefined;
  /** Current country's ISO alpha3, for "you are here" marker. */
  currentIso?: string;
  className?: string;
};

/**
 * Click-trigger Popover that explains a metric:
 *   1. Definition + scale + direction
 *   2. Benchmark across all available countries (min / p25 / median / p75 / max)
 *   3. Current country's position on the scale
 *
 * Designed for mobile: click/tap, not hover. The trigger renders as a small
 * info icon — wrap it next to a metric label.
 */
export function MetricExplainer({
  metricKey,
  currentValue,
  currentIso,
  className,
}: Props) {
  const info = METRIC_INFO[metricKey];
  const bench = getMetricBenchmark(metricKey);
  const countries = getAllCountries();

  // Position the current country on the benchmark bar (0..1).
  const range = bench.max - bench.min;
  const positionPct = (v: number) =>
    range === 0 ? 50 : ((v - bench.min) / range) * 100;

  // "Direction-aware" interpretation: where is the current value?
  let positionVerdict: "poor" | "decent" | "strong" | null = null;
  if (currentValue != null && Number.isFinite(currentValue)) {
    const p25 = bench.p25;
    const p75 = bench.p75;
    if (info.direction === "higher_better") {
      if (currentValue < p25) positionVerdict = "poor";
      else if (currentValue < p75) positionVerdict = "decent";
      else positionVerdict = "strong";
    } else if (info.direction === "lower_better") {
      if (currentValue > p75) positionVerdict = "poor";
      else if (currentValue > p25) positionVerdict = "decent";
      else positionVerdict = "strong";
    }
  }

  // Pick top-3 and bottom-3 from benchmark for "where am I" context.
  const sorted = [...bench.values];
  const best =
    info.direction === "lower_better"
      ? sorted.slice(0, 3)
      : sorted.slice(-3).reverse();
  const worst =
    info.direction === "lower_better"
      ? sorted.slice(-3).reverse()
      : sorted.slice(0, 3);

  const countryName = (iso: string) => {
    const c = countries.find((c) => c.iso_alpha3 === iso);
    return c ? `${c.flag_emoji ?? ""} ${c.name_zh}` : iso;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`解释 ${info.title}`}
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-primary)]/15 hover:text-[var(--color-primary)]",
            className,
          )}
        >
          <Info className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              指标说明
            </div>
            <h3 className="mt-0.5 text-base font-semibold">{info.title}</h3>
          </div>

          <p className="text-xs leading-relaxed text-[var(--color-text-dim)]">
            {info.definition}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Cell label="刻度" value={info.scale} />
            <Cell
              label="读数方向"
              value={
                info.direction === "higher_better"
                  ? "↑ 越高越好"
                  : info.direction === "lower_better"
                    ? "↓ 越低越好"
                    : "需结合品类判断"
              }
            />
          </div>

          {/* Qualitative bands */}
          <div className="space-y-1 text-[11px]">
            <Band color="emerald" label="优秀" text={info.qualitative.strong} />
            <Band color="amber" label="中等" text={info.qualitative.decent} />
            <Band color="red" label="待提升" text={info.qualitative.poor} />
          </div>

          {/* Benchmark distribution */}
          {bench.count > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                  32 国基准 ({bench.count} 国有数据)
                </div>
                {positionVerdict && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                      positionVerdict === "strong" &&
                        "text-emerald-300 bg-emerald-500/15 ring-emerald-400/30",
                      positionVerdict === "decent" &&
                        "text-amber-300 bg-amber-500/15 ring-amber-400/30",
                      positionVerdict === "poor" &&
                        "text-red-300 bg-red-500/15 ring-red-400/30",
                    )}
                  >
                    本国 {positionVerdict === "strong"
                      ? "优秀"
                      : positionVerdict === "decent"
                        ? "中等"
                        : "待提升"}
                  </span>
                )}
              </div>

              {/* Distribution bar with current value marker */}
              <div className="relative mt-2 h-6">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-surface-2)]" />
                {/* p25 - p75 box */}
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/30"
                  style={{
                    left: `${positionPct(bench.p25)}%`,
                    width: `${positionPct(bench.p75) - positionPct(bench.p25)}%`,
                  }}
                />
                {/* Median */}
                <span
                  className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
                  style={{ left: `${positionPct(bench.median)}%` }}
                />
                {/* All countries as faint dots */}
                {bench.values.map((p) => (
                  <span
                    key={p.iso}
                    className={cn(
                      "absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full",
                      p.iso === currentIso
                        ? "z-10 size-2.5 ring-2 ring-[var(--color-bg-from)] bg-[var(--color-primary)]"
                        : "bg-[var(--color-text-dim)]/60",
                    )}
                    style={{ left: `${positionPct(p.v)}%` }}
                    title={`${p.iso}: ${info.format(p.v)}`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-dim)]">
                <span>min {info.format(bench.min)}</span>
                <span>median {info.format(bench.median)}</span>
                <span>max {info.format(bench.max)}</span>
              </div>

              {currentValue != null && Number.isFinite(currentValue) && (
                <div className="mt-2 rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-2 py-1.5 text-[11px]">
                  当前：{info.format(currentValue)}{" "}
                  {currentIso && (
                    <span className="text-[var(--color-text-dim)]">
                      ({countryName(currentIso)})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top / bottom 3 */}
          {bench.count >= 5 && (
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                  Top 3
                </div>
                <ul className="mt-1 space-y-0.5">
                  {best.map((p) => (
                    <li key={p.iso} className="flex justify-between">
                      <span>{countryName(p.iso)}</span>
                      <span className="tabular-nums text-[var(--color-text)]">
                        {info.format(p.v)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                  Bottom 3
                </div>
                <ul className="mt-1 space-y-0.5">
                  {worst.map((p) => (
                    <li key={p.iso} className="flex justify-between">
                      <span>{countryName(p.iso)}</span>
                      <span className="tabular-nums text-[var(--color-text-dim)]">
                        {info.format(p.v)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-bg-from)]/50 px-2 py-1.5">
      <div className="text-[10px] text-[var(--color-text-dim)]">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Band({
  color,
  label,
  text,
}: {
  color: "emerald" | "amber" | "red";
  label: string;
  text: string;
}) {
  const dotClass = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
  }[color];
  return (
    <div className="flex items-start gap-1.5">
      <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", dotClass)} />
      <span>
        <span className="font-medium">{label}：</span>
        <span className="text-[var(--color-text-dim)]">{text}</span>
      </span>
    </div>
  );
}
