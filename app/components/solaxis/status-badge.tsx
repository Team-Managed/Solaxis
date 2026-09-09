import * as React from "react";
import { Circle, Loader2, CheckCircle2, AlertTriangle, Radio, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@solaxis/shared";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  switch (status) {
    case "IDLE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-400 font-mono",
            className
          )}
        >
          {showIcon && <Circle className="h-2 w-2 fill-zinc-500 text-zinc-500" />}
          IDLE
        </span>
      );

    case "PROVISIONING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300 font-mono shadow-[0_0_12px_-2px_rgba(245,158,11,0.25)]",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-amber-400" />}
          PROVISIONING
        </span>
      );

    case "RUNNING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 font-mono shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)] animate-pulse",
            className
          )}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          RUNNING (ER)
        </span>
      );

    case "TEARING_DOWN":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300 font-mono shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />}
          TEARING DOWN
        </span>
      );

    case "SETTLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-200 font-mono shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]",
            className
          )}
        >
          {showIcon && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
          SETTLED (L1)
        </span>
      );

    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 font-mono shadow-[0_0_12px_-2px_rgba(239,68,68,0.25)]",
            className
          )}
        >
          {showIcon && <AlertTriangle className="h-3 w-3 text-red-400" />}
          FAILED
        </span>
      );

    default:
      return null;
  }
}
