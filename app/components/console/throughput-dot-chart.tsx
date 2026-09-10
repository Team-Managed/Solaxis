"use client";

import React from "react";
import { Zap, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_ROWS = 20;

interface ThroughputDotChartProps {
  compact?: boolean;
  actualDurationMs?: number | null;
  executedTicks?: number | null;
  tickLatencies?: number[];
}

export function ThroughputDotChart({
  compact = false,
  actualDurationMs = null,
  executedTicks = null,
  tickLatencies = [],
}: ThroughputDotChartProps = {}) {
  const hasTicks = tickLatencies && tickLatencies.length > 0;
  const avgLatency = hasTicks
    ? (tickLatencies.reduce((sum, val) => sum + val, 0) / tickLatencies.length).toFixed(1)
    : null;

  return (
    <div
      className={cn(
        "dashboard-card flex flex-col justify-between h-full",
        compact ? "p-3 sm:p-4 space-y-2.5" : "p-5 space-y-4"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Compute Latency Profile
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={cn(
                "font-bold text-slate-900 tracking-tight font-mono",
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              )}
            >
              {hasTicks
                ? `${avgLatency}ms / tick`
                : actualDurationMs
                ? `${actualDurationMs}ms Total`
                : "--"}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500">
              {hasTicks
                ? `${tickLatencies.length} ticks sampled`
                : executedTicks
                ? `${executedTicks} ticks executed`
                : "No ticks recorded"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Body: Real Dot Matrix or Honest Empty State */}
      {hasTicks ? (
        <div className="relative flex items-end gap-2.5 pt-2 pb-1">
          {/* Y-Axis scale labels in milliseconds */}
          <div
            className={cn(
              "flex flex-col justify-between text-[9px] sm:text-[10px] font-mono text-slate-400 select-none text-right w-8 sm:w-9 shrink-0",
              compact ? "h-[110px]" : "h-[160px]"
            )}
          >
            <span>20ms</span>
            <span>15ms</span>
            <span>10ms</span>
            <span>5ms</span>
            <span>0ms</span>
          </div>

          {/* Real Dot Matrix Area (Sub-15ms SVM ticks) */}
          <div
            className={cn(
              "flex-1 flex flex-col justify-between overflow-hidden",
              compact ? "h-[110px]" : "h-[160px]"
            )}
          >
            <div className="flex items-end justify-start h-full gap-[2px] sm:gap-[3px] overflow-x-auto">
              {tickLatencies.map((latency, colIdx) => {
                // Map 0-20ms to 0-TOTAL_ROWS dots
                const filledDots = Math.min(
                  TOTAL_ROWS,
                  Math.max(1, Math.round((latency / 20) * TOTAL_ROWS))
                );

                return (
                  <div
                    key={colIdx}
                    className="flex flex-col-reverse justify-start gap-[2px] sm:gap-[2.5px] h-full shrink-0"
                    title={`Tick #${colIdx + 1}: ${latency.toFixed(1)}ms`}
                  >
                    {Array.from({ length: TOTAL_ROWS }).map((_, dotIdx) => {
                      const isFilled = dotIdx < filledDots;
                      return (
                        <span
                          key={dotIdx}
                          className={cn(
                            "rounded-xs transition-colors shrink-0",
                            compact
                              ? "h-[2px] w-[2px] sm:h-[2.5px] sm:w-[2.5px]"
                              : "h-[2.5px] w-[2.5px] sm:h-[3px] sm:w-[3px]",
                            isFilled ? "bg-slate-800" : "bg-slate-100"
                          )}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center px-4",
            compact ? "h-[110px] py-4" : "h-[160px] py-6"
          )}
        >
          <Activity className="h-6 w-6 text-slate-400 mb-2 stroke-[1.5]" />
          <div className="text-xs font-bold text-slate-800">
            No Compute Ticks Recorded
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mt-1">
            Execute a workload via CLI (<code className="font-mono text-slate-700">solaxis invoke</code>) or edge daemon to capture live sub-15ms SVM ticks.
          </p>
        </div>
      )}

      {/* Footer Benchmark Notes */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-slate-400" />
          <span>{hasTicks ? "In-Memory RAM Execution" : "Live Buffer Standby"}</span>
        </span>
        <span>vs 400ms Solana L1 Base Block Time</span>
      </div>
    </div>
  );
}
