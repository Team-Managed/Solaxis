"use client";

import React, { useState } from "react";
import { Layers, Activity, Zap, Shield, Cpu, RefreshCw } from "lucide-react";
import { useExecution } from "@/components/providers/execution-provider";
import { StageNode, type StageState } from "@/components/visualizer/stage-node";
import { EnergyTrack } from "@/components/visualizer/energy-track";
import { StageDrawer, type StageIndex } from "@/components/visualizer/stage-drawer";
import { StatusBadge } from "@/components/solaxis/status-badge";
import { LatencyCounter } from "@/components/solaxis/latency-counter";

export function LifecycleVisualizer() {
  const {
    status,
    activeTaskId,
    currentIteration,
    totalIterations,
    currentOutput,
    telemetry,
    isExecuting,
  } = useExecution();

  const [selectedStage, setSelectedStage] = useState<StageIndex | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (index: StageIndex) => {
    setSelectedStage(index);
    setDrawerOpen(true);
  };

  // Compute states for each of the 4 nodes
  const getStageState = (nodeIndex: StageIndex): StageState => {
    if (status === "FAILED") {
      // Find where failure occurred
      return "error";
    }

    switch (nodeIndex) {
      case 1:
        if (status === "PROVISIONING") return "active";
        if (
          status === "RUNNING" ||
          status === "TEARING_DOWN" ||
          status === "SETTLED"
        )
          return "completed";
        return "pending";

      case 2:
        if (status === "RUNNING") return "active";
        if (status === "TEARING_DOWN" || status === "SETTLED") return "completed";
        return "pending";

      case 3:
        if (status === "TEARING_DOWN") return "active";
        if (status === "SETTLED") return "completed";
        return "pending";

      case 4:
        if (status === "SETTLED") return "completed";
        return "pending";
    }
  };

  const state1 = getStageState(1);
  const state2 = getStageState(2);
  const state3 = getStageState(3);
  const state4 = getStageState(4);

  // Determine energy track states between nodes
  const track12Status: "idle" | "active" | "completed" | "error" =
    state1 === "completed" && state2 === "active"
      ? "active"
      : state2 === "completed" || state3 === "completed" || state4 === "completed"
      ? "completed"
      : "idle";

  const track23Status: "idle" | "active" | "completed" | "error" =
    state2 === "completed" && state3 === "active"
      ? "active"
      : state3 === "completed" || state4 === "completed"
      ? "completed"
      : "idle";

  const track34Status: "idle" | "active" | "completed" | "error" =
    state3 === "completed" && state4 === "completed"
      ? "completed"
      : state3 === "active"
      ? "active"
      : "idle";

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-graphite-900/90 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Micro-Instance Execution Lifecycle
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Deterministic 4-stage pipeline • Solana L1 ➔ Ephemeral Rollup ➔ Solana L1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {telemetry && (
            <div className="border-l border-white/10 pl-3">
              <LatencyCounter durationMs={telemetry.totalDurationMs} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Pipeline Grid with Energy Tracks */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 py-2">
          {/* Node 1 */}
          <div className="md:col-span-1">
            <StageNode
              index={1}
              name="L1 Provisioning"
              subtitle="PDA Delegation CPI"
              state={state1}
              completedDurationMs={telemetry?.spinUpDurationMs}
              activePulseColor="amber"
              onClick={() => handleOpenDrawer(1)}
            />
          </div>

          {/* Track 1 -> 2 */}
          <div className="hidden md:flex md:col-span-1">
            <EnergyTrack status={track12Status} color="amber" />
          </div>

          {/* Node 2 */}
          <div className="md:col-span-1">
            <StageNode
              index={2}
              name="Ephemeral VM"
              subtitle={`Zero-Gas Hash Loop (${currentIteration}/${totalIterations})`}
              state={state2}
              completedDurationMs={telemetry?.erExecutionDurationMs}
              activePulseColor="emerald"
              onClick={() => handleOpenDrawer(2)}
            />
          </div>

          {/* Track 2 -> 3 */}
          <div className="hidden md:flex md:col-span-1">
            <EnergyTrack status={track23Status} color="cyan" />
          </div>

          {/* Node 3 */}
          <div className="md:col-span-1">
            <StageNode
              index={3}
              name="Atomic Commit"
              subtitle="MagicIntent Bundle"
              state={state3}
              completedDurationMs={telemetry?.teardownDurationMs}
              activePulseColor="cyan"
              onClick={() => handleOpenDrawer(3)}
            />
          </div>

          {/* Track 3 -> 4 */}
          <div className="hidden md:flex md:col-span-1">
            <EnergyTrack status={track34Status} color="emerald" />
          </div>

          {/* Node 4 */}
          <div className="md:col-span-1">
            <StageNode
              index={4}
              name="Settled State"
              subtitle="L1 Reversion & Finality"
              state={state4}
              completedDurationMs={telemetry?.totalDurationMs}
              activePulseColor="emerald"
              onClick={() => handleOpenDrawer(4)}
            />
          </div>
        </div>
      </div>

      {/* Slide-Out Inspection Drawer */}
      <StageDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        stageIndex={selectedStage}
        taskPda={activeTaskId}
        telemetry={telemetry}
        computeOutput={currentOutput}
        currentIteration={currentIteration}
        totalIterations={totalIterations}
      />
    </div>
  );
}
