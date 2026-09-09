"use client";

import React, { useState } from "react";
import { BarChart3, ShieldCheck, FileText, Share2 } from "lucide-react";
import { useExecution } from "@/components/providers/execution-provider";
import { ComparisonGrid } from "@/components/benchmark/comparison-grid";
import { ExplorerPanel } from "@/components/benchmark/explorer-panel";
import { SummaryDrawer } from "@/components/benchmark/summary-drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BenchmarkCard() {
  const { telemetry, activeTaskId, iterations, status } = useExecution();
  const [reportOpen, setReportOpen] = useState(false);

  const isCompleted = status === "SETTLED" && telemetry !== null;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-graphite-900/90 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Performance & Cost Analytics
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Verifiable proof comparing Ephemeral Rollup execution vs Solana Base Layer L1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <>
              <Badge variant="success" className="font-mono text-[10px]">
                Solana Devnet Verified
              </Badge>
              <Button
                onClick={() => setReportOpen(true)}
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1.5"
              >
                <FileText className="h-3 w-3 text-amber-400" />
                View Full Audit Report
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              Awaiting Invocation Settlement
            </Badge>
          )}
        </div>
      </div>

      {/* Content or Idle State */}
      {isCompleted && telemetry ? (
        <div className="space-y-5 pt-1">
          {/* 1. Comparison Grid */}
          <ComparisonGrid telemetry={telemetry} iterations={iterations} />

          {/* 2. Explorer Proofs */}
          <ExplorerPanel telemetry={telemetry} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-white/10 bg-graphite-800/20 py-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-500 mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">
            No Execution Metrics Available
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Launch a serverless micro-instance from the Invocation Parameters panel to
            generate verifiable latency benchmarks and Solana Explorer transaction proofs.
          </p>
        </div>
      )}

      {/* Audit Report Slide-Out Drawer */}
      <SummaryDrawer
        open={reportOpen}
        onOpenChange={setReportOpen}
        telemetry={telemetry}
        taskId={activeTaskId}
        iterations={iterations}
      />
    </div>
  );
}
