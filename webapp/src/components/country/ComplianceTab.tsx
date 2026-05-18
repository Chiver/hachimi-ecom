import type { CountryData, Compliance } from "@/types";
import {
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Receipt,
  Lock,
  Network,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import { GlossaryTerm } from "@/components/GlossaryTerm";
import {
  getTaxTable,
  getCertsByCategory,
  groupCountryCompliance,
} from "@/lib/compliance";
import { BenchmarkChart, type BenchmarkRow } from "./BenchmarkChart";

const SEVERITY_STYLE: Record<string, string> = {
  blocking: "text-red-300 bg-red-500/15 ring-red-400/40",
  critical: "text-red-300 bg-red-500/15 ring-red-400/40",
  high: "text-amber-300 bg-amber-500/15 ring-amber-400/40",
  medium: "text-yellow-200 bg-yellow-500/10 ring-yellow-400/30",
  low: "text-[var(--color-text-dim)] bg-[var(--color-surface-2)] ring-[var(--color-border)]",
};

const EVENT_TYPE_LABEL: Record<string, string> = {
  tariff: "关税",
  vat_change: "VAT 变更",
  de_minimis_change: "免税额变化",
  cert_requirement: "认证要求",
  data_law: "数据法",
  sanctions: "制裁",
  labeling: "标签要求",
  tax: "税务变更",
};

export function ComplianceTab({ data }: { data: CountryData }) {
  const iso = data.country.iso_alpha3;
  const groups = groupCountryCompliance(data);
  const today = new Date();

  // Tax benchmark across countries
  const taxTable = getTaxTable();
  const taxBench: BenchmarkRow[] = taxTable
    .filter((r) => r.standard_rate != null)
    .map((r) => ({
      iso: r.iso,
      label: `${r.flag_emoji ?? ""} ${r.name_zh}`,
      value: r.standard_rate as number,
    }));

  const currentTaxRow = taxTable.find((r) => r.iso === iso);
  const currentRate = currentTaxRow?.standard_rate ?? null;

  // Category certifications (matrix across 32 countries)
  const certsByCat = getCertsByCategory();
  const events = [...data.policy_events].sort((a, b) =>
    a.event_date.localeCompare(b.event_date),
  );

  return (
    <div className="space-y-6">
      {/* === Section A: 税率与税务 === */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-baseline gap-2">
          <Receipt className="size-4 text-[var(--color-primary)]" />
          <h3 className="text-base font-semibold">税率与税务</h3>
          <span className="text-[11px] text-[var(--color-text-dim)]">
            直接影响每单成本 · 必看
          </span>
        </div>

        {groups.tax.length === 0 ? (
          <div className="mt-4 text-sm text-[var(--color-text-dim)]">税务规则数据待补</div>
        ) : (
          <>
            {/* Hero card: 本国标准税率 */}
            {currentTaxRow && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
                    {data.country.name_zh} {currentTaxRow.system}
                  </div>
                  <div className="mt-1 text-4xl font-bold tabular-nums text-[var(--color-primary)]">
                    {currentRate != null ? `${currentRate}%` : "—"}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--color-text-dim)]">
                    标准税率
                  </div>
                  {currentTaxRow.rule.threshold_value && (
                    <div className="mt-3 rounded-md bg-[var(--color-bg-from)]/40 p-2 text-[11px] leading-relaxed">
                      <div className="font-semibold text-[var(--color-text)]">
                        档位详情
                      </div>
                      <div className="mt-0.5 text-[var(--color-text-dim)]">
                        {currentTaxRow.rule.threshold_value}
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                    申报机制与卖家义务
                  </div>
                  <div className="mt-1 text-sm leading-relaxed">
                    {currentTaxRow.rule.description ??
                      "暂无详细描述，请查看下方原始规则条目或下方'数据源链接'。"}
                  </div>
                  {/* Procedural hints derived from common keywords */}
                  <FilingProcedure rule={currentTaxRow.rule} country={data.country.name_zh} />
                </div>
              </div>
            )}

            {/* Other tax rules in this country (e.g. USA has multiple: Section 321 / 301 / 1099-K) */}
            {groups.tax.length > 1 && (
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-[var(--color-text-dim)]">
                  其它税务规则
                </div>
                {groups.tax
                  .filter((r) => r !== currentTaxRow?.rule)
                  .map((r, i) => (
                    <RuleRow key={i} rule={r} />
                  ))}
              </div>
            )}

            {/* Horizontal comparison */}
            {taxBench.length > 1 && (
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
                  32 国 标准税率横向对比
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
                  仅显示从 rule_name / threshold_value 字段中可解析的"标准税率"；超级低/复杂税
                  制（如巴西 ICMS、美国州税）以最常出现的数字代表。
                </p>
                <div className="mt-3">
                  <BenchmarkChart
                    rows={taxBench}
                    highlightIso={iso}
                    title="标准 VAT / GST / Sales Tax 税率 (%)"
                    format={{ suffix: "%", decimals: 0 }}
                    height={Math.max(360, taxBench.length * 16)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* === Section B: 必备产品认证 (按品类) === */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-baseline gap-2">
          <ShieldCheck className="size-4 text-[var(--color-primary)]" />
          <h3 className="text-base font-semibold">必备产品认证（本国）</h3>
          <span className="text-[11px] text-[var(--color-text-dim)]">
            未取得认证的 Listing 会被平台下架
          </span>
        </div>

        {groups.certs.length === 0 ? (
          <div className="mt-4 text-sm text-[var(--color-text-dim)]">
            本国无强制认证规则记录
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {groups.certs.map((c, i) => (
              <li key={i}>
                <RuleRow rule={c} highlightCategories />
              </li>
            ))}
          </ul>
        )}

        {/* Per-category cross-country card matrix (small, dense) */}
        {Object.keys(certsByCat).length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
              全球认证 · 按品类横向汇总（所有 32 国数据）
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(certsByCat)
                .filter(([cat]) => cat !== "_general")
                .map(([cat, items]) => {
                  // Distinct cert names per category
                  const names = Array.from(
                    new Set(items.map((it) => it.rule.rule_name)),
                  );
                  return (
                    <div
                      key={cat}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 p-3"
                    >
                      <div className="text-sm font-semibold">
                        {categoryLabel(cat)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {names.map((n) => (
                          <span
                            key={n}
                            className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] text-purple-300 ring-1 ring-inset ring-purple-400/30"
                          >
                            {n.length > 26 ? `${n.slice(0, 24)}…` : n}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] text-[var(--color-text-dim)]">
                        覆盖国家：{items.map((it) => it.iso).join(" · ")}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* === Section C: 数据/平台/其它 === */}
      {(groups.dataPrivacy.length > 0 ||
        groups.platform.length > 0 ||
        groups.other.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.dataPrivacy.length > 0 && (
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-baseline gap-2">
                <Lock className="size-4 text-blue-300" />
                <h3 className="text-base font-semibold">数据与隐私</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {groups.dataPrivacy.map((c, i) => (
                  <li key={i}>
                    <RuleRow rule={c} compact />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {groups.platform.length > 0 && (
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-baseline gap-2">
                <Network className="size-4 text-blue-300" />
                <h3 className="text-base font-semibold">平台代缴 / 中介责任</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {groups.platform.map((c, i) => (
                  <li key={i}>
                    <RuleRow rule={c} compact />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {groups.other.length > 0 && (
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:col-span-2">
              <div className="flex items-baseline gap-2">
                <Briefcase className="size-4 text-[var(--color-text-dim)]" />
                <h3 className="text-base font-semibold">其它规则 / IP / 知产</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {groups.other.map((c, i) => (
                  <li key={i}>
                    <RuleRow rule={c} compact />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* === Section D: 政策时间轴 === */}
      {events.length > 0 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-baseline gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            <h3 className="text-base font-semibold">
              政策时间轴（{events.length}）
            </h3>
          </div>
          <ol className="mt-4 space-y-3 border-l border-[var(--color-border)] pl-4">
            {events.map((ev, i) => {
              const d = new Date(ev.event_date);
              const diffDays = Math.round(
                (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
              );
              const past = diffDays < 0;
              const soon = !past && diffDays <= 30;
              const upcoming = !past && diffDays > 30 && diffDays <= 90;
              return (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-1 size-2 rounded-full ring-4 ring-[var(--color-surface)]",
                      past
                        ? "bg-[var(--color-text-dim)]"
                        : soon
                          ? "bg-red-400"
                          : upcoming
                            ? "bg-amber-400"
                            : "bg-[var(--color-primary)]",
                    )}
                  />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={cn(
                        "text-xs font-mono",
                        past
                          ? "text-[var(--color-text-dim)]"
                          : soon
                            ? "text-red-300"
                            : "text-[var(--color-text)]",
                      )}
                    >
                      {ev.event_date}
                    </span>
                    <span className="rounded-md bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
                      {EVENT_TYPE_LABEL[ev.event_type] ?? ev.event_type}
                    </span>
                    {soon && (
                      <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                        {diffDays} 天后
                      </span>
                    )}
                    {past && (
                      <span className="rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
                        已生效
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    <GlossaryTerm term={firstWord(ev.title)}>
                      <span>{ev.title}</span>
                    </GlossaryTerm>
                  </div>
                  {ev.description && (
                    <p className="mt-1 text-xs text-[var(--color-text-dim)]">
                      {ev.description}
                    </p>
                  )}
                  {ev.source_url && (
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline"
                    >
                      <ExternalLink className="size-3" /> 来源
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

/** Re-usable rule row (used in every section). */
function RuleRow({
  rule,
  compact,
  highlightCategories,
}: {
  rule: Compliance;
  compact?: boolean;
  highlightCategories?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
            {RULE_TYPE_LABEL[rule.rule_type] ?? rule.rule_type}
          </div>
          <div className="mt-0.5 font-semibold">
            <GlossaryTerm term={firstWord(rule.rule_name)}>
              <span>{rule.rule_name}</span>
            </GlossaryTerm>
          </div>
        </div>
        {rule.severity && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              SEVERITY_STYLE[rule.severity],
            )}
          >
            {rule.severity}
          </span>
        )}
      </div>
      {!compact && rule.description && (
        <p className="mt-2 text-xs text-[var(--color-text-dim)]">
          {rule.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-dim)]">
        {rule.threshold_value && <span>阈值: {rule.threshold_value}</span>}
        {rule.effective_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" /> 生效 {rule.effective_date}
          </span>
        )}
      </div>
      {highlightCategories &&
        rule.applies_to_categories &&
        rule.applies_to_categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {rule.applies_to_categories.slice(0, 8).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] text-purple-300"
              >
                {categoryLabel(cat)}
              </span>
            ))}
            {rule.applies_to_categories.length > 8 && (
              <span className="text-[10px] text-[var(--color-text-dim)]">
                +{rule.applies_to_categories.length - 8}
              </span>
            )}
          </div>
        )}
      {rule.source_url && (
        <a
          href={rule.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline"
        >
          <ExternalLink className="size-3" /> 官方链接
        </a>
      )}
    </div>
  );
}

const RULE_TYPE_LABEL: Record<string, string> = {
  de_minimis: "免税阈值",
  vat_threshold: "VAT 税率",
  marketplace_facilitator: "平台代缴",
  data_privacy: "数据隐私",
  product_cert: "产品认证",
  ip_enforcement: "知产执法",
  labeling: "标签要求",
  tax: "税务",
};

function firstWord(s: string): string {
  return s.split(/[\s\(（·]/)[0];
}

/** Derive a filing-procedure summary from rule description keywords. */
function FilingProcedure({ rule, country }: { rule: Compliance; country: string }) {
  const desc = (rule.description ?? "").toLowerCase();
  const items: { label: string; text: string }[] = [];

  if (desc.includes("oss") || desc.includes("ioss")) {
    items.push({
      label: "OSS / IOSS",
      text: "卖家在欧盟某成员国注册 OSS（销售至消费者）/ IOSS（≤€150 进口），即可统一申报 27 国 VAT。中国卖家通常委托欧盟境内财税代表（Avalara / hellotax / Taxually）。",
    });
  }
  if (desc.includes("voec")) {
    items.push({
      label: "VOEC 申报",
      text: "挪威 VAT on E-Commerce 独立体系（不属于欧盟 OSS）。卖家需在挪威税务局单独注册 VOEC 号，每季度报税。",
    });
  }
  if (desc.includes("deemed supplier") || desc.includes("代缴") || desc.includes("代收")) {
    items.push({
      label: "平台代缴",
      text: "亚马逊 / Allegro / eBay 等被定义为 Deemed Supplier 时，平台代收代缴 VAT，卖家无需在每国单独注册（但仍需 OSS / IOSS 号）。",
    });
  }
  if (desc.includes("dac7")) {
    items.push({
      label: "DAC7 数据上报",
      text: "欧盟要求平台向各国税局上报卖家身份 + 季度交易数（≥€2000 或 30 笔）。卖家需确保 KYC 信息真实。",
    });
  }
  if (desc.includes("usmca") || desc.includes("ftaa") || desc.includes("自贸")) {
    items.push({
      label: "自贸协定",
      text: "符合区域原产规则的商品可享受低关税 / 零关税。卖家需提供 Certificate of Origin（USMCA 中是 Annex 5-A 申报）。",
    });
  }

  if (items.length === 0) {
    return (
      <p className="mt-2 text-[11px] text-[var(--color-text-dim)]">
        申报流程：建议通过本地财税代表（如 {country} 当地会计师事务所 / Avalara / hellotax）完成
        VAT 注册 + 月度/季度申报。中国卖家典型成本 €30-200/月。
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px]">
          <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
          <span>
            <span className="font-medium text-[var(--color-text)]">{it.label}：</span>
            <span className="text-[var(--color-text-dim)]">{it.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
