"use client";

import { useState } from "react";
import { ChevronDown, Check, X, ExternalLink, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProviderInfo = {
  pros: string[];
  cons: string[];
  partnership?: string;
  website?: string;
};

type Props = {
  /** Card header — what's shown collapsed. */
  header: React.ReactNode;
  /** Subline under header (e.g. share % or notes). */
  meta?: React.ReactNode;
  /** Knowledge-base entry (pros/cons/partnership). null = "信息待补". */
  info?: ProviderInfo | null;
  /** Optional accent color for the left ribbon. */
  accent?: string;
  /** Extra trailing controls (right side of header). */
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Expandable card for a payment method / carrier / overseas warehouse.
 * Collapsed: header + meta. Click expands inline to show pros, cons,
 * 合作方案, and external link.
 */
export function ProviderCard({
  header,
  meta,
  info,
  accent,
  trailing,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const hasInfo = info && (info.pros.length > 0 || info.cons.length > 0);

  return (
    <div
      className={cn(
        "rounded-lg border bg-[var(--color-surface)] transition-colors",
        open
          ? "border-[var(--color-primary)]/40"
          : "border-[var(--color-border)] hover:border-[var(--color-primary)]/30",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => hasInfo && setOpen((o) => !o)}
        disabled={!hasInfo}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
          hasInfo ? "cursor-pointer" : "cursor-default",
        )}
      >
        {accent && (
          <span
            className="block h-8 w-1 shrink-0 rounded-full"
            style={{ background: accent }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">{header}</div>
          {meta && (
            <div className="mt-0.5 text-[11px] text-[var(--color-text-dim)]">
              {meta}
            </div>
          )}
        </div>
        {trailing}
        {hasInfo ? (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[var(--color-text-dim)] transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
            信息待补
          </span>
        )}
      </button>

      {open && hasInfo && info && (
        <div className="border-t border-[var(--color-border)] px-3 py-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {info.pros.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-300">
                  优点
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {info.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {info.cons.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-red-300">
                  缺点
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {info.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <X className="mt-0.5 size-3 shrink-0 text-red-400" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {info.partnership && (
            <div className="mt-4 rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
                <Handshake className="size-3" /> 合作方案
              </div>
              <div className="mt-1 text-xs leading-relaxed">{info.partnership}</div>
            </div>
          )}

          {info.website && (
            <a
              href={info.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink className="size-3" /> {info.website}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
