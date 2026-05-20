"use client";

import { useState } from "react";
import { Info, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { KpiExplainer as KpiExplainerData } from "@/lib/roi-explainers";

type Props = {
  data: KpiExplainerData;
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps a KPI value with a click-to-expand explainer popover.
 *  - Name + description (名词解释)
 *  - Formula (公式)
 *  - Step-by-step walkthrough with the user's actual numbers (计算过程)
 *  - Optional doc note + health hint
 *
 * Click-trigger so it works on mobile (no hover required).
 */
export function KpiExplainer({ data, children, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-[var(--color-primary)]/10",
            open && "bg-[var(--color-primary)]/15",
            className,
          )}
        >
          {children}
          <Info
            className={cn(
              "size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
              open
                ? "opacity-100 text-[var(--color-primary)]"
                : "text-[var(--color-text-dim)]",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] max-w-[92vw]">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
              指标
            </div>
            <h3 className="mt-0.5 text-base font-semibold">{data.name}</h3>
          </div>

          <p className="text-xs leading-relaxed text-[var(--color-text-dim)]">
            {data.description}
          </p>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              公式
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-from)] px-2 py-1.5 text-[11px] leading-relaxed text-[var(--color-primary)]">
              {data.formula}
            </pre>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              代入当前输入计算
            </div>
            <ol className="mt-1 space-y-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 px-2 py-1.5">
              {data.walkthrough.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1 font-mono text-[11px] leading-relaxed tabular-nums"
                >
                  <ChevronRight className="mt-0.5 size-2.5 shrink-0 text-[var(--color-text-dim)]" />
                  <span
                    className={cn(
                      i === data.walkthrough.length - 1
                        ? "font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)]",
                    )}
                  >
                    {w.step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {data.doc_note && (
            <div className="rounded-md border border-blue-400/30 bg-blue-500/5 px-2 py-1.5 text-[11px] leading-relaxed text-blue-200">
              <span className="font-semibold">📖 文档备注：</span> {data.doc_note}
            </div>
          )}

          {data.health_hint && (
            <div className="rounded-md border border-amber-400/30 bg-amber-500/5 px-2 py-1.5 text-[11px] leading-relaxed text-amber-200">
              <span className="font-semibold">🎯 健康线：</span> {data.health_hint}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
