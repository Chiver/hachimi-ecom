import type { CountryData } from "@/types";
import { PendingBadge, SourceBadge } from "@/components/SourceBadge";
import { Truck, CreditCard, Warehouse } from "lucide-react";
import { formatPct } from "@/lib/utils";
import { GlossaryTerm } from "@/components/GlossaryTerm";
import {
  getPaymentInfo,
  getCarrierInfo,
  getWarehouseInfo,
} from "@/lib/data";
import { ProviderCard, type ProviderInfo } from "./ProviderCard";
import { MetricExplainer } from "./MetricExplainer";
import { METRIC_INFO, type MetricInfoKey } from "@/lib/metric-info";

export function PaymentsLogisticsTab({ data }: { data: CountryData }) {
  const payments = [...data.payments].sort(
    (a, b) => (b.share_pct ?? 0) - (a.share_pct ?? 0),
  );
  const log = data.logistics[0];
  const iso = data.country.iso_alpha3;

  return (
    <div className="space-y-6">
      {/* Payments */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-baseline gap-2">
          <CreditCard className="size-4 text-[var(--color-primary)]" />
          <h3 className="text-base font-semibold">支付方式（按市占排序）</h3>
          <span className="text-[11px] text-[var(--color-text-dim)]">
            点击每行展开优缺点 + 合作方案
          </span>
        </div>
        {payments.length === 0 ? (
          <div className="mt-4 text-sm text-[var(--color-text-dim)]">
            <PendingBadge /> 暂无支付数据
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {payments.map((p) => {
              const info = getPaymentInfo(p.payment_method);
              const providerInfo: ProviderInfo | null = info
                ? {
                    pros: info.pros,
                    cons: info.cons,
                    partnership: info.partnership,
                    website: info.website,
                  }
                : null;
              const accent =
                (p.share_pct ?? 0) > 30
                  ? "var(--color-primary)"
                  : (p.share_pct ?? 0) > 15
                    ? "#f59e0b"
                    : "#7a86b8";

              return (
                <li key={p.payment_method}>
                  <ProviderCard
                    accent={accent}
                    header={
                      <>
                        <span className="font-medium">
                          <GlossaryTerm term={p.payment_method}>
                            {info?.display_name ?? p.payment_method}
                          </GlossaryTerm>
                        </span>
                        {p.is_local_unique && (
                          <span className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                            本地独有
                          </span>
                        )}
                        {p.operator && (
                          <span className="text-[11px] text-[var(--color-text-dim)]">
                            · {p.operator}
                          </span>
                        )}
                      </>
                    }
                    meta={
                      <>
                        <span className="font-semibold tabular-nums text-[var(--color-text)]">
                          {formatPct(p.share_pct, 0)}
                        </span>
                        {p.notes && (
                          <span className="ml-2">· {p.notes}</span>
                        )}
                      </>
                    }
                    info={providerInfo}
                    trailing={
                      <div className="hidden w-32 sm:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, p.share_pct ?? 0)}%`,
                              background: accent,
                            }}
                          />
                        </div>
                      </div>
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
        {payments.some((p) => !getPaymentInfo(p.payment_method)) && (
          <div className="mt-3 text-[11px] text-[var(--color-text-dim)]">
            注：未覆盖的支付方式将显示「信息待补」徽章 — Hachimi 团队会持续补充知识库（
            <code className="rounded bg-[var(--color-bg-from)] px-1">
              src/data/decision-knowledge.json
            </code>
            ）。
          </div>
        )}
      </section>

      {/* Logistics overview — key metrics with click-to-explain */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-baseline gap-2">
          <Truck className="size-4 text-[var(--color-primary)]" />
          <h3 className="text-base font-semibold">物流概览</h3>
          <span className="text-[11px] text-[var(--color-text-dim)]">
            点击指标右侧 ⓘ 查看定义与 32 国基准
          </span>
        </div>

        {!log ? (
          <div className="mt-4 text-sm text-[var(--color-text-dim)]">
            <PendingBadge /> 暂无物流数据
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <MetricStat
                metricKey="lpi_score"
                value={log.lpi_score}
                iso={iso}
                label={
                  <GlossaryTerm term="LPI">
                    <span>LPI Score</span>
                  </GlossaryTerm>
                }
                extra={log.lpi_global_rank ? `全球 #${log.lpi_global_rank}` : undefined}
                source={log.source_metadata?.lpi_score}
                sourceLabel="LPI"
              />
              <MetricStat
                metricKey="avg_last_mile_days"
                value={log.avg_last_mile_days}
                iso={iso}
                label="平均时效"
              />
              <MetricStat
                metricKey="avg_last_mile_cost_usd"
                value={log.avg_last_mile_cost_usd}
                iso={iso}
                label="最后一公里成本"
              />
              <MetricStat
                metricKey="parcel_volume_million"
                value={log.parcel_volume_million}
                iso={iso}
                label="年包裹量"
              />
              <MetricStat
                metricKey="return_rate_pct"
                value={log.return_rate_pct}
                iso={iso}
                label="退货率"
              />
              <div className="rounded-md bg-[var(--color-bg-from)]/50 px-3 py-2">
                <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
                  <GlossaryTerm term="FBA">
                    <span>FBA 可用</span>
                  </GlossaryTerm>
                </div>
                <div className="mt-0.5 text-base font-semibold">
                  {log.amazon_fba_available == null
                    ? "—"
                    : log.amazon_fba_available
                      ? "✓ 是"
                      : "✗ 否"}
                </div>
              </div>
            </div>

            {log.notes && (
              <p className="mt-4 rounded-md bg-[var(--color-bg-from)]/40 p-3 text-xs text-[var(--color-text-dim)]">
                {log.notes}
              </p>
            )}
          </>
        )}
      </section>

      {/* Carriers + Warehouses (two columns) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-baseline gap-2">
            <Truck className="size-4 text-[var(--color-primary)]" />
            <h3 className="text-base font-semibold">主要承运商</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              点击展开优缺点 + 合作方案
            </span>
          </div>
          {log?.top_carriers && log.top_carriers.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {log.top_carriers.map((name) => {
                const info = getCarrierInfo(name);
                const providerInfo: ProviderInfo | null = info
                  ? {
                      pros: info.pros,
                      cons: info.cons,
                      partnership: info.partnership,
                      website: info.website,
                    }
                  : null;
                return (
                  <li key={name}>
                    <ProviderCard
                      header={
                        <>
                          <span className="font-medium">
                            {info?.display_name ?? name}
                          </span>
                          {info?.type && (
                            <span className="rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
                              {carrierTypeLabel(info.type)}
                            </span>
                          )}
                        </>
                      }
                      meta={
                        info ? (
                          <>
                            {info.country_hq && <>总部 {info.country_hq}</>}
                            {info.coverage && info.coverage.length > 0 && (
                              <span className="ml-2">
                                覆盖 {info.coverage.slice(0, 4).join(", ")}
                                {info.coverage.length > 4 &&
                                  `+${info.coverage.length - 4}`}
                              </span>
                            )}
                          </>
                        ) : (
                          "信息待补"
                        )
                      }
                      info={providerInfo}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 text-sm text-[var(--color-text-dim)]">
              <PendingBadge /> 承运商数据待补
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-baseline gap-2">
            <Warehouse className="size-4 text-[var(--color-primary)]" />
            <h3 className="text-base font-semibold">海外仓服务商</h3>
            <span className="text-[11px] text-[var(--color-text-dim)]">
              点击展开优缺点 + 合作方案
            </span>
          </div>
          {log?.typical_overseas_warehouse_providers &&
          log.typical_overseas_warehouse_providers.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {log.typical_overseas_warehouse_providers.map((name) => {
                const info = getWarehouseInfo(name);
                const providerInfo: ProviderInfo | null = info
                  ? {
                      pros: info.pros,
                      cons: info.cons,
                      partnership: info.partnership,
                      website: info.website,
                    }
                  : null;
                return (
                  <li key={name}>
                    <ProviderCard
                      header={
                        <>
                          <span className="font-medium">
                            {info?.display_name ?? name}
                          </span>
                          {info?.parent && (
                            <span className="text-[11px] text-[var(--color-text-dim)]">
                              · {info.parent}
                            </span>
                          )}
                        </>
                      }
                      meta={
                        info?.specialties && info.specialties.length > 0
                          ? `专长：${info.specialties.join(" / ")}`
                          : info
                            ? undefined
                            : "信息待补"
                      }
                      info={providerInfo}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 text-sm text-[var(--color-text-dim)]">
              <PendingBadge /> 海外仓数据待补
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function carrierTypeLabel(t: string): string {
  return (
    {
      last_mile: "末端派送",
      express_courier: "国际快递",
      global_express: "全球快递",
      marketplace_logistics: "平台物流",
      postal: "邮政",
    } as Record<string, string>
  )[t] ?? t;
}

function MetricStat({
  metricKey,
  value,
  iso,
  label,
  extra,
  source,
  sourceLabel,
}: {
  metricKey: MetricInfoKey;
  value: number | null | undefined;
  iso: string;
  label: React.ReactNode;
  extra?: string;
  source?: unknown;
  sourceLabel?: string;
}) {
  const info = METRIC_INFO[metricKey];
  return (
    <div className="rounded-md bg-[var(--color-bg-from)]/50 px-3 py-2">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
          {label}
        </div>
        <MetricExplainer
          metricKey={metricKey}
          currentValue={value}
          currentIso={iso}
        />
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-base font-semibold tabular-nums">
          {value != null && Number.isFinite(value)
            ? info.format(value)
            : "—"}
        </span>
        {source ? (
          <SourceBadge
            source={source as never}
            label={sourceLabel ?? "数据源"}
          />
        ) : null}
      </div>
      {extra && (
        <div className="text-[10px] text-[var(--color-text-dim)]">{extra}</div>
      )}
    </div>
  );
}
