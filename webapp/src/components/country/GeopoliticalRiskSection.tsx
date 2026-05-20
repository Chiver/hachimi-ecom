import {
  ShieldAlert,
  Shield,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Swords,
  Ban,
  Landmark,
  PackageX,
  TrendingDown,
  HandCoins,
  Network,
} from "lucide-react";
import type { GeopoliticalRisk } from "@/types";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  extreme: "极端风险",
  high: "高风险",
  medium: "中等风险",
  low: "低风险",
};

const LEVEL_STYLE: Record<string, string> = {
  extreme: "border-red-400/50 bg-red-500/10",
  high: "border-red-400/30 bg-red-500/5",
  medium: "border-amber-400/30 bg-amber-500/5",
  low: "border-emerald-400/30 bg-emerald-500/5",
};

const LEVEL_TEXT: Record<string, string> = {
  extreme: "text-red-300",
  high: "text-red-300",
  medium: "text-amber-300",
  low: "text-emerald-300",
};

const SEVERITY_PILL: Record<string, string> = {
  critical: "text-red-300 bg-red-500/20 ring-red-400/50",
  blocking: "text-red-300 bg-red-500/20 ring-red-400/50",
  high: "text-red-300 bg-red-500/15 ring-red-400/30",
  medium: "text-amber-300 bg-amber-500/15 ring-amber-400/30",
  low: "text-[var(--color-text-dim)] bg-[var(--color-surface-2)] ring-[var(--color-border)]",
};

const FACTOR_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  armed_conflict: Swords,
  sanctions: Ban,
  trade_policy: Landmark,
  platform_regulation: Network,
  currency_volatility: TrendingDown,
  domestic_unrest: AlertTriangle,
  diplomatic_tension: HandCoins,
  supply_chain: PackageX,
};

const FACTOR_LABEL: Record<string, string> = {
  armed_conflict: "武装冲突",
  sanctions: "制裁",
  trade_policy: "贸易政策",
  platform_regulation: "平台监管",
  currency_volatility: "汇率/通胀",
  domestic_unrest: "国内不稳定",
  diplomatic_tension: "外交关系",
  supply_chain: "供应链",
};

export function GeopoliticalRiskSection({ risk }: { risk: GeopoliticalRisk }) {
  const Icon =
    risk.overall_level === "low"
      ? ShieldCheck
      : risk.overall_level === "extreme"
        ? ShieldAlert
        : Shield;

  return (
    <section
      className={cn(
        "rounded-xl border p-5",
        LEVEL_STYLE[risk.overall_level],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Icon className={cn("size-4", LEVEL_TEXT[risk.overall_level])} />
          地缘政治与系统性风险
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              risk.overall_level === "extreme" &&
                "text-red-200 bg-red-500/20 ring-red-400/50",
              risk.overall_level === "high" &&
                "text-red-300 bg-red-500/15 ring-red-400/30",
              risk.overall_level === "medium" &&
                "text-amber-300 bg-amber-500/15 ring-amber-400/30",
              risk.overall_level === "low" &&
                "text-emerald-300 bg-emerald-500/15 ring-emerald-400/30",
            )}
          >
            {LEVEL_LABEL[risk.overall_level]}
          </span>
        </h3>
        <div className="text-[10px] text-[var(--color-text-dim)]">
          评估于 {risk._assessed_at}
        </div>
      </div>

      <p className={cn("mt-2 text-sm font-medium", LEVEL_TEXT[risk.overall_level])}>
        {risk.headline}
      </p>

      {risk.factors.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
            风险因素分解 ({risk.factors.length})
          </div>
          {risk.factors.map((f, i) => {
            const FactorIcon = FACTOR_ICON[f.type] ?? AlertTriangle;
            return (
              <div
                key={i}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <FactorIcon className="mt-0.5 size-3.5 shrink-0 text-[var(--color-text-dim)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                          {FACTOR_LABEL[f.type] ?? f.type}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                            SEVERITY_PILL[f.severity],
                          )}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm font-semibold">{f.title}</div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-dim)]">
                  {f.description}
                </p>
                <div className="mt-2 rounded-md bg-[var(--color-bg-from)]/50 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
                    对中国卖家影响
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed">
                    {f.impact_on_china_sellers}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
          入市策略调整建议
        </div>
        <p className="mt-1 text-sm leading-relaxed">
          {risk.entry_recommendation_adjustment}
        </p>
      </div>

      {risk.sources.length > 0 && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
            数据源 ({risk.sources.length})
          </div>
          <ul className="mt-1.5 space-y-1">
            {risk.sources.map((s, i) => (
              <li key={i} className="text-[11px]">
                {s.url.startsWith("http") ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 break-all text-[var(--color-primary)] hover:underline"
                  >
                    <ExternalLink className="mt-0.5 size-3 shrink-0" />
                    <span>{s.name}</span>
                  </a>
                ) : (
                  <span className="text-[var(--color-text-dim)]">
                    {s.name} · {s.url}
                  </span>
                )}
                <span className="ml-2 text-[10px] text-[var(--color-text-dim)]">
                  抓取于 {s.fetched_at}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 text-[10px] text-[var(--color-text-dim)]">
        评估方：{risk._assessed_by}
      </div>
    </section>
  );
}
