"use client";

import React from "react";
import {
  Activity,
  Zap,
  Shield,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Circle,
  ExternalLink,
} from "lucide-react";
import { PulseIndicator } from "@/components/solaxis/pulse-indicator";
import { StageTimer } from "@/components/visualizer/stage-timer";
import { cn } from "@/lib/utils";
import type { StageIndex } from "./stage-drawer";

export type StageState = "pending" | "active" | "completed" | "error";

interface StageNodeProps {
  index: StageIndex;
  name: string;
  subtitle: string;
  state: StageState;
  completedDurationMs?: number | null;
  activePulseColor?: "amber" | "emerald" | "cyan";
  onClick?: () => void;
  className?: string;
}

export function StageNode({
  index,
  name,
  subtitle,
  state,
  completedDurationMs,
  activePulseColor = "amber",
  onClick,
  className,
}: StageNodeProps) {
  const isPending = state === "pending";
  const isActive = state === "active";
  const isCompleted = state === "completed";
  const isError = state === "error";

  const stageIcons = {
    1: Activity,
    2: Zap,
    3: Shield,
    4: Cpu,
  };

  const IconComponent = stageIcons[index];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none outline-none",
        // State variants
        isPending &&
          "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 shadow-sm",
        isActive &&
          activePulseColor === "amber" &&
          "border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-400/20",
        isActive &&
          activePulseColor === "emerald" &&
          "border-emerald-400 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400/20",
        isActive &&
          activePulseColor === "cyan" &&
          "border-cyan-400 bg-cyan-50/80 shadow-md ring-2 ring-cyan-400/20",
        isCompleted &&
          "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 shadow-sm",
        isError &&
          "border-red-300 bg-red-50 text-red-700 shadow-sm",
        className
      )}
    >
      {/* Header with Stage Number, Icon & Live Timer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            0{index}
          </span>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors",
              isPending && "border-slate-200 bg-slate-100 text-slate-500",
              isActive && "border-amber-300 bg-amber-100 text-amber-800",
              isCompleted && "border-emerald-300 bg-emerald-100 text-emerald-800",
              isError && "border-red-300 bg-red-100 text-red-700"
            )}
          >
            <IconComponent className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Status / Stopwatch */}
        <div className="flex items-center gap-1.5">
          {isActive && (
            <PulseIndicator
              active
              color={activePulseColor}
              size="sm"
            />
          )}
          {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          {isError && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
          {isPending && <Circle className="h-3 w-3 text-slate-300" />}

          <StageTimer
            isActive={isActive}
            completedDurationMs={completedDurationMs}
          />
        </div>
      </div>

      {/* Main Stage Title & Description */}
      <div className="mt-3">
        <h4
          className={cn(
            "text-xs font-bold leading-tight transition-colors",
            isPending && "text-slate-700 group-hover:text-slate-900",
            isActive && "text-slate-900",
            isCompleted && "text-slate-900",
            isError && "text-red-700"
          )}
        >
          {name}
        </h4>
        <p className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-600 line-clamp-1">
          {subtitle}
        </p>
      </div>

      {/* Action Prompt */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 group-hover:text-amber-600">
        <span>Inspect metadata</span>
        <span className="font-mono text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
    </div>
  );
}
