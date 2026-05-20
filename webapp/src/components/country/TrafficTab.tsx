import type { CountryData } from "@/types";
import { HachimiDerivedBadge, PendingBadge } from "@/components/SourceBadge";
import { ExternalLink, Info, FileText } from "lucide-react";
import { formatPct } from "@/lib/utils";
import {
  getAvailableCountryIsos,
  getCountryData,
  getAllCountries,
  getLebesgueMetaCpm,
  getLebesgueMetadata,
} from "@/lib/data";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";

const CHANNEL_LABEL: Record<string, string> = {
  meta: "Meta (FB/IG)",
  google_search: "Google Search",
  google_display: "Google Display",
  tiktok: "TikTok",
  amazon_ppc: "Amazon PPC",
  kakao: "Kakao (Korea)",
  naver_search: "Naver Search (Korea)",
  vk_ads: "VK Ads (Russia)",
  yahoo_search: "Yahoo Search (Japan)",
  yandex_search: "Yandex (Russia)",
};

/** Heuristic: is this source a Hachimi-extrapolated global benchmark? */
function isHachimiEstimated(sourceUrl: string | undefined): boolean {
  if (!sourceUrl) return true;
  return (
    sourceUrl.startsWith("Hachimi") ||
    sourceUrl.toLowerCase().includes("hachimi benchmark")
  );
}

/** Returns the actual source domain or file name for the link/text. */
function sourceDisplay(u: string | undefined): { isLink: boolean; text: string } {
  if (!u) return { isLink: false, text: "未提供" };
  if (/^https?:\/\//i.test(u)) {
    try {
      return { isLink: true, text: new URL(u).hostname.replace(/^www\./, "") };
    } catch {
      return { isLink: true, text: u };
    }
  }
  return { isLink: false, text: u };
}

export function TrafficTab({ data }: { data: CountryData }) {
  const iso = data.country.iso_alpha3;

  // Build cross-country comparison rows for each channel CPM
  const countries = getAllCountries();
  const buildBenchmark = (
    metric: "cpm_usd" | "cpc_usd",
    channel: string,
  ): BenchmarkRow[] => {
    const rows: BenchmarkRow[] = [];
    for (const i of getAvailableCountryIsos()) {
      const d = getCountryData(i);
      const t = d?.traffic_economics.find((x) => x.channel === channel);
      const v = t?.[metric];
      if (v != null && Number.isFinite(v)) {
        const c = countries.find((c) => c.iso_alpha3 === i);
        rows.push({
          iso: i,
          label: `${c?.flag_emoji ?? ""} ${c?.name_zh ?? i}`,
          value: v as number,
        });
      }
    }
    return rows;
  };

  // Lebesgue Meta CPM benchmark — independent third-party dataset
  const lebesgueCpm = getLebesgueMetaCpm(iso);
  const lebesgueMeta = getLebesgueMetadata();
  const lebesgueBenchmark: BenchmarkRow[] = Object.entries(lebesgueMeta.by_country)
    .map(([i, v]) => {
      const c = countries.find((c) => c.iso_alpha3 === i);
      return c
        ? { iso: i, label: `${c.flag_emoji ?? ""} ${c.name_zh}`, value: v }
        : null;
    })
    .filter((r): r is BenchmarkRow => r !== null);

  // Group by channel for the comparison section
  const channelsWithData = Array.from(
    new Set(data.traffic_economics.map((t) => t.channel)),
  );

  return (
    <div className="space-y-6">
      {/* CRITICAL: Definition box — what is "typical_conversion_rate_pct"? */}
      <section className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm">
        <div className="flex items-baseline gap-2">
          <Info className="size-4 shrink-0 text-amber-400" />
          <h3 className="font-semibold">指标定义（必读）</h3>
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
          <Def
            term="CPM (Cost per Mille)"
            def="每千次广告**展示**的成本。CPM = 广告花费 / (展示数 / 1000)。衡量曝光成本，不涉及点击。"
          />
          <Def
            term="CPC (Cost per Click)"
            def="每次广告**点击**的成本。CPC = 广告花费 / 点击数。衡量进站成本，与转化率配合算 CAC。"
          />
          <Def
            term="典型转化率 (per-click)"
            def={[
              "**广告点击 → 完成购买**的比例（per-click，非 per-impression、非 per-session）。",
              "公式：转化率 = 购买数 / 广告点击数 × 100%。",
              "**与 Statista「全站访问→购买」转化率不同**：Statista 是 per-session（全站访问→购买）；本指标是 per-click（广告点击→购买）。两者数字差异巨大（per-click 通常 1-5%，per-session 通常 1.5-4%，但定义不重合）。",
              "Data Source 实际为：Revealbot (Meta 广告基准) / WordStream (Google 广告基准) / Madgicx (TikTok 广告基准) — 这些是**全球行业基准**，多数国家无本地实测数据。",
            ].join(" ")}
            warning
          />
        </dl>
        <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-500/5 p-2 text-[11px]">
          ⚠️ <span className="font-semibold">注意</span>：跨境电商团队若要做"广告花费 →
          GMV"决策，应使用**本指标 (per-click)**；若要评估"全站漏斗优化"，请用 Statista
          的 per-session 转化率（数据源：
          <code className="rounded bg-[var(--color-bg-from)] px-1 text-[10px]">
            data/raw/statista/statistic_id439576_quarterly-global-online-shopper-conversion-rate-2025-by-country-and-region.xlsx
          </code>
          ，未在本表呈现）。
        </div>
      </section>

      {/* === Lebesgue benchmark (third-party, 2026) === */}
      <section className="rounded-xl border border-blue-400/30 bg-blue-500/5 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              Meta CPM · Lebesgue {lebesgueMeta._period} 基准
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300 ring-1 ring-inset ring-blue-400/30">
                第三方独立数据
              </span>
            </h3>
            <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
              Lebesgue 2026 年 3 月发布的 Facebook eCommerce CPM 国别基准 · 覆盖 51
              国（含 Hachimi 追踪 32 国里的 {lebesgueBenchmark.length} 个）。
            </p>
          </div>
          <a
            href={lebesgueMeta._source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] text-blue-300 hover:underline"
          >
            <ExternalLink className="size-3" /> Lebesgue 原文
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          {/* Current country card */}
          <div className="rounded-lg border border-blue-400/30 bg-[var(--color-surface)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-blue-300">
              {data.country.name_zh} Meta CPM
            </div>
            {lebesgueCpm ? (
              <>
                <div className="mt-2 text-4xl font-bold tabular-nums text-blue-300">
                  ${lebesgueCpm.cpm_usd.toFixed(2)}
                </div>
                <div className="mt-1 text-[10px] text-[var(--color-text-dim)]">
                  数据周期：{lebesgueCpm.period} · 置信度 {lebesgueCpm.confidence}
                </div>
                <div className="mt-3 text-[10px] text-[var(--color-text-dim)]">
                  来源：
                  <a
                    href={lebesgueCpm.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline"
                  >
                    {lebesgueCpm.source_name}
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 text-2xl font-bold text-[var(--color-text-dim)]">
                  —
                </div>
                <div className="mt-1 text-[10px] text-[var(--color-text-dim)]">
                  Lebesgue 2026 未覆盖本国（缺 TUR / RUS / IDN / THA / VNM / ARG）
                </div>
              </>
            )}
          </div>

          {/* Cross-country benchmark chart */}
          <div>
            <BenchmarkChart
              rows={lebesgueBenchmark}
              highlightIso={iso}
              title="Lebesgue Meta CPM 横向对比 (USD)"
              format={{ prefix: "$", decimals: 2 }}
            />
          </div>
        </div>
      </section>

      {/* Channel table */}
      {data.traffic_economics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-dim)]">
          <PendingBadge /> 流量经济数据待补
        </div>
      ) : (
        <section>
          <h3 className="mb-2 text-base font-semibold">
            本国渠道指标（{data.country.name_zh}）
          </h3>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-4 py-3 text-left">渠道</th>
                  <th className="px-4 py-3 text-right">CPM (USD)</th>
                  <th className="px-4 py-3 text-right">CPC (USD)</th>
                  <th className="px-4 py-3 text-right">
                    转化率 (per-click)
                  </th>
                  <th className="px-4 py-3 text-left">数据源</th>
                  <th className="px-4 py-3 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {data.traffic_economics.map((t, i) => {
                  const estimated = isHachimiEstimated(t.source_url);
                  const src = sourceDisplay(t.source_url);
                  return (
                    <tr
                      key={`${t.channel}-${i}`}
                      className="border-t border-[var(--color-border)]"
                    >
                      <td className="px-4 py-3 font-medium">
                        {CHANNEL_LABEL[t.channel] ?? t.channel}{" "}
                        <span className="text-[10px] text-[var(--color-text-dim)]">
                          {t.year}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {t.cpm_usd != null ? `$${t.cpm_usd.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {t.cpc_usd != null ? `$${t.cpc_usd.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatPct(t.typical_conversion_rate_pct, 2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {estimated && <HachimiDerivedBadge />}
                          {src.isLink ? (
                            <a
                              href={t.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              {src.text}
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
                              <FileText className="size-3" /> {src.text}
                            </span>
                          )}
                        </div>
                        {estimated && (
                          <div className="mt-1 text-[10px] text-amber-300/90">
                            非本地实测，来自全球广告基准外推
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-dim)]">
                        {t.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Cross-country comparison */}
      {channelsWithData.length > 0 && (
        <section>
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-semibold">32 国横向对比</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              当前国（{data.country.name_zh}）以 emerald 高亮
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
            注：横向比较时请记得 96% 的非波兰数据是 Hachimi 全球基准外推，国别细节有限。CPM/CPC
            主要反映各国广告市场成熟度 + 竞争密度。
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {channelsWithData.map((ch) => {
              const cpmRows = buildBenchmark("cpm_usd", ch);
              const cpcRows = buildBenchmark("cpc_usd", ch);
              return (
                <div key={ch} className="space-y-3">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
                    {CHANNEL_LABEL[ch] ?? ch}
                  </div>
                  <BenchmarkChart
                    rows={cpmRows}
                    highlightIso={iso}
                    title={`${CHANNEL_LABEL[ch] ?? ch} CPM (USD / 1000 展示)`}
                    format={{ prefix: "$", decimals: 2 }}
                    height={320}
                  />
                  <BenchmarkChart
                    rows={cpcRows}
                    highlightIso={iso}
                    title={`${CHANNEL_LABEL[ch] ?? ch} CPC (USD / 点击)`}
                    format={{ prefix: "$", decimals: 2 }}
                    height={320}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Def({
  term,
  def,
  warning,
}: {
  term: string;
  def: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-md border ${
        warning
          ? "border-amber-400/30 bg-amber-500/10"
          : "border-[var(--color-border)] bg-[var(--color-bg-from)]/40"
      } p-3`}
    >
      <div className="text-[11px] font-semibold">{term}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-dim)]">
        {def}
      </div>
    </div>
  );
}
