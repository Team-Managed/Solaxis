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
            "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 font-mono",
            className
          )}
        >
          {showIcon && <Circle className="h-2 w-2 fill-slate-400 text-slate-400" />}
          IDLE
        </span>
      );

    case "PROVISIONING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 font-mono",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
          PROVISIONING
        </span>
      );

    case "RUNNING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 font-mono",
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
            "inline-flex items-center gap-1.5 rounded-md border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-800 font-mono",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-cyan-600" />}
          TEARING DOWN
        </span>
      );

    case "SETTLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 font-mono",
            className
          )}
        >
          {showIcon && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
          SETTLED (L1)
        </span>
      );

    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-800 font-mono",
            className
          )}
        >
          {showIcon && <AlertTriangle className="h-3 w-3 text-red-600" />}
          FAILED
        </span>
      );

    default:
      return null;
  }
}
