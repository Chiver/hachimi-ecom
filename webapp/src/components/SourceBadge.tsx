"use client";

import { useState } from "react";
import { ExternalLink, FileText, Quote } from "lucide-react";
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
              {source.extraction_method && (
                <div className="text-[10px] text-[var(--color-text-dim)]">
                  {source.extraction_method.toLowerCase().includes("vision")
                    ? "👁️ Vision-verified"
                    : source.extraction_method.toLowerCase().includes("text")
                      ? "📝 Text-extracted"
                      : source.extraction_method}
                </div>
              )}
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
          <PopoverContent align="start" className="w-96">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {confidence}
                  </span>
                  <div className="font-semibold">{label ?? "数据源"}</div>
                </div>
                <ExtractionMethodBadge method={source.extraction_method} confidence={confidence} />
              </div>

              {/* Verbatim quote (when vision-verified) */}
              {source.source_quote && (
                <div className="rounded-md border border-emerald-400/30 bg-emerald-500/5 p-2">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300">
                    <Quote className="size-3" /> 原文摘录
                  </div>
                  <blockquote className="mt-1 text-xs italic leading-relaxed">
                    &ldquo;{source.source_quote}&rdquo;
                  </blockquote>
                </div>
              )}

              {(source.publisher || source.source_name) && (
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  {source.publisher && (
                    <>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                        出版方
                      </span>
                      <span className="font-medium">{source.publisher}</span>
                    </>
                  )}
                  {source.source_name && (
                    <>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                        来源
                      </span>
                      <span>{source.source_name}</span>
                    </>
                  )}
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

              {source.warning && (
                <div className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-200">
                  ⚠ {source.warning}
                </div>
              )}

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
/**
 * Pill showing how a value was extracted from the source:
 *  - vision (Claude read PDF page as image) → 👁️ Vision-verified (emerald)
 *  - text / extraction_method missing but H confidence → 📝 Text-extracted (blue)
 *  - L confidence + Hachimi extrapolation → handled by EstimateBadge instead
 */
function ExtractionMethodBadge({
  method,
  confidence,
}: {
  method?: string;
  confidence: "H" | "M" | "L";
}) {
  const m = (method ?? "").toLowerCase();
  if (m.includes("vision")) {
    return (
      <span
        title="Vision-verified — Claude 视觉直读 PDF 页面，确认原文表述"
        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
      >
        👁️ Vision-verified
      </span>
    );
  }
  if (m.includes("text")) {
    return (
      <span
        title="Text-extracted — 从 PDF 文字层 / OCR 抓取"
        className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-300 ring-1 ring-inset ring-blue-400/30"
      >
        📝 Text-extracted
      </span>
    );
  }
  // No extraction_method field but high confidence — historic hand-crafted entry.
  if (confidence === "H" && !method) {
    return (
      <span
        title="人工录入（早期建档，未标 extraction_method）"
        className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-200 ring-1 ring-inset ring-blue-400/20"
      >
        📝 Text-extracted
      </span>
    );
  }
  return null;
}

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
