"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type BenchmarkRow = {
  iso: string;
  label: string; // e.g. "🇵🇱 波兰"
  value: number;
};

/** Serializable value formatter spec (so this component can be a child of a server component). */
export type ValueFormat = {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** If true, scale millions: <1000 → "X.XM", >=1000 → "X.XB". */
  millionsToBillions?: boolean;
};

export function formatValue(v: number, f: ValueFormat = {}): string {
  if (!Number.isFinite(v)) return "—";
  const decimals = f.decimals ?? 2;
  if (f.millionsToBillions) {
    if (v >= 1000) return `${(v / 1000).toFixed(decimals)}B`;
    return `${v.toFixed(decimals)}M`;
  }
  return `${f.prefix ?? ""}${v.toFixed(decimals)}${f.suffix ?? ""}`;
}

type Props = {
  /** All countries' values for this metric. */
  rows: BenchmarkRow[];
  /** ISO of the country to highlight (will be drawn emerald). */
  highlightIso?: string;
  /** Y-axis label / metric name. */
  title: string;
  /** Serializable value format. */
  format: ValueFormat;
  /** Max bars to render (default 32). Smaller = compact chart. */
  maxBars?: number;
  /** Sort direction. 'desc' = highest first (default). 'asc' = lowest first. */
  sort?: "asc" | "desc";
  height?: number;
};

const ROW_PX = 26; // per-row height — must fit emoji flag + chinese label + comfortable spacing
const LABEL_WIDTH = 130; // wide enough for "🇰🇷 韩国" + 1-2 char buffer

/** Custom Y-axis tick renderer: emerald for highlighted country, light text otherwise. */
// Recharts injects many props (x/y/payload/index/angle/...) into the tick
// element; we only care about a few. Loose typing avoids fighting recharts internals.
function YTick(props: Record<string, unknown>) {
  const x = typeof props.x === "number" ? props.x : 0;
  const y = typeof props.y === "number" ? props.y : 0;
  const payload = (props.payload as { value?: string } | undefined) ?? {};
  const value = payload.value ?? "";
  const highlightLabel = props.highlightLabel as string | undefined;
  const isHighlight = !!highlightLabel && value === highlightLabel;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fill={isHighlight ? "#10b981" : "#cfd6f5"}
        fontSize={11}
        fontWeight={isHighlight ? 600 : 400}
      >
        {value}
      </text>
    </g>
  );
}

/**
 * Horizontal bar chart for cross-country comparison on a single metric.
 * The current country is highlighted in emerald; all others muted.
 * Sorts by value so the rank is visually obvious.
 */
export function BenchmarkChart({
  rows,
  highlightIso,
  title,
  format,
  maxBars = 32,
  sort = "desc",
  height,
}: Props) {
  const sorted = [...rows]
    .filter((r) => Number.isFinite(r.value))
    .sort((a, b) => (sort === "desc" ? b.value - a.value : a.value - b.value))
    .slice(0, maxBars);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-6 text-center text-xs text-[var(--color-text-dim)]">
        无足够数据生成对比图
      </div>
    );
  }

  const highlightLabel = sorted.find((r) => r.iso === highlightIso)?.label;
  // Default height: enough vertical room so every label renders.
  const effectiveHeight =
    height ?? Math.max(220, sorted.length * ROW_PX + 40);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-2 flex items-baseline justify-between px-2">
        <div className="text-xs font-semibold">{title}</div>
        <div className="text-[10px] text-[var(--color-text-dim)]">
          {sorted.length} 国 · {highlightIso ? `当前 ${highlightIso}` : ""}
        </div>
      </div>
      <div style={{ height: effectiveHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
            barCategoryGap="20%"
          >
            <CartesianGrid stroke="#2a335a" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              stroke="#7a86b8"
              fontSize={10}
              tick={{ fill: "#b4bce3", fontSize: 10 }}
              tickFormatter={(v) => formatValue(v as number, format)}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={LABEL_WIDTH}
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={(p) => <YTick {...p} highlightLabel={highlightLabel} />}
            />
            <RechartsTooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#131a36",
                border: "1px solid #2a335a",
                borderRadius: 8,
                fontSize: 12,
                color: "#ffffff",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600 }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(v) => {
                const num = typeof v === "number" ? v : Number(v ?? 0);
                return [formatValue(num, format), title];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {sorted.map((r) => (
                <Cell
                  key={r.iso}
                  fill={
                    r.iso === highlightIso
                      ? "var(--color-primary)"
                      : "rgba(122,134,184,0.55)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
