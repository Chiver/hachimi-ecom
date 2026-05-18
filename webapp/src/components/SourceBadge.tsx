"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { z } from "zod";
import type { SourceMetaSchema } from "@/types";

type SourceMeta = z.infer<typeof SourceMetaSchema>;

const CONFIDENCE_LABEL: Record<string, string> = {
  H: "高（官方/政府）",
  M: "中（付费报告）",
  L: "低（爬虫/估算）",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  H: "var(--color-confidence-h)",
  M: "var(--color-confidence-m)",
  L: "var(--color-confidence-l)",
};

type Props = {
  source: SourceMeta | undefined | null;
  /** Optional human label for the data point, shown in popover. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Inline data-source provenance dot. H/M/L color circle.
 * - Hover: tooltip with source_name + fetched_at + confidence
 * - Click: popover with full URL (clickable if http(s), or labeled as local file path)
 */
export function SourceBadge({ source, label, size = "sm", className }: Props) {
  const [open, setOpen] = useState(false);
  if (!source) return null;

  const dim = size === "md" ? "size-2.5" : "size-2";
  const confidence = source.confidence ?? "L";
  const sourceUrl = source.source_url ?? "";
  const color = CONFIDENCE_COLOR[confidence];
  const isUrl = /^https?:\/\//i.test(sourceUrl);

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <Popover open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`数据源 ${label ?? ""} 置信度 ${confidence}`}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-white/10 transition-transform hover:scale-125",
                  dim,
                  className,
                )}
                style={{ background: color }}
              />
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className={open ? "hidden" : undefined}>
            <div className="space-y-1">
              {label && <div className="font-medium">{label}</div>}
              <div className="text-[var(--color-text-dim)]">
                {source.source_name}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: color }}
                />
                <span>置信度 {confidence} · {CONFIDENCE_LABEL[confidence]}</span>
              </div>
              {source.fetched_at && (
                <div className="text-[10px] text-[var(--color-text-dim)]">
                  抓取于 {source.fetched_at}
                </div>
              )}
              <div className="text-[10px] text-[var(--color-primary)]">
                点击查看完整来源 →
              </div>
            </div>
          </TooltipContent>
          <PopoverContent align="start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: color }}
                >
                  {confidence}
                </span>
                <div className="font-semibold">
                  {label ?? "数据源"}
                </div>
              </div>
              {source.source_name && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                    来源
                  </div>
                  <div className="mt-0.5 text-sm">{source.source_name}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                  URL / 文件路径
                </div>
                {!sourceUrl ? (
                  <div className="mt-1 text-xs text-[var(--color-text-dim)]">
                    （未提供）
                  </div>
                ) : isUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-start gap-1.5 break-all text-xs text-[var(--color-primary)] hover:underline"
                  >
                    <ExternalLink className="mt-0.5 size-3 shrink-0" />
                    {sourceUrl}
                  </a>
                ) : (
                  <div className="mt-1 flex items-start gap-1.5 break-all rounded-md bg-[var(--color-bg-from)] px-2 py-1.5 text-xs text-[var(--color-text-dim)]">
                    <FileText className="mt-0.5 size-3 shrink-0" />
                    <span>
                      <span className="text-[var(--color-text)]">📄 本地报告：</span>{" "}
                      {sourceUrl}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-dim)]">
                <span>{source.fetched_at ? `抓取于 ${source.fetched_at}` : ""}</span>
                <span>置信度 {CONFIDENCE_LABEL[confidence]}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Static "Hachimi 计算" badge for AI-derived fields. */
export function HachimiDerivedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-medium text-purple-300 ring-1 ring-inset ring-purple-400/30",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-purple-400" />
      Hachimi 计算
    </span>
  );
}

/** Inline "估算" badge for L-confidence fields (extrapolated / approximated values). */
export function EstimateBadge({
  reason,
  className,
}: {
  reason?: string;
  className?: string;
}) {
  return (
    <span
      title={reason}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-dim)] ring-1 ring-inset ring-[var(--color-border)]",
        className,
      )}
    >
      <span
        className="size-1 rounded-full"
        style={{ background: "var(--color-confidence-l)" }}
      />
      估算
    </span>
  );
}

/** "待补" placeholder badge for missing data. */
export function PendingBadge({
  reason,
  className,
}: {
  reason?: string;
  className?: string;
}) {
  return (
    <span
      title={reason}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-dim)] ring-1 ring-inset ring-[var(--color-border)]",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-[var(--color-text-dim)]" />
      待补
    </span>
  );
}
