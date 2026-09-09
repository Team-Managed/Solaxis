"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Terminal as TerminalIcon,
  BarChart3,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useExecution } from "@/components/providers/execution-provider";
import { FunctionCatalog } from "@/components/console/function-catalog";
import { InvocationPanel } from "@/components/console/invocation-panel";
import { LifecycleVisualizer } from "@/components/visualizer/lifecycle-visualizer";
import { CloudwatchTerminal } from "@/components/terminal/cloudwatch-terminal";
import { BenchmarkCard } from "@/components/benchmark/benchmark-card";
import { StatusBadge } from "@/components/solaxis/status-badge";
import { LatencyCounter } from "@/components/solaxis/latency-counter";
import { ConsoleErrorState } from "@/components/solaxis/console-state";
import { cn } from "@/lib/utils";

export function ConsoleLayout() {
  const {
    selectedFunction,
    setSelectedFunction,
    iterations,
    setIterations,
    seed,
    setSeed,
    targetValidator,
    setTargetValidator,
    status,
    activeTaskId,
    telemetry,
    logs,
    error,
    isExecuting,
    launch,
  } = useExecution();

  // Active tab in the lower deck: "terminal" (CloudWatch stream) or "benchmark" (Verification & Analytics)
  const [activeDeckTab, setActiveDeckTab] = useState<"terminal" | "benchmark">("terminal");

  // Auto-switch tabs to give the best user experience:
  // 1. When launching: auto-switch to live terminal logs
  // 2. When settled: auto-switch to benchmark & explorer verification
  useEffect(() => {
    if (status === "PROVISIONING" || status === "RUNNING") {
      setActiveDeckTab("terminal");
    } else if (status === "SETTLED" && telemetry) {
      setActiveDeckTab("benchmark");
    }
  }, [status, telemetry]);

  const handleSelectFunction = (fn: any, defaultIterations: number) => {
    setSelectedFunction(fn);
    setIterations(defaultIterations);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Top Guided Workflow Banner & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-graphite-900/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Ephemeral Micro-Instance Engine
              </span>
              <span className="hidden md:inline-block text-[11px] text-zinc-500">
                • 1. Choose preset ➔ 2. Launch ➔ 3. Watch sub-10ms SVM & L1 proofs
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-mono">Status:</span>
            <StatusBadge status={status} />
          </div>

          {telemetry && (
            <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
              <span className="text-[11px] text-zinc-400 font-mono">Duration:</span>
              <LatencyCounter durationMs={telemetry.totalDurationMs} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <ConsoleErrorState
          message={error}
          onRetry={() => launch()}
        />
      )}

      {/* Main 12-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols): Step 1 Catalog + Step 2 Parameters & Launch */}
        <div className="lg:col-span-4 space-y-4">
          <FunctionCatalog
            selectedFunction={selectedFunction}
            onSelectFunction={handleSelectFunction}
            disabled={isExecuting}
          />

          <InvocationPanel
            iterations={iterations}
            onIterationsChange={setIterations}
            seed={seed}
            onSeedChange={setSeed}
            targetValidator={targetValidator}
            onTargetValidatorChange={setTargetValidator}
            onLaunch={() => launch()}
            isExecuting={isExecuting}
          />
        </div>

        {/* Right Column (8 cols): Step 3 Live Visualizer + Tabbed Deck */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Anchor: 4-Stage Lifecycle Pipeline Visualizer (Always Visible) */}
          <LifecycleVisualizer />

          {/* Bottom Deck: Sleek Tab Switcher (Live Logs vs Benchmark & Explorer Proofs) */}
          <div className="space-y-3">
            {/* Tab Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <div className="flex items-center gap-2">
                {/* Tab 1: Terminal Stream */}
                <button
                  type="button"
                  onClick={() => setActiveDeckTab("terminal")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
                    activeDeckTab === "terminal"
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_-2px_rgba(245,158,11,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <TerminalIcon className="h-3.5 w-3.5" />
                  <span>CloudWatch Stream</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0 text-[10px] font-mono text-zinc-400">
                    {logs.length}
                  </span>
                </button>

                {/* Tab 2: Benchmark & Explorer Verification */}
                <button
                  type="button"
                  onClick={() => setActiveDeckTab("benchmark")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
                    activeDeckTab === "benchmark"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_-2px_rgba(16,185,129,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Benchmark & Proofs</span>
                  {telemetry && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                      {telemetry.l1GasSavedPercent}% Saved
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline-block">
                {activeDeckTab === "terminal"
                  ? "Real-time JSON-RPC Events"
                  : "Solana Devnet Audit"}
              </span>
            </div>

            {/* Tab 1 Content: CloudWatch Terminal */}
            {activeDeckTab === "terminal" && (
              <div className="animate-in fade-in duration-150">
                <CloudwatchTerminal />
              </div>
            )}

            {/* Tab 2 Content: Benchmark & Verification Cards */}
            {activeDeckTab === "benchmark" && (
              <div className="animate-in fade-in duration-150">
                <BenchmarkCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
