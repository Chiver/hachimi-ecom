"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Filter, Calendar } from "lucide-react";
import type { Country } from "@/types";
import type { PolicyEventWithCountry } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CATEGORY_CODES, categoryLabel } from "@/lib/categories";

const EVENT_TYPE_LABEL: Record<string, string> = {
  tariff: "关税",
  vat_change: "VAT 变更",
  de_minimis_change: "免税额变化",
  cert_requirement: "认证要求",
  data_law: "数据法",
  sanctions: "制裁",
};

const SEVERITY_STYLE: Record<string, string> = {
  blocking: "text-red-300 bg-red-500/15 ring-red-400/40",
  critical: "text-red-300 bg-red-500/15 ring-red-400/40",
  high: "text-amber-300 bg-amber-500/15 ring-amber-400/40",
  medium: "text-yellow-200 bg-yellow-500/10 ring-yellow-400/30",
  low: "text-[var(--color-text-dim)] bg-[var(--color-surface-2)] ring-[var(--color-border)]",
};

const ALL = "__all__";

type Props = {
  events: PolicyEventWithCountry[];
  countries: Country[];
};

export function TimelineClient({ events, countries }: Props) {
  const [countryIso, setCountryIso] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [severity, setSeverity] = useState<string>(ALL);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (
        countryIso !== ALL &&
        e.source_country !== countryIso &&
        !(e.countries_affected ?? []).includes(countryIso)
      ) {
        return false;
      }
      if (
        category !== ALL &&
        !(e.categories_affected ?? []).includes(category)
      ) {
        return false;
      }
      if (severity !== ALL && e.severity !== severity) return false;
      return true;
    });
  }, [events, countryIso, category, severity]);

  const countryByIso = new Map(countries.map((c) => [c.iso_alpha3, c]));

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Filter className="size-4 text-[var(--color-text-dim)]" />
        <Select
          label="国家"
          value={countryIso}
          onChange={setCountryIso}
          options={[
            { value: ALL, label: "全部" },
            ...countries.map((c) => ({
              value: c.iso_alpha3,
              label: `${c.flag_emoji ?? ""} ${c.name_zh}`,
            })),
          ]}
        />
        <Select
          label="品类"
          value={category}
          onChange={setCategory}
          options={[
            { value: ALL, label: "全部" },
            ...CATEGORY_CODES.map((c) => ({ value: c, label: categoryLabel(c) })),
          ]}
        />
        <Select
          label="严重度"
          value={severity}
          onChange={setSeverity}
          options={[
            { value: ALL, label: "全部" },
            { value: "critical", label: "Critical" },
            { value: "blocking", label: "Blocking" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
        <div className="ml-auto text-xs text-[var(--color-text-dim)]">
          {filtered.length} / {events.length} 事件
        </div>
      </div>

      <div className="mt-8">
        <TimelineAxis events={filtered} />
      </div>

      <ol className="mt-8 space-y-3 border-l border-[var(--color-border)] pl-5">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-12 text-center text-sm text-[var(--color-text-dim)]">
            没有匹配的政策事件。
          </li>
        ) : (
          filtered.map((ev, i) => {
            const d = new Date(ev.event_date);
            const today = new Date();
            const diffDays = Math.round(
              (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            const past = diffDays < 0;
            const soon = !past && diffDays <= 30;
            const upcoming = !past && diffDays > 30 && diffDays <= 90;
            const country =
              countryByIso.get(ev.source_country) ?? null;
            return (
              <li key={`${ev.event_date}-${i}`} className="relative">
                <span
                  className={cn(
                    "absolute -left-[26px] top-2 size-3 rounded-full ring-4 ring-[var(--color-bg-from)]",
                    past
                      ? "bg-[var(--color-text-dim)]"
                      : soon
                        ? "bg-red-400"
                        : upcoming
                          ? "bg-amber-400"
                          : "bg-[var(--color-primary)]",
                  )}
                />
                <div
                  className={cn(
                    "rounded-xl border bg-[var(--color-surface)] p-4 transition-colors",
                    soon
                      ? "border-red-400/30"
                      : upcoming
                        ? "border-amber-400/30"
                        : "border-[var(--color-border)]",
                  )}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-sm font-medium">
                      <Calendar className="size-3" /> {ev.event_date}
                    </span>
                    <span className="rounded-md bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
                      {EVENT_TYPE_LABEL[ev.event_type] ?? ev.event_type}
                    </span>
                    {ev.severity && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                          SEVERITY_STYLE[ev.severity],
                        )}
                      >
                        {ev.severity}
                      </span>
                    )}
                    {soon && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-300">
                        {diffDays} 天后
                      </span>
                    )}
                    {upcoming && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        {diffDays} 天后
                      </span>
                    )}
                    {past && (
                      <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)]">
                        已生效 {-diffDays} 天
                      </span>
                    )}
                    {country && (
                      <span className="ml-auto text-xs text-[var(--color-text-dim)]">
                        来源国：{country.flag_emoji} {country.name_zh}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-semibold">{ev.title}</h3>
                  {ev.description && (
                    <p className="mt-1 text-sm text-[var(--color-text-dim)]">
                      {ev.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-dim)]">
                    {ev.countries_affected && ev.countries_affected.length > 0 && (
                      <div>
                        影响国家：
                        {ev.countries_affected.slice(0, 6).map((c) => (
                          <span
                            key={c}
                            className="ml-1 rounded-md bg-[var(--color-surface-2)] px-1.5 py-0.5"
                          >
                            {c}
                          </span>
                        ))}
                        {ev.countries_affected.length > 6 && (
                          <span className="ml-1">
                            +{ev.countries_affected.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                      >
                        <ExternalLink className="size-3" /> 官方链接
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ol>
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--color-surface)]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TimelineAxis({ events }: { events: PolicyEventWithCountry[] }) {
  if (events.length === 0) return null;
  const today = new Date();
  const dates = events.map((e) => new Date(e.event_date).getTime());
  const min = Math.min(...dates, today.getTime() - 1000 * 60 * 60 * 24 * 180);
  const max = Math.max(...dates, today.getTime() + 1000 * 60 * 60 * 24 * 180);
  const range = max - min;
  const todayPct = ((today.getTime() - min) / range) * 100;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
        时间轴 (今天 vs 事件)
      </div>
      <div className="relative mt-6 h-12">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--color-border)]" />
        {/* Today line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[var(--color-primary)]"
          style={{ left: `${todayPct}%` }}
        >
          <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
            今天
          </span>
        </div>
        {events.map((ev, i) => {
          const t = new Date(ev.event_date).getTime();
          const left = ((t - min) / range) * 100;
          const past = t < today.getTime();
          const diffDays = Math.round(
            (t - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          const soon = !past && diffDays <= 30;
          const upcoming = !past && diffDays > 30 && diffDays <= 90;
          return (
            <div
              key={`${ev.event_date}-${i}`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%` }}
            >
              <span
                className={cn(
                  "block size-3 rounded-full ring-2 ring-[var(--color-surface)] transition-transform group-hover:scale-150",
                  past
                    ? "bg-[var(--color-text-dim)]"
                    : soon
                      ? "bg-red-400"
                      : upcoming
                        ? "bg-amber-400"
                        : "bg-[var(--color-primary)]",
                )}
              />
              <div className="pointer-events-none absolute -bottom-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1 text-[10px] shadow-lg group-hover:block">
                <div className="font-mono">{ev.event_date}</div>
                <div>{ev.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
