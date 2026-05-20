import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  extreme: "极端风险",
  high: "高风险",
  medium: "中等风险",
  low: "低风险",
};

const LEVEL_STYLE: Record<string, string> = {
  extreme: "text-red-200 bg-red-500/20 ring-red-400/50",
  high: "text-red-300 bg-red-500/15 ring-red-400/30",
  medium: "text-amber-300 bg-amber-500/15 ring-amber-400/30",
  low: "text-emerald-300 bg-emerald-500/15 ring-emerald-400/30",
};

type Props = {
  level: "extreme" | "high" | "medium" | "low";
  headline?: string;
  /** Show as small inline pill vs larger card. */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Inline pill showing a country's geopolitical risk level.
 * Use `sm` next to country name; `md` standalone.
 */
export function GeopoliticalRiskBadge({ level, headline, size = "sm", className }: Props) {
  const Icon = level === "low" ? ShieldCheck : level === "extreme" ? ShieldAlert : Shield;
  return (
    <span
      title={headline}
      className={cn(
        "inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-medium",
        LEVEL_STYLE[level],
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      地缘政治：{LEVEL_LABEL[level]}
    </span>
  );
}
