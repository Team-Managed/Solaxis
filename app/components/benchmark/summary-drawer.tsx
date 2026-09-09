"use client";

import React, { useState } from "react";
import { Download, Share2, Check, ExternalLink, FileText } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { TelemetryMetrics } from "@solaxis/shared";

interface SummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  telemetry: TelemetryMetrics | null;
  taskId: string | null;
  iterations: number;
}

export function SummaryDrawer({
  open,
  onOpenChange,
  telemetry,
  taskId,
  iterations,
}: SummaryDrawerProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!telemetry) return null;

  const exportTelemetryJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(telemetry, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `solaxis-telemetry-${taskId || "task"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyShareMarkdown = () => {
    const md = `### ☀️ Solaxis Micro-Instance Invocation Proof
- **Task ID**: \`${taskId || "N/A"}\`
- **Iterations Completed**: ${telemetry.iterationsCompleted || iterations} ticks in \`${telemetry.totalDurationMs.toFixed(1)}ms\`
- **Gas Saved**: **${telemetry.l1GasSavedPercent}%** vs standard Solana L1 sequential execution
- **Ephemeral Validator**: \`${telemetry.erEndpointUsed}\`
- **Delegation Tx**: https://explorer.solana.com/tx/${telemetry.delegationTxSignature}?cluster=devnet
- **Settlement Tx**: https://explorer.solana.com/tx/${telemetry.settlementTxSignature}?cluster=devnet
*Verified on Solana Devnet with MagicBlock Ephemeral Rollups.*`;

    navigator.clipboard.writeText(md);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Complete Execution Audit Report"
      description="Full deterministic breakdown of spin-up, compute, and settlement phases."
    >
      <div className="space-y-5 pt-2 text-xs font-mono">
        {/* Actions header */}
        <div className="flex items-center gap-2">
          <Button
            onClick={copyShareMarkdown}
            size="sm"
            variant="secondary"
            className="flex-1 gap-1.5 text-xs font-sans"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Copied Markdown!
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                Share Proof
              </>
            )}
          </Button>

          <Button
            onClick={exportTelemetryJson}
            size="sm"
            variant="secondary"
            className="flex-1 gap-1.5 text-xs font-sans"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Export JSON
          </Button>
        </div>

        {/* Overview Box */}
        <div className="rounded-lg border border-white/10 bg-obsidian-900 p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-500 font-sans">Task Identifier:</span>
            <span className="text-white truncate max-w-[200px]">{taskId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-sans">Compute Iterations:</span>
            <span className="text-amber-300 font-bold">{telemetry.iterationsCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-sans">Base Gas Saved:</span>
            <span className="text-emerald-400 font-bold">{telemetry.l1GasSavedPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-sans">Rollup Endpoint:</span>
            <span className="text-cyan-300 truncate max-w-[180px]">{telemetry.erEndpointUsed}</span>
          </div>
        </div>

        {/* Phase Breakdown Table */}
        <div className="space-y-2">
          <span className="text-zinc-400 font-sans font-semibold">Phase Timing Breakdown</span>
          <div className="rounded-lg border border-white/10 bg-obsidian-900 overflow-hidden divide-y divide-white/5">
            <div className="flex justify-between p-2.5">
              <span className="text-zinc-400">1. Spin-up / Delegation</span>
              <span className="text-amber-400 font-bold">{telemetry.spinUpDurationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between p-2.5">
              <span className="text-zinc-400">2. Ephemeral VM Execution</span>
              <span className="text-emerald-400 font-bold">{telemetry.erExecutionDurationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between p-2.5">
              <span className="text-zinc-400">3. Atomic Teardown / Commit</span>
              <span className="text-cyan-400 font-bold">{telemetry.teardownDurationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between p-2.5 bg-white/[0.03]">
              <span className="text-white font-sans font-semibold">Total Lifecycle Duration</span>
              <span className="text-white font-bold text-sm">{telemetry.totalDurationMs.toFixed(1)} ms</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="space-y-2">
          <span className="text-zinc-400 font-sans font-semibold">Devnet Transaction Signatures</span>
          <div className="space-y-2">
            <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-500 font-sans">Delegation (L1)</span>
              <a
                href={`https://explorer.solana.com/tx/${telemetry.delegationTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline break-all block text-[11px]"
              >
                {telemetry.delegationTxSignature} ↗
              </a>
            </div>

            <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-500 font-sans">Settlement (L1)</span>
              <a
                href={`https://explorer.solana.com/tx/${telemetry.settlementTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline break-all block text-[11px]"
              >
                {telemetry.settlementTxSignature} ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
