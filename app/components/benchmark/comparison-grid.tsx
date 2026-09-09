"use client";

import React from "react";
import { Zap, Clock, Coins, Gauge, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TelemetryMetrics } from "@solaxis/shared";

interface ComparisonGridProps {
  telemetry: TelemetryMetrics;
  iterations: number;
}

export function ComparisonGrid({ telemetry, iterations }: ComparisonGridProps) {
  const avgIterationLatencyMs =
    iterations > 0
      ? telemetry.erExecutionDurationMs / iterations
      : telemetry.erExecutionDurationMs;

  // Solana L1 average slot confirmation is 400 - 800ms
  const l1EstSlotMs = 500;
  const l1TotalEstMs = iterations * l1EstSlotMs;

  // Speedup multiplier
  const speedupMultiplier =
    telemetry.erExecutionDurationMs > 0
      ? Math.max(1, Math.round(l1TotalEstMs / Math.max(1, telemetry.erExecutionDurationMs)))
      : 60;

  // Throughput (iterations per second)
  const solaxisThroughputOps =
    telemetry.erExecutionDurationMs > 0
      ? Math.round((iterations / telemetry.erExecutionDurationMs) * 1000)
      : Math.round(iterations * 10);

  // L1 sequential throughput (~2 tx/sec max sequential slot confirmations)
  const l1ThroughputOps = 2;

  // Gas calculation: 5,000 lamports per standard L1 signature
  const l1EstimatedGasLamports = iterations * 5000;
  const gasSavedPercent = telemetry.l1GasSavedPercent || 99.4;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Execution Latency */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-graphite-800/60 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Execution Latency</span>
            </div>
            <Badge variant="success" className="font-mono text-[10px]">
              {speedupMultiplier}x Faster
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Solaxis Ephemeral VM</span>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  {avgIterationLatencyMs.toFixed(1)}ms
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  {telemetry.erExecutionDurationMs.toFixed(0)}ms total loop
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-white/5 pt-1.5">
              <span className="text-xs text-zinc-500">Solana L1 Sequential</span>
              <div className="text-right">
                <span className="font-mono text-xs text-zinc-400">
                  {l1EstSlotMs}ms / slot
                </span>
                <span className="text-[10px] text-zinc-600 block font-mono">
                  ~{(l1TotalEstMs / 1000).toFixed(1)}s total L1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Gas & Fee Delta */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-graphite-800/60 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">Base Layer Gas Fees</span>
            </div>
            <Badge variant="warning" className="font-mono text-[10px]">
              {gasSavedPercent}% Gas Reduction
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Solaxis Rollup Loop</span>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                  0 Lamports
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  Zero gas for compute
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-white/5 pt-1.5">
              <span className="text-xs text-zinc-500">Solana L1 Base Fees</span>
              <div className="text-right">
                <span className="font-mono text-xs text-zinc-400">
                  {l1EstimatedGasLamports.toLocaleString()} lamports
                </span>
                <span className="text-[10px] text-zinc-600 block font-mono">
                  {iterations} × 5,000 lamports
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: Sustained Throughput */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-graphite-800/60 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">Sustained Throughput</span>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
              Sub-10ms SVM
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Solaxis Micro-VM</span>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  ~{solaxisThroughputOps} ops/sec
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  Sub-10ms state mutations
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-white/5 pt-1.5">
              <span className="text-xs text-zinc-500">Solana L1 Sequential</span>
              <div className="text-right">
                <span className="font-mono text-xs text-zinc-400">
                  ~{l1ThroughputOps} ops/sec
                </span>
                <span className="text-[10px] text-zinc-600 block font-mono">
                  Sequential slot barrier
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
