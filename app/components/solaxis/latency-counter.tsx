import * as React from "react";
import { cn } from "@/lib/utils";

interface LatencyCounterProps {
  durationMs: number | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatusGlow?: boolean;
}

export function LatencyCounter({
  durationMs,
  label,
  size = "md",
  className,
  showStatusGlow = true,
}: LatencyCounterProps) {
  if (durationMs === null || durationMs === undefined) {
    return (
      <span className={cn("font-mono text-muted-foreground", className)}>
        -- ms
      </span>
    );
  }

  // Thresholds: < 15ms = sub-10ms ephemeral tier (emerald)
  // < 200ms = fast tier (cyan/amber)
  // > 500ms = slow / L1 wait tier (crimson)
  let colorClass = "text-emerald-400";
  let glowClass = "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";

  if (durationMs >= 500) {
    colorClass = "text-red-400";
    glowClass = "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  } else if (durationMs >= 100) {
    colorClass = "text-amber-400";
    glowClass = "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
  } else if (durationMs >= 20) {
    colorClass = "text-cyan-400";
    glowClass = "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]";
  }

  const sizeClasses = {
    sm: "text-xs font-medium",
    md: "text-sm font-semibold",
    lg: "text-2xl font-bold tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className)}>
      {label && <span className="text-xs text-muted-foreground font-sans mr-1">{label}</span>}
      <span className={cn(sizeClasses[size], colorClass, showStatusGlow && glowClass)}>
        {durationMs < 1 ? durationMs.toFixed(2) : Math.round(durationMs).toLocaleString()}
      </span>
      <span className="text-xs text-muted-foreground font-normal">ms</span>
    </div>
  );
}
