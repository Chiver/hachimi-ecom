"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import type { CategoryCatalog, CatalogCategory } from "@/types";

export function CatalogClient({ catalog }: { catalog: CategoryCatalog }) {
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.categories;
    return catalog.categories
      .map((c) => {
        if (
          c.name_zh.toLowerCase().includes(q) ||
          c.name_en.toLowerCase().includes(q)
        ) {
          // Keep all subgroups
          return c;
        }
        // Search inside subgroup products
        const matched = c.subgroups
          .map((g) => ({
            ...g,
            products: g.products.filter((p) => p.toLowerCase().includes(q)),
          }))
          .filter((g) => g.products.length > 0);
        return matched.length > 0 ? { ...c, subgroups: matched } : null;
      })
      .filter((c): c is CatalogCategory => c !== null);
  }, [query, catalog.categories]);

  return (
    <>
      {/* Search bar + jump chips */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索产品（如 充电宝 / Toner Water / Air Fryer）"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-primary)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)] hover:bg-[var(--color-surface-2)]"
            >
              清空
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {catalog.categories.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              onClick={(e) => {
                // Smooth scroll + briefly highlight
                e.preventDefault();
                const el = document.getElementById(`cat-${c.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setPinned(c.id);
                  setTimeout(() => setPinned(null), 1500);
                }
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-text-dim)] ring-1 ring-inset ring-[var(--color-border)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
                pinned === c.id &&
                  "bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-[var(--color-primary)]/40",
              )}
            >
              <span>{c.icon}</span>
              <span>{c.name_zh}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Result count when filtered */}
      {query && (
        <div className="mt-3 text-[11px] text-[var(--color-text-dim)]">
          {filtered.length === 0
            ? "没有匹配的品类 / 产品"
            : `${filtered.length} 个品类匹配 "${query}"`}
        </div>
      )}

      {/* Grid of category cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            highlighted={pinned === c.id}
            query={query}
          />
        ))}
      </div>
    </>
  );
}

function CategoryCard({
  category,
  highlighted,
  query,
}: {
  category: CatalogCategory;
  highlighted?: boolean;
  query?: string;
}) {
  const totalProducts = category.subgroups.reduce(
    (s, g) => s + g.products.length,
    0,
  );

  return (
    <section
      id={`cat-${category.id}`}
      className={cn(
        "scroll-mt-20 rounded-xl border bg-[var(--color-surface)] p-5 transition-colors",
        highlighted
          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
          : "border-[var(--color-border)]",
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl leading-none">{category.icon}</div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {category.name_zh}
            </h2>
            <div className="text-xs text-[var(--color-text-dim)]">
              {category.name_en}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-[var(--color-bg-from)]/60 px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
            {totalProducts} 例
          </span>
          {category.hachimi_category && (
            <span
              title="对应 Hachimi 12 大类（用于国家市场数据查询）"
              className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)] ring-1 ring-inset ring-[var(--color-primary)]/30"
            >
              {categoryLabel(category.hachimi_category)}
            </span>
          )}
        </div>
      </header>

      {category.blurb && (
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-text-dim)]">
          {category.blurb}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {category.subgroups.map((g) => (
          <div key={g.name}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
              {g.name}
            </div>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {g.products.map((p) => (
                <li
                  key={p}
                  className={cn(
                    "inline-flex items-center rounded-md bg-[var(--color-bg-from)]/60 px-2 py-1 text-[12px] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)]",
                    query &&
                      p.toLowerCase().includes(query.trim().toLowerCase()) &&
                      "bg-[var(--color-primary)]/15 ring-[var(--color-primary)]/40 text-[var(--color-primary)]",
                  )}
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
