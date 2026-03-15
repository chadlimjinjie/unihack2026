"use client";

import { cn } from "@/lib/utils";

type Status = "quiet" | "moderate" | "busy";

function getStatus(count: number | bigint | null | undefined): Status {
  const n = count == null ? 0 : Number(count);
  if (n === 0) return "quiet";
  if (n === 1) return "moderate";
  return "busy";
}

const statusConfig: Record<
  Status,
  { label: string; className: string; ariaLabel: string }
> = {
  quiet: {
    label: "Quiet",
    className: "bg-emerald-500",
    ariaLabel: "Court is quiet (empty)",
  },
  moderate: {
    label: "1 playing",
    className: "bg-amber-400",
    ariaLabel: "1 person on court",
  },
  busy: {
    label: "Busy",
    className: "bg-orange-500",
    ariaLabel: "Court is busy (packed)",
  },
};

export interface LiveOccupancyIndicatorProps {
  count: number | bigint | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function LiveOccupancyIndicator({
  count,
  showLabel = false,
  size = "md",
  className,
}: LiveOccupancyIndicatorProps) {
  const status = getStatus(count);
  const config = statusConfig[status];
  const sizeClass =
    size === "sm" ? "h-2 w-2" : "h-3 w-3";
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={config.label}
      aria-label={config.ariaLabel}
      role="img"
    >
      <span
        className={cn(
          "rounded-full shrink-0 ring-2 ring-background",
          config.className,
          sizeClass,
          size === "md" && "animate-pulse"
        )}
      />
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {config.label}
        </span>
      )}
    </span>
  );
}
