import * as React from "react";
import { cn } from "@/lib/utils";

interface PulseIndicatorProps {
  active?: boolean;
  color?: "emerald" | "amber" | "cyan" | "crimson";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseIndicator({
  active = true,
  color = "emerald",
  size = "md",
  className,
}: PulseIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
  };

  const pingColorClasses = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    cyan: "bg-cyan-400",
    crimson: "bg-red-400",
  };

  const solidColorClasses = {
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
    cyan: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]",
    crimson: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
  };

  return (
    <span className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {active && (
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            pingColorClasses[color]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          sizeClasses[size],
          active ? solidColorClasses[color] : "bg-zinc-600"
        )}
      />
    </span>
  );
}
