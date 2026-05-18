"use client";

import { useState } from "react";
import { ExternalLink, BookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getGlossary } from "@/lib/data";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  regulation: "法规",
  tax: "税务",
  logistics: "物流",
  payment: "支付",
  platform_ops: "平台运营",
  ecom_metric: "电商指标",
};

type Props = {
  term: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Wraps text that is a glossary term. Hover shows short_def; click opens
 * a modal with the full entry. No-op (renders children plain) if term not found.
 */
export function GlossaryTerm({ term, children, className }: Props) {
  const [open, setOpen] = useState(false);
  // Loaded synchronously — glossary lives in the same JS bundle.
  const entry = getGlossary().find(
    (g) => g.term.toLowerCase() === term.toLowerCase(),
  );

  const label = children ?? term;
  if (!entry) {
    return <span className={className}>{label}</span>;
  }

  return (
    <TooltipProvider delayDuration={160}>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "underline decoration-dotted decoration-[var(--color-primary)]/60 underline-offset-4 hover:decoration-solid hover:text-[var(--color-text)]",
                  className,
                )}
              >
                {label}
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className={open ? "hidden" : undefined}>
            <div className="space-y-1 max-w-xs">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <BookText className="size-3" /> {CATEGORY_LABEL[entry.category] ?? entry.category}
              </div>
              <div className="font-semibold">
                {entry.term}
                {entry.term_zh && (
                  <span className="ml-1 text-[var(--color-text-dim)]">· {entry.term_zh}</span>
                )}
              </div>
              <div className="text-[var(--color-text-dim)]">{entry.short_def}</div>
              <div className="text-[10px] text-[var(--color-primary)]">点击查看完整解释 →</div>
            </div>
          </TooltipContent>
          <DialogContent className="max-w-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
                <BookText className="size-3" />
                {CATEGORY_LABEL[entry.category] ?? entry.category}
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {entry.term}
                {entry.term_full && (
                  <span className="ml-2 text-base font-normal text-[var(--color-text-dim)]">
                    {entry.term_full}
                  </span>
                )}
              </DialogTitle>
              {entry.term_zh && (
                <div className="text-sm text-[var(--color-text-dim)]">
                  中文：{entry.term_zh}
                </div>
              )}
              {entry.full_def && (
                <Section title="完整定义">{entry.full_def}</Section>
              )}
              {entry.example_case && (
                <Section title="案例">{entry.example_case}</Section>
              )}
              {entry.seller_impact && (
                <Section title="对中国卖家影响">{entry.seller_impact}</Section>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {entry.applies_to_countries && entry.applies_to_countries.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                      适用国家
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.applies_to_countries.map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 px-1.5 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.applies_to_categories && entry.applies_to_categories.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                      适用品类
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.applies_to_categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)]/40 px-1.5 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {entry.reference_urls && entry.reference_urls.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                    参考链接
                  </div>
                  <ul className="mt-1 space-y-1">
                    {entry.reference_urls.map((u) => (
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
            </div>
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
        {title}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">
        {children}
      </div>
    </div>
  );
}
