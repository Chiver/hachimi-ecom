"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink, BookText } from "lucide-react";
import type { GlossaryEntry } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  regulation: "法规",
  tax: "税务",
  logistics: "物流",
  payment: "支付",
  platform_ops: "平台运营",
  ecom_metric: "电商指标",
};

const CATEGORY_COLOR: Record<string, string> = {
  regulation: "bg-red-500/10 text-red-300 ring-red-400/30",
  tax: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
  logistics: "bg-blue-500/10 text-blue-300 ring-blue-400/30",
  payment: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
  platform_ops: "bg-purple-500/10 text-purple-300 ring-purple-400/30",
  ecom_metric: "bg-cyan-500/10 text-cyan-300 ring-cyan-400/30",
};

const ALL = "__all__";

export function GlossaryClient({ entries }: { entries: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(ALL);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (cat !== ALL && e.category !== cat) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        (e.term_full ?? "").toLowerCase().includes(q) ||
        (e.term_zh ?? "").toLowerCase().includes(q) ||
        e.short_def.toLowerCase().includes(q) ||
        (e.full_def ?? "").toLowerCase().includes(q)
      );
    });
  }, [entries, query, cat]);

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category))),
    [entries],
  );

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索术语、中文、定义……"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CatPill active={cat === ALL} onClick={() => setCat(ALL)}>
            全部 ({entries.length})
          </CatPill>
          {categories.map((c) => {
            const count = entries.filter((e) => e.category === c).length;
            return (
              <CatPill
                key={c}
                active={cat === c}
                onClick={() => setCat(c)}
                colorClass={CATEGORY_COLOR[c]}
              >
                {CATEGORY_LABEL[c] ?? c} ({count})
              </CatPill>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 p-12 text-center text-sm text-[var(--color-text-dim)]">
          没有匹配的词条。
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const isOpen = expanded === e.term;
            return (
              <li
                key={e.term}
                className={cn(
                  "rounded-xl border bg-[var(--color-surface)] p-4 transition-colors",
                  isOpen
                    ? "border-[var(--color-primary)]/50 md:col-span-2 xl:col-span-3"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/30",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">
                      {e.term}
                      {e.term_zh && (
                        <span className="ml-2 text-sm font-normal text-[var(--color-text-dim)]">
                          {e.term_zh}
                        </span>
                      )}
                    </h3>
                    {e.term_full && (
                      <div className="text-xs text-[var(--color-text-dim)]">
                        {e.term_full}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                      CATEGORY_COLOR[e.category],
                    )}
                  >
                    {CATEGORY_LABEL[e.category] ?? e.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text-dim)]">
                  {e.short_def}
                </p>
                {isOpen ? (
                  <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                    {e.full_def && <Section title="完整定义">{e.full_def}</Section>}
                    {e.example_case && <Section title="案例">{e.example_case}</Section>}
                    {e.seller_impact && (
                      <Section title="对中国卖家影响">{e.seller_impact}</Section>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {e.applies_to_countries && e.applies_to_countries.length > 0 && (
                        <div>
                          <Label>适用国家</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.applies_to_countries.map((c) => (
                              <span
                                key={c}
                                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 px-1.5 py-0.5 text-[11px]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {e.applies_to_categories && e.applies_to_categories.length > 0 && (
                        <div>
                          <Label>适用品类</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.applies_to_categories.map((c) => (
                              <span
                                key={c}
                                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 px-1.5 py-0.5 text-[11px]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {e.reference_urls && e.reference_urls.length > 0 && (
                      <div>
                        <Label>参考链接</Label>
                        <ul className="mt-1 space-y-1">
                          {e.reference_urls.map((u) => (
                            <li key={u}>
                              <a
                                href={u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 break-all text-xs text-[var(--color-primary)] hover:underline"
                              >
                                <ExternalLink className="size-3" /> {u}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpanded(null)}
                      className="text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    >
                      收起 ↑
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExpanded(e.term)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                  >
                    <BookText className="size-3" /> 查看完整
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function CatPill({
  active,
  onClick,
  children,
  colorClass,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
          : cn(
              "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]",
              colorClass,
            ),
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
      {children}
    </div>
  );
}
