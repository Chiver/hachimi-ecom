"use client";

import { useMemo, useState } from "react";
import { Calculator, Sparkles, Info } from "lucide-react";
import type { Country, RoiBenchmarks, RoiModeId } from "@/types";
import { cn } from "@/lib/utils";
import {
  calculateRoi,
  ratingFor,
  STATUS_COLOR,
  STATUS_LABEL,
  type HealthStatus,
  type RoiInputs,
  type RoiOutputs,
} from "@/lib/roi";
import { getExplainer, type KpiKey } from "@/lib/roi-explainers";
import { KpiExplainer } from "./KpiExplainer";

type Props = {
  benchmarks: RoiBenchmarks;
  countries: Country[];
  lebesgueCpmByIso: Record<string, number>;
};

type Quartile = "low" | "median" | "high";

// ------------------------------------------------------------
// Country → region resolver
// ------------------------------------------------------------
function regionForCountry(
  benchmarks: RoiBenchmarks,
  iso: string,
): { id: string; name_zh: string; vat: number; cpm: Record<string, number>; cvrMult: number; ctrMult: number; notes?: string } {
  for (const r of benchmarks.regions) {
    if (r.countries.includes(iso)) {
      return {
        id: r.id,
        name_zh: r.name_zh,
        vat: r.default_vat_pct,
        cpm: r.default_cpm,
        cvrMult: r.cvr_multiplier,
        ctrMult: r.ctr_multiplier,
        notes: r.notes,
      };
    }
  }
  // Fallback: NA defaults
  const r = benchmarks.regions[0];
  return {
    id: r.id,
    name_zh: r.name_zh,
    vat: r.default_vat_pct,
    cpm: r.default_cpm,
    cvrMult: r.cvr_multiplier,
    ctrMult: r.ctr_multiplier,
  };
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function RoiCalculator({ benchmarks, countries, lebesgueCpmByIso }: Props) {
  // Selection
  const [modeId, setModeId] = useState<RoiModeId>("meta_to_dtc");
  const [iso, setIso] = useState<string>("USA");
  const [categoryId, setCategoryId] = useState<string>("home");
  const [quartile, setQuartile] = useState<Quartile>("median");

  const country = countries.find((c) => c.iso_alpha3 === iso);
  const region = useMemo(() => regionForCountry(benchmarks, iso), [benchmarks, iso]);
  const category = useMemo(
    () => benchmarks.categories.find((c) => c.id === categoryId)!,
    [benchmarks, categoryId],
  );
  const platformDefaults = benchmarks.platform_defaults[modeId];

  // === Default values derived from selection ===
  const baseCvr = category.cvr[modeId]?.[quartile] ?? 0.01;
  const baseCtr = category.ctr[modeId]?.[quartile] ?? 0.01;
  // Apply regional multipliers
  const derivedCvr = baseCvr * region.cvrMult;
  const derivedCtr = baseCtr * region.ctrMult;
  // CPM: prefer Lebesgue (only Meta has it); else region default
  const lebesgueOverride =
    modeId === "meta_to_dtc" ? lebesgueCpmByIso[iso] : undefined;
  const derivedCpm = lebesgueOverride ?? region.cpm[modeId] ?? 10;

  // === Editable inputs (with sensible category-region defaults) ===
  const [P, setP] = useState<number>(100);
  const [dPct, setDPct] = useState<number>(10);
  const [tPct, setTPct] = useState<number>(region.vat);
  const [cPct, setCPct] = useState<number>(platformDefaults.platform_fee_pct);
  const [aPct, setAPct] = useState<number>(platformDefaults.affiliate_pct);
  const [SC, setSC] = useState<number>(8);
  const [COGS, setCOGS] = useState<number>(25);
  const [RRPct, setRRPct] = useState<number>(category.default_rr_pct);
  const [U, setU] = useState<number>(platformDefaults.stripe_fee_usd);
  const [CPM, setCPM] = useState<number>(derivedCpm);
  const [CTRPct, setCTRPct] = useState<number>(derivedCtr * 100);
  const [CVRPct, setCVRPct] = useState<number>(derivedCvr * 100);
  const [AC, setAC] = useState<number>(1000);

  // Track whether the user has manually overridden derived fields so we can
  // refresh defaults on selector changes without clobbering edits.
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // When mode/country/category/quartile changes AND user wants autosync, refresh inputs
  // that depend on derived values.
  useMemo(() => {
    if (!autoSync) return;
    setTPct(region.vat);
    setCPct(platformDefaults.platform_fee_pct);
    setAPct(platformDefaults.affiliate_pct);
    setU(platformDefaults.stripe_fee_usd);
    setRRPct(category.default_rr_pct);
    setCPM(derivedCpm);
    setCTRPct(derivedCtr * 100);
    setCVRPct(derivedCvr * 100);
    // intentional: rerun on the keys that drive derivation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeId, iso, categoryId, quartile]);

  // === Real-time calculation ===
  const inputs: RoiInputs = {
    P,
    d_pct: dPct,
    t_pct: tPct,
    c_pct: cPct,
    a_pct: aPct,
    SC,
    COGS,
    RR_pct: RRPct,
    U,
    CPM,
    CTR_pct: CTRPct,
    CVR_pct: CVRPct,
    AC,
  };
  const r = calculateRoi(inputs);
  const explain = (k: KpiKey) => getExplainer(k, r, inputs);

  const th = benchmarks.health_thresholds;

  // ---------------- UI ----------------
  return (
    <div className="mt-6 space-y-6">
      {/* === STEP 1: MODE === */}
      <section>
        <SectionTitle step="1" title="选择投放模式" subtitle="不同平台的 CTR / CVR 量级差异显著" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {benchmarks.modes.map((m) => {
            const active = modeId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setModeId(m.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40",
                )}
              >
                <div className={cn("text-xs", active ? "text-[var(--color-primary)]" : "text-[var(--color-text-dim)]")}>
                  {m.kind === "shop" ? "站内闭环" : "广告引流到独立站"}
                </div>
                <div className="mt-1 text-base font-semibold">{m.name_zh}</div>
                <div className="mt-0.5 text-xs text-[var(--color-text-dim)]">{m.name_en}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* === STEP 2: COUNTRY + CATEGORY + QUARTILE === */}
      <section>
        <SectionTitle step="2" title="选择国家 + 品类 + 默认基准分位" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>国家</Label>
            <select
              value={iso}
              onChange={(e) => setIso(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c.iso_alpha3} value={c.iso_alpha3}>
                  {c.flag_emoji} {c.name_zh} ({c.iso_alpha3})
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-[var(--color-text-dim)]">
              所属区域：<span className="text-[var(--color-text)]">{region.name_zh}</span>
              {lebesgueOverride && (
                <span className="ml-2 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-300 ring-1 ring-inset ring-blue-400/30">
                  Lebesgue CPM 可用
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>品类</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            >
              {benchmarks.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_zh} · {c.name_en}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-[var(--color-text-dim)]">
              默认退货率 {category.default_rr_pct}% · 数据置信度{" "}
              <span className="text-[var(--color-text)]">{category.confidence ?? "—"}</span>
            </div>
          </div>

          <div>
            <Label>默认基准分位</Label>
            <div className="mt-1 grid grid-cols-3 overflow-hidden rounded-md border border-[var(--color-border)]">
              {(["low", "median", "high"] as Quartile[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuartile(q)}
                  className={cn(
                    "py-2 text-sm transition-colors",
                    quartile === q
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)]",
                  )}
                >
                  {q === "low" ? "低位" : q === "median" ? "中位" : "高位"}
                </button>
              ))}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--color-text-dim)]">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="size-3.5 rounded accent-[var(--color-primary)]"
              />
              切换选择时自动重置 CTR/CVR/CPM
            </div>
          </div>
        </div>

        {region.notes && (
          <div className="mt-3 rounded-md bg-[var(--color-surface)]/60 px-3 py-2 text-[11px] text-[var(--color-text-dim)]">
            <Info className="mr-1 inline size-3" />
            {region.notes}
          </div>
        )}
      </section>

      {/* === STEP 3 + 4: INPUTS + KPI === */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[460px_1fr]">
        {/* INPUTS */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <SectionTitle step="3" title="参数输入 (可调)" />

          <Group title="商品 / 售价">
            <NumberInput label="P · 售价 (USD)" value={P} onChange={setP} step={1} />
            <NumberInput label="d · 折扣 (%)" value={dPct} onChange={setDPct} suffix="%" step={1} />
            <NumberInput label="t · VAT / 销售税 (%)" value={tPct} onChange={setTPct} suffix="%" step={1} hint={`${region.name_zh} 默认 ${region.vat}%`} />
            <NumberInput label="COGS · 1688 出厂价 (USD)" value={COGS} onChange={setCOGS} step={1} />
          </Group>

          <Group title="物流 / 履约">
            <NumberInput label="SC · 单件物流 (USD)" value={SC} onChange={setSC} step={0.5} />
            <NumberInput label="RR · 退货率 (%)" value={RRPct} onChange={setRRPct} suffix="%" step={1} hint={`${category.name_zh} 默认 ${category.default_rr_pct}%`} />
            <NumberInput label="U · 不可退手续费 (USD)" value={U} onChange={setU} step={0.05} hint="Stripe 等" />
          </Group>

          <Group title="平台 / 抽佣">
            <NumberInput label="c · 平台抽成 (%)" value={cPct} onChange={setCPct} suffix="%" step={0.1} hint={platformDefaults.platform_fee_label} />
            <NumberInput label="a · 达人 / 联盟分成 (%)" value={aPct} onChange={setAPct} suffix="%" step={1} hint={modeId === "tiktok_to_shop" ? "TikTok Shop 典型 15-25%" : "独立站无"} />
          </Group>

          <Group title="广告漏斗">
            <NumberInput
              label="CPM · 千次曝光 (USD)"
              value={CPM}
              onChange={setCPM}
              step={0.5}
              hint={
                lebesgueOverride
                  ? `Lebesgue 2026: $${lebesgueOverride.toFixed(2)}（${country?.name_zh}）`
                  : `${region.name_zh} 默认 $${region.cpm[modeId].toFixed(1)}`
              }
            />
            <NumberInput
              label="CTR · 点击率 (%)"
              value={CTRPct}
              onChange={setCTRPct}
              suffix="%"
              step={0.05}
              hint={`${category.name_zh} ${quartile === "low" ? "低位" : quartile === "median" ? "中位" : "高位"} ${(derivedCtr * 100).toFixed(2)}%`}
            />
            <NumberInput
              label="CVR · 转化率 (%)"
              value={CVRPct}
              onChange={setCVRPct}
              suffix="%"
              step={0.1}
              hint={`${category.name_zh} ${quartile === "low" ? "低位" : quartile === "median" ? "中位" : "高位"} ${(derivedCvr * 100).toFixed(2)}%`}
            />
            <NumberInput label="AC · 总广告花费 (USD)" value={AC} onChange={setAC} step={100} />
          </Group>
        </section>

        {/* KPI OUTPUT */}
        <section className="space-y-4">
          <SectionTitle step="4" title="实时 ROI / 净利率结果" />

          {/* Hero card — overall ROI */}
          <div
            className={cn(
              "rounded-xl border p-5 ring-1 ring-inset transition-colors",
              ratingFor(r.ROI_marginal, th.roi_marginal) === "excellent" &&
                "border-emerald-400/40 bg-emerald-500/10 ring-emerald-400/30",
              ratingFor(r.ROI_marginal, th.roi_marginal) === "healthy" &&
                "border-emerald-400/30 bg-emerald-500/5 ring-emerald-400/20",
              ratingFor(r.ROI_marginal, th.roi_marginal) === "warning" &&
                "border-amber-400/30 bg-amber-500/5 ring-amber-400/20",
              ratingFor(r.ROI_marginal, th.roi_marginal) === "danger" &&
                "border-red-400/40 bg-red-500/10 ring-red-400/30",
            )}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <BigStat
                label="Marginal ROI"
                value={`${r.ROI_marginal.toFixed(2)}x`}
                subtitle="G / AC · >1x 即盈利"
                rating={ratingFor(r.ROI_marginal, th.roi_marginal)}
                explainer={explain("ROI_marginal")}
                primary
              />
              <BigStat
                label="净利率"
                value={`${(r.NetProfitMargin * 100).toFixed(1)}%`}
                subtitle="目标 5-15%"
                rating={ratingFor(r.NetProfitMargin, th.net_profit_margin)}
                explainer={explain("NetProfitMargin")}
              />
              <BigStat
                label="总净利"
                value={`$${r.TotalNetProfit.toFixed(0)}`}
                subtitle={`${r.N.toFixed(1)} 单 × $${r.E_unit.toFixed(2)} 贡献毛利 - $${AC} 广告`}
                rating={r.TotalNetProfit >= 0 ? "healthy" : "danger"}
                explainer={explain("TotalNetProfit")}
              />
            </div>
          </div>

          {/* Detailed KPI table */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <KpiCard title="收益 (Per-Unit Economics)">
              <KpiRow label="NetSales · 净销售额" value={`$${r.NetSales.toFixed(2)}`} explainer={explain("NetSales")} />
              <KpiRow label="Profit_kept · 保单利润" value={`$${r.Profit_kept.toFixed(2)}`} explainer={explain("Profit_kept")} />
              <KpiRow label="Profit_returned · 返单损失" value={`-$${Math.abs(r.Profit_returned).toFixed(2)}`} accent="red" explainer={explain("Profit_returned")} />
              <KpiRow label="E_unit · 单笔贡献毛利" value={`$${r.E_unit.toFixed(2)}`} accent={r.E_unit > 0 ? "emerald" : "red"} bold explainer={explain("E_unit")} />
              <KpiRow label="单笔净利（含广告）" value={`$${r.PerUnitNetProfit.toFixed(2)}`} accent={r.PerUnitNetProfit > 0 ? "emerald" : "red"} bold explainer={explain("PerUnitNetProfit")} />
            </KpiCard>

            <KpiCard title="广告漏斗 (Funnel)">
              <KpiRow label="N · 总订单数 (来自广告)" value={`${r.N.toFixed(1)} 单`} explainer={explain("N")} />
              <KpiRow label="AdCost / Order" value={`$${Number.isFinite(r.AdCost_per_order) ? r.AdCost_per_order.toFixed(2) : "∞"}`} explainer={explain("AdCost_per_order")} />
              <KpiRow label="Total Sales (含广告)" value={`$${r.TotalSales.toFixed(0)}`} explainer={explain("TotalSales")} />
              <KpiRow label="G · 总贡献毛利 (不含广告)" value={`$${r.G.toFixed(0)}`} explainer={explain("G")} />
            </KpiCard>

            <KpiCard title="ROI 系列指标">
              <KpiRow
                label="ROAS"
                value={`${r.ROAS.toFixed(2)}x`}
                badge={STATUS_LABEL[ratingFor(r.ROAS, th.roas)]}
                badgeRating={ratingFor(r.ROAS, th.roas)}
                explainer={explain("ROAS")}
              />
              <KpiRow
                label="Break-Even ROAS"
                value={Number.isFinite(r.BreakEvenROAS) ? `${r.BreakEvenROAS.toFixed(2)}x` : "∞"}
                hint="ROAS 必须 > 此值才能赚"
                explainer={explain("BreakEvenROAS")}
              />
              <KpiRow
                label="Marginal ROI"
                value={`${r.ROI_marginal.toFixed(2)}x`}
                badge={STATUS_LABEL[ratingFor(r.ROI_marginal, th.roi_marginal)]}
                badgeRating={ratingFor(r.ROI_marginal, th.roi_marginal)}
                explainer={explain("ROI_marginal")}
              />
              <KpiRow label="Net ROI" value={`${(r.Net_ROI * 100).toFixed(1)}%`} accent={r.Net_ROI > 0 ? "emerald" : "red"} explainer={explain("Net_ROI")} />
              <KpiRow label="MER" value={`${r.MER.toFixed(2)}x`} explainer={explain("MER")} />
            </KpiCard>

            <KpiCard title="利润率三层">
              <KpiRow
                label="毛利率 (Gross Margin)"
                value={`${(r.GrossMargin * 100).toFixed(1)}%`}
                badge={STATUS_LABEL[ratingFor(r.GrossMargin, th.gross_margin)]}
                badgeRating={ratingFor(r.GrossMargin, th.gross_margin)}
                explainer={explain("GrossMargin")}
              />
              <KpiRow
                label="贡献毛利率 (Contribution Margin)"
                value={`${(r.ContributionMargin * 100).toFixed(1)}%`}
                badge={STATUS_LABEL[ratingFor(r.ContributionMargin, th.contribution_margin)]}
                badgeRating={ratingFor(r.ContributionMargin, th.contribution_margin)}
                explainer={explain("ContributionMargin")}
              />
              <KpiRow
                label="净利率 (Net Profit Margin)"
                value={`${(r.NetProfitMargin * 100).toFixed(1)}%`}
                badge={STATUS_LABEL[ratingFor(r.NetProfitMargin, th.net_profit_margin)]}
                badgeRating={ratingFor(r.NetProfitMargin, th.net_profit_margin)}
                explainer={explain("NetProfitMargin")}
              />
            </KpiCard>
          </div>

          {/* Formula box */}
          <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--color-text-dim)]">
              <Calculator className="size-4 text-[var(--color-primary)]" />
              查看计算公式 (ROI 公式合集 v1.0)
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)] p-3 text-[11px] leading-relaxed">
{`NetSales = P × (1 - d) / (1 + t)

E_unit = (1 - RR) × NetSales × (1 - c - a)
       - (SC + COGS)
       - RR × U

N = AC × 1000 × CTR × CVR / CPM
AdCost_per_order = CPM / (1000 × CTR × CVR)

G = N × E_unit
Total Net Profit = G - AC
ROI = G / AC                    >1x 即盈利
ROAS = N × NetSales / AC
Break-Even ROAS = NetSales / E_unit

Gross Margin       = (NetSales - COGS) / NetSales
Contribution Margin = E_unit / NetSales
Net Profit Margin  = Per-Unit Net Profit / NetSales`}
            </pre>
            <div className="mt-2 text-[10px] text-[var(--color-text-dim)]">
              健康线（家居家具基准）：ROI &gt;1.5x · 净利率 5-15% · ROAS &gt;3x · 贡献毛利率 30-45%
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function SectionTitle({
  step,
  title,
  subtitle,
}: {
  step?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      {step && (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-xs font-bold text-[var(--color-primary)]">
          {step}
        </span>
      )}
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <span className="text-xs text-[var(--color-text-dim)]">· {subtitle}</span>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
        {title}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
      {children}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-[var(--color-text-dim)]">{label}</div>
      <div className="mt-0.5 flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)] focus-within:border-[var(--color-primary)]">
        <input
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="w-full bg-transparent px-3 py-1.5 text-sm tabular-nums text-[var(--color-text)] outline-none"
        />
        {suffix && (
          <span className="pr-2 text-xs text-[var(--color-text-dim)]">{suffix}</span>
        )}
      </div>
      {hint && (
        <div className="mt-1 truncate text-[10px] text-[var(--color-text-dim)]">{hint}</div>
      )}
    </label>
  );
}

function BigStat({
  label,
  value,
  subtitle,
  rating,
  primary,
  explainer,
}: {
  label: string;
  value: string;
  subtitle?: string;
  rating?: HealthStatus;
  primary?: boolean;
  explainer?: ReturnType<typeof getExplainer>;
}) {
  const color = rating ? STATUS_COLOR[rating] : "";
  const valueEl = (
    <span
      className={cn(
        "tabular-nums font-bold",
        primary ? "text-5xl" : "text-3xl",
        rating === "excellent" || rating === "healthy"
          ? "text-emerald-300"
          : rating === "warning"
            ? "text-amber-300"
            : rating === "danger"
              ? "text-red-300"
              : "text-[var(--color-text)]",
      )}
    >
      {value}
    </span>
  );
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
        {label}
      </div>
      <div className="mt-1">
        {explainer ? (
          <KpiExplainer data={explainer}>{valueEl}</KpiExplainer>
        ) : (
          valueEl
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {rating && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              color,
            )}
          >
            {STATUS_LABEL[rating]}
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] text-[var(--color-text-dim)]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-3.5 text-[var(--color-primary)]" />
        {title}
      </div>
      <dl className="mt-2 space-y-1">{children}</dl>
    </div>
  );
}

function KpiRow({
  label,
  value,
  accent,
  bold,
  badge,
  badgeRating,
  hint,
  explainer,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "red";
  bold?: boolean;
  badge?: string;
  badgeRating?: HealthStatus;
  hint?: string;
  explainer?: ReturnType<typeof getExplainer>;
}) {
  const valueEl = (
    <span
      className={cn(
        "text-[13px] tabular-nums",
        bold ? "font-bold" : "font-medium",
        accent === "emerald" && "text-emerald-300",
        accent === "red" && "text-red-300",
      )}
    >
      {value}
    </span>
  );
  return (
    <div className="flex items-baseline justify-between gap-2 rounded-md px-1 py-1 hover:bg-[var(--color-bg-from)]/50">
      <span className="text-[12px] text-[var(--color-text-dim)]">
        {label}
        {hint && <span className="ml-1 text-[10px]">· {hint}</span>}
      </span>
      <span className="flex items-center gap-1.5">
        {badge && badgeRating && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              STATUS_COLOR[badgeRating],
            )}
          >
            {badge}
          </span>
        )}
        {explainer ? <KpiExplainer data={explainer}>{valueEl}</KpiExplainer> : valueEl}
      </span>
    </div>
  );
}
