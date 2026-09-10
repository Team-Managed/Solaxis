"use client";

import React, { useState } from "react";
import { Play, Shield, Zap, TrendingUp, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import type { FunctionName } from "@solaxis/shared";
import { cn } from "@/lib/utils";

export interface PresetWorkload {
  id: FunctionName;
  name: string;
  program: string;
  instruction: string;
  category: "all" | "confidential-tee" | "state-engine";
  targetEnclave: "Intel TDX TEE" | "Standard ER";
  validatorUrl: string;
  defaultIterations: number;
  cliCommand: string;
  description: string;
}

export const PRESET_WORKLOADS: PresetWorkload[] = [
  {
    id: "batch-risk-simulator",
    name: "Batch Risk Simulator",
    program: "solaxis_engine",
    instruction: "execute_batch",
    category: "state-engine",
    targetEnclave: "Standard ER",
    validatorUrl: "devnet-router.magicblock.app",
    defaultIterations: 50,
    cliCommand: "solaxis invoke batch-risk-simulator --iterations 50",
    description: "Multi-iteration Monte Carlo financial risk & liquidation calculation inside Ephemeral SVM.",
  },
  {
    id: "confidential-state-hasher",
    name: "Confidential State Hasher",
    program: "solaxis_engine",
    instruction: "execute_batch",
    category: "confidential-tee",
    targetEnclave: "Intel TDX TEE",
    validatorUrl: "devnet-tee.magicblock.app",
    defaultIterations: 50,
    cliCommand: "solaxis invoke confidential-state-hasher --tee --iterations 50",
    description: "Private SHA-256 cryptographic state hashing in hardware-isolated Intel TDX enclave RAM.",
  },
  {
    id: "session-counter",
    name: "High-Throughput Session Counter",
    program: "solaxis_engine",
    instruction: "execute_batch",
    category: "state-engine",
    targetEnclave: "Standard ER",
    validatorUrl: "devnet-as.magicblock.app",
    defaultIterations: 100,
    cliCommand: "solaxis invoke session-counter --iterations 100",
    description: "Sub-10ms high-throughput distributed counter with zero L1 base-layer transaction fees.",
  },
];

interface WorkloadsTableProps {
  onLaunchWorkload: (fn: FunctionName, iterations: number) => void;
  isExecuting?: boolean;
  filterCategory?: "all" | "confidential-tee" | "state-engine";
  lastExecutedFunction?: FunctionName | null;
  lastExecutionDurationMs?: number | null;
  status?: string;
  compact?: boolean;
}

export function WorkloadsTable({
  onLaunchWorkload,
  isExecuting = false,
  filterCategory = "all",
  lastExecutedFunction = null,
  lastExecutionDurationMs = null,
  status = "IDLE",
  compact = false,
}: WorkloadsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = PRESET_WORKLOADS.filter(
    (item) => filterCategory === "all" || item.category === filterCategory
  );

  return (
    <div className="dashboard-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Available Function Presets (Anchor 0.30+)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified smart contract functions ready to trigger via CLI or edge daemon
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
          {filtered.length} of {PRESET_WORKLOADS.length} Presets
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 pb-2 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-5 sm:col-span-4">Function Workload</div>
        <div className="col-span-4 sm:col-span-3">Target Enclave</div>
        <div className="hidden sm:block sm:col-span-3">CLI Trigger Command</div>
        <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-3 sm:gap-4 items-center py-3.5 transition-colors hover:bg-slate-50/70 rounded-md px-1.5"
          >
            {/* Column 1: Function name & program */}
            <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                {item.id === "batch-risk-simulator" && <TrendingUp className="h-4 w-4" />}
                {item.id === "confidential-state-hasher" && <Shield className="h-4 w-4" />}
                {item.id === "session-counter" && <Zap className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {item.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>{item.program}::{item.instruction}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Target Enclave & Router */}
            <div className="col-span-4 sm:col-span-3">
              <div className="text-xs font-semibold text-slate-800">
                {item.targetEnclave}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[150px]" title={item.validatorUrl}>
                {item.validatorUrl}
              </div>
            </div>

            {/* Column 3: Copyable CLI command */}
            <div className="hidden sm:block sm:col-span-3">
              <div
                onClick={() => handleCopy(item.id, item.cliCommand)}
                className="group flex items-center justify-between gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1.5 rounded cursor-pointer transition-colors"
                title="Click to copy CLI command"
              >
                <code className="text-[11px] font-mono text-slate-800 truncate">
                  {item.cliCommand}
                </code>
                {copiedId === item.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                )}
              </div>
            </div>

            {/* Column 4: Quick Trigger Button */}
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onLaunchWorkload(item.id, item.defaultIterations)}
                disabled={isExecuting}
                className="flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 select-none"
                title="Trigger and watch in Live Telemetry Monitor"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Simulate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
