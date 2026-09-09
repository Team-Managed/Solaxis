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
          "border-white/10 bg-graphite-900/60 text-muted-foreground hover:border-white/20 hover:bg-graphite-800/40",
        isActive &&
          activePulseColor === "amber" &&
          "border-amber-500/80 bg-graphite-900/95 shadow-[0_0_20px_-2px_rgba(245,158,11,0.35)]",
        isActive &&
          activePulseColor === "emerald" &&
          "border-emerald-500/80 bg-graphite-900/95 shadow-[0_0_20px_-2px_rgba(16,185,129,0.35)]",
        isActive &&
          activePulseColor === "cyan" &&
          "border-cyan-500/80 bg-graphite-900/95 shadow-[0_0_20px_-2px_rgba(6,182,212,0.35)]",
        isCompleted &&
          "border-emerald-500/40 bg-graphite-900/80 hover:border-emerald-400/60 shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]",
        isError &&
          "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]",
        className
      )}
    >
      {/* Header with Stage Number, Icon & Live Timer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            0{index}
          </span>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors",
              isPending && "border-white/10 bg-white/5 text-zinc-500",
              isActive && "border-amber-400/40 bg-amber-500/20 text-amber-300",
              isCompleted && "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
              isError && "border-red-500/40 bg-red-500/20 text-red-400"
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
          {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          {isError && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
          {isPending && <Circle className="h-3 w-3 text-zinc-600" />}

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
            "text-xs font-semibold leading-tight transition-colors",
            isPending && "text-zinc-400 group-hover:text-white",
            isActive && "text-white",
            isCompleted && "text-white",
            isError && "text-red-300"
          )}
        >
          {name}
        </h4>
        <p className="mt-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 line-clamp-1">
          {subtitle}
        </p>
      </div>

      {/* Action Prompt */}
      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500 group-hover:text-zinc-400">
        <span>Inspect metadata</span>
        <span className="font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
    </div>
  );
}
