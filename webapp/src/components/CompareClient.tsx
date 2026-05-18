"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { X, Plus } from "lucide-react";
import type { Country } from "@/types";
import { cn, formatPct, formatUsdMillions, formatNumber } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";

const SERIES_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7"];

const ENTRY_MODE_LABEL: Record<string, string> = {
  direct_dropship: "直邮",
  fba_only: "FBA 优先",
  overseas_warehouse: "海外仓",
  local_entity: "本地实体",
  skip: "暂不进入",
};

export type CountrySnapshot = {
  iso_alpha3: string;
  country: Country;
  composite_score: number | null;
  market_attractiveness: number | null;
  operational_feasibility: number | null;
  competition_intensity: number | null;
  ai_leverage_potential: number | null;
  recommended_entry_mode: string | null;
  recommended_categories: string[];
  gmv_total_usd_million: number | null;
  cagr_2025_2030_pct: number | null;
  per_capita_spend_usd: number | null;
  online_buyers_million: number | null;
  cross_border_share_pct: number | null;
  population: number | null;
  gdp_per_capita_usd: number | null;
  internet_penetration_pct: number | null;
  /** Ad-channel costs by channel code. Missing channels are absent from the map. */
  traffic: Record<string, { cpm_usd: number | null; cpc_usd: number | null; estimated: boolean }>;
};

type Props = {
  countries: Country[];
  snapshots: Record<string, CountrySnapshot>;
};

export function CompareClient({ countries, snapshots }: Props) {
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    const fromUrl = searchParams.get("selected");
    if (fromUrl) {
      const list = fromUrl.split(",").filter((iso) => snapshots[iso]);
      if (list.length > 0) return list.slice(0, 4);
    }
    // Default: first 2 snapshots (or just POL if it's the only one)
    return Object.keys(snapshots).slice(0, 2);
  }, [searchParams, snapshots]);

  const [selected, setSelected] = useState<string[]>(initial);

  // Keep URL in sync (purely cosmetic; no router push needed)
  useEffect(() => {
    const next = new URL(window.location.href);
    if (selected.length > 0) next.searchParams.set("selected", selected.join(","));
    else next.searchParams.delete("selected");
    window.history.replaceState({}, "", next.toString());
  }, [selected]);

  const radarData = useMemo(() => {
    const axes = [
      { axis: "市场吸引力", key: "market_attractiveness" as const },
      { axis: "运营可行性", key: "operational_feasibility" as const },
      { axis: "竞争空间", key: "competition_intensity" as const, inverse: true },
      { axis: "AI 杠杆度", key: "ai_leverage_potential" as const },
    ];
    return axes.map(({ axis, key, inverse }) => {
      const row: Record<string, number | string> = { axis };
      for (const iso of selected) {
        const s = snapshots[iso];
        if (!s) continue;
        const raw = s[key];
        row[iso] =
          raw == null ? 0 : inverse ? Math.max(0, 100 - raw) : raw;
      }
      return row;
    });
  }, [selected, snapshots]);

  const availableToAdd = Object.values(snapshots).filter(
    (s) => !selected.includes(s.iso_alpha3),
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {selected.map((iso, idx) => {
          const s = snapshots[iso];
          if (!s) return null;
          return (
            <span
              key={iso}
              className="inline-flex items-center gap-2 rounded-full border bg-[var(--color-surface)] px-3 py-1 text-sm"
              style={{ borderColor: SERIES_COLORS[idx] + "80" }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: SERIES_COLORS[idx] }}
              />
              <span>{s.country.flag_emoji} {s.country.name_zh}</span>
              <button
                type="button"
                onClick={() =>
                  setSelected(selected.filter((i) => i !== iso))
                }
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                aria-label={`移除 ${s.country.name_zh}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          );
        })}
        {selected.length < 4 && availableToAdd.length > 0 && (
          <details className="relative">
            <summary className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] [&::-webkit-details-marker]:hidden">
              <Plus className="size-3.5" /> 添加国家
            </summary>
            <div className="absolute left-0 top-full z-10 mt-2 max-h-72 w-56 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">
              {availableToAdd.map((s) => (
                <button
                  key={s.iso_alpha3}
                  type="button"
                  onClick={() => setSelected([...selected, s.iso_alpha3])}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--color-surface-2)]"
                >
                  <span>{s.country.flag_emoji}</span>
                  <span>{s.country.name_zh}</span>
                  <span className="ml-auto text-xs text-[var(--color-text-dim)]">
                    {s.composite_score?.toFixed(0) ?? "—"}
                  </span>
                </button>
              ))}
            </div>
          </details>
        )}
        {selected.length === 0 && (
          <span className="text-sm text-[var(--color-text-dim)]">
            请选择至少 1 个国家
          </span>
        )}
        <div className="ml-auto text-xs text-[var(--color-text-dim)]">
          可对比的国家：{Object.keys(snapshots).length}（其它待数据交付）
        </div>
      </div>

      {selected.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-12 text-center text-sm text-[var(--color-text-dim)]">
          从上方添加国家开始对比。
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-base font-semibold">Hachimi 评分维度对比</h2>
            <div className="mt-4 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a335a" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "#b4bce3", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#7a86b8", fontSize: 10 }}
                    stroke="#2a335a"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "#131a36",
                      border: "1px solid #2a335a",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  {selected.map((iso, idx) => {
                    const s = snapshots[iso];
                    if (!s) return null;
                    return (
                      <Radar
                        key={iso}
                        name={`${s.country.flag_emoji} ${s.country.name_zh}`}
                        dataKey={iso}
                        stroke={SERIES_COLORS[idx]}
                        fill={SERIES_COLORS[idx]}
                        fillOpacity={0.22}
                      />
                    );
                  })}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-4 py-3 text-left">指标</th>
                  {selected.map((iso, idx) => {
                    const s = snapshots[iso];
                    return (
                      <th
                        key={iso}
                        className="px-4 py-3 text-right"
                        style={{ color: SERIES_COLORS[idx] }}
                      >
                        {s?.country.flag_emoji} {s?.country.name_zh}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Hachimi 综合评分"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.composite_score != null
                      ? `${s.composite_score.toFixed(0)} / 100`
                      : "—"
                  }
                  highlight={(s) => s.composite_score ?? -1}
                />
                <CompareRow
                  label="推荐入市模式"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.recommended_entry_mode
                      ? ENTRY_MODE_LABEL[s.recommended_entry_mode] ??
                        s.recommended_entry_mode
                      : "—"
                  }
                />
                <CompareRow
                  label="电商 GMV 2024"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) => formatUsdMillions(s.gmv_total_usd_million)}
                  highlight={(s) => s.gmv_total_usd_million ?? -1}
                />
                <CompareRow
                  label="CAGR 25-30"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) => formatPct(s.cagr_2025_2030_pct)}
                  highlight={(s) => s.cagr_2025_2030_pct ?? -1}
                />
                <CompareRow
                  label="人均电商支出"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.per_capita_spend_usd != null
                      ? `$${formatNumber(s.per_capita_spend_usd, { decimals: 0 })}`
                      : "—"
                  }
                  highlight={(s) => s.per_capita_spend_usd ?? -1}
                />
                <CompareRow
                  label="在线买家"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.online_buyers_million != null
                      ? `${s.online_buyers_million.toFixed(1)}M`
                      : "—"
                  }
                  highlight={(s) => s.online_buyers_million ?? -1}
                />
                <CompareRow
                  label="跨境占比"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) => formatPct(s.cross_border_share_pct, 0)}
                />
                <CompareRow
                  label="人口"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.population != null
                      ? `${(s.population / 1_000_000).toFixed(1)}M`
                      : "—"
                  }
                />
                <CompareRow
                  label="GDP 人均"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) =>
                    s.gdp_per_capita_usd != null
                      ? `$${formatNumber(s.gdp_per_capita_usd, { decimals: 0 })}`
                      : "—"
                  }
                />
                <CompareRow
                  label="互联网渗透"
                  selected={selected}
                  snapshots={snapshots}
                  render={(s) => formatPct(s.internet_penetration_pct, 0)}
                />
                {/* === 流量成本对比 (CPM / CPC) === */}
                <SectionHeaderRow
                  cols={selected.length + 1}
                  label="广告流量成本"
                  note="多数为 Hachimi 全球基准外推（estimated）"
                />
                <TrafficRow
                  label="Meta CPM"
                  channel="meta"
                  field="cpm_usd"
                  selected={selected}
                  snapshots={snapshots}
                  lowerIsBetter
                />
                <TrafficRow
                  label="Meta CPC"
                  channel="meta"
                  field="cpc_usd"
                  selected={selected}
                  snapshots={snapshots}
                  lowerIsBetter
                />
                <TrafficRow
                  label="Google Search CPC"
                  channel="google_search"
                  field="cpc_usd"
                  selected={selected}
                  snapshots={snapshots}
                  lowerIsBetter
                />
                <TrafficRow
                  label="TikTok CPM"
                  channel="tiktok"
                  field="cpm_usd"
                  selected={selected}
                  snapshots={snapshots}
                  lowerIsBetter
                />
                <tr className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 text-[var(--color-text-dim)]">
                    推荐品类
                  </td>
                  {selected.map((iso) => {
                    const s = snapshots[iso];
                    return (
                      <td key={iso} className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {(s?.recommended_categories ?? []).map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]"
                            >
                              {categoryLabel(c)}
                            </span>
                          ))}
                          {(s?.recommended_categories ?? []).length === 0 && "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}

      {Object.keys(snapshots).length < countries.length && (
        <p className="mt-4 text-[11px] text-[var(--color-text-dim)]">
          注：仅显示已交付完整数据的国家。Cowork 团队产出新国家 JSON 后会自动出现在选择器中。
        </p>
      )}
    </>
  );
}

function CompareRow({
  label,
  selected,
  snapshots,
  render,
  highlight,
}: {
  label: string;
  selected: string[];
  snapshots: Record<string, CountrySnapshot>;
  render: (s: CountrySnapshot) => string;
  highlight?: (s: CountrySnapshot) => number;
}) {
  const winnerIso = highlight
    ? selected.reduce<{ iso: string | null; v: number }>(
        (acc, iso) => {
          const s = snapshots[iso];
          if (!s) return acc;
          const v = highlight(s);
          if (v > acc.v) return { iso, v };
          return acc;
        },
        { iso: null, v: -Infinity },
      ).iso
    : null;

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-4 py-3 text-[var(--color-text-dim)]">{label}</td>
      {selected.map((iso) => {
        const s = snapshots[iso];
        if (!s) return <td key={iso} className="px-4 py-3 text-right">—</td>;
        const isWinner = winnerIso === iso;
        return (
          <td
            key={iso}
            className={cn(
              "px-4 py-3 text-right tabular-nums",
              isWinner ? "font-semibold text-[var(--color-primary)]" : "",
            )}
          >
            {render(s)}
            {isWinner && <span className="ml-1 text-[10px]">★</span>}
          </td>
        );
      })}
    </tr>
  );
}

/** Subsection header row inside the compare table. */
function SectionHeaderRow({
  cols,
  label,
  note,
}: {
  cols: number;
  label: string;
  note?: string;
}) {
  return (
    <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/60">
      <td
        colSpan={cols}
        className="px-4 py-2 text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]"
      >
        <span className="font-semibold text-[var(--color-text)]">{label}</span>
        {note && <span className="ml-2 normal-case">{note}</span>}
      </td>
    </tr>
  );
}

/**
 * Row for a specific (channel, field) traffic metric. Lower-is-better, so the
 * winner = minimum value across selected. Shows "估算" badge when any value
 * is Hachimi-extrapolated.
 */
function TrafficRow({
  label,
  channel,
  field,
  selected,
  snapshots,
  lowerIsBetter,
}: {
  label: string;
  channel: string;
  field: "cpm_usd" | "cpc_usd";
  selected: string[];
  snapshots: Record<string, CountrySnapshot>;
  lowerIsBetter?: boolean;
}) {
  // Find the winner (smallest, since lower-is-better)
  let winnerIso: string | null = null;
  let bestV = lowerIsBetter ? Infinity : -Infinity;
  for (const iso of selected) {
    const s = snapshots[iso];
    const v = s?.traffic?.[channel]?.[field];
    if (v == null || !Number.isFinite(v)) continue;
    if (lowerIsBetter ? v < bestV : v > bestV) {
      bestV = v;
      winnerIso = iso;
    }
  }

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-4 py-3 text-[var(--color-text-dim)]">{label}</td>
      {selected.map((iso) => {
        const s = snapshots[iso];
        const cell = s?.traffic?.[channel];
        const v = cell?.[field];
        const isWinner = winnerIso === iso;
        return (
          <td
            key={iso}
            className={cn(
              "px-4 py-3 text-right tabular-nums",
              isWinner ? "font-semibold text-[var(--color-primary)]" : "",
            )}
          >
            <span className="inline-flex items-baseline gap-1">
              {v != null && Number.isFinite(v) ? `$${v.toFixed(2)}` : "—"}
              {cell?.estimated && (
                <span
                  title="Hachimi 全球基准外推（非本地实测）"
                  className="rounded-full bg-[var(--color-surface-2)] px-1 py-[1px] text-[9px] font-medium text-[var(--color-text-dim)] ring-1 ring-inset ring-[var(--color-border)]"
                >
                  估算
                </span>
              )}
              {isWinner && <span className="ml-0.5 text-[10px]">★</span>}
            </span>
          </td>
        );
      })}
    </tr>
  );
}
