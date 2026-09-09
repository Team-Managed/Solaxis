"use client";

import React from "react";
import { TrendingUp, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FunctionName } from "@solaxis/shared";

interface FunctionItem {
  id: FunctionName;
  title: string;
  category: "DeFi Sim" | "Confidential TEE" | "State Engine";
  badgeVariant: "default" | "success" | "warning";
  shortDesc: string;
  icon: React.ElementType;
  defaultIterations: number;
}

const FUNCTIONS: FunctionItem[] = [
  {
    id: "batch-risk-simulator",
    title: "Batch Risk Simulator",
    category: "DeFi Sim",
    badgeVariant: "warning",
    shortDesc: "Financial Monte Carlo risk & liquidation model.",
    icon: TrendingUp,
    defaultIterations: 50,
  },
  {
    id: "confidential-state-hasher",
    title: "Confidential Hasher",
    category: "Confidential TEE",
    badgeVariant: "success",
    shortDesc: "Private SHA-256 hash loop in Intel TDX TEE.",
    icon: Lock,
    defaultIterations: 50,
  },
  {
    id: "session-counter",
    title: "Session Counter",
    category: "State Engine",
    badgeVariant: "default",
    shortDesc: "Sub-10ms high-throughput distributed counter.",
    icon: Zap,
    defaultIterations: 100,
  },
];

interface FunctionCatalogProps {
  selectedFunction: FunctionName;
  onSelectFunction: (fn: FunctionName, defaultIterations: number) => void;
  disabled?: boolean;
}

export function FunctionCatalog({
  selectedFunction,
  onSelectFunction,
  disabled = false,
}: FunctionCatalogProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
            1
          </span>
          Select Function Workload
        </label>
        <span className="text-[10px] text-zinc-500 font-mono">3 Presets</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Serverless Function Templates"
        className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2"
      >
        {FUNCTIONS.map((fn) => {
          const Icon = fn.icon;
          const isSelected = selectedFunction === fn.id;

          return (
            <div
              key={fn.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => {
                if (!disabled) onSelectFunction(fn.id, fn.defaultIterations);
              }}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onSelectFunction(fn.id, fn.defaultIterations);
                }
              }}
              className={cn(
                "group relative cursor-pointer rounded-lg border p-2.5 transition-all duration-150 select-none outline-none",
                isSelected
                  ? "border-amber-500/70 bg-graphite-800 shadow-[0_0_12px_-2px_rgba(245,158,11,0.25)]"
                  : "border-white/10 bg-graphite-900/60 hover:border-white/20 hover:bg-graphite-800/40",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                        : "border-white/10 bg-white/5 text-muted-foreground group-hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                      {fn.title}
                    </h4>
                  </div>
                </div>

                <Badge
                  variant={fn.badgeVariant}
                  className="shrink-0 text-[9px] px-1.5 py-0"
                >
                  {fn.category}
                </Badge>
              </div>

              <p className="mt-1 text-[11px] text-zinc-400 line-clamp-1">
                {fn.shortDesc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
