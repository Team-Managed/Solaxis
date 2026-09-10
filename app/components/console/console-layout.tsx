"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Layers,
  TrendingUp,
  Play,
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Terminal as TerminalIcon,
  BarChart3,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowLeft,
  ExternalLink,
  Maximize2,
  Code2,
  Copy,
  Check,
  Radio,
  Server,
} from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useExecution } from "@/components/providers/execution-provider";
import { ConsoleSidebar, ConsoleTab } from "@/components/console/console-sidebar";
import { HexClusterMap } from "@/components/console/hex-cluster-map";
import { ThroughputDotChart } from "@/components/console/throughput-dot-chart";
import { WorkloadsTable } from "@/components/console/workloads-table";
import { CloudwatchTerminal } from "@/components/terminal/cloudwatch-terminal";
import { BenchmarkCard } from "@/components/benchmark/benchmark-card";
import { StatusBadge } from "@/components/solaxis/status-badge";
import { LatencyCounter } from "@/components/solaxis/latency-counter";
import { ConsoleErrorState } from "@/components/solaxis/console-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FunctionName } from "@solaxis/shared";

export function ConsoleLayout() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const {
    selectedFunction,
    setSelectedFunction,
    status,
    activeTaskId,
    telemetry,
    logs,
    error,
    isExecuting,
    launch,
    daemon,
    tickLatencies,
  } = useExecution();

  // Navigation tab in sidebar: overview | workloads | terminal | proofs
  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");

  // Category filter in Workloads Catalog
  const [catalogFilter, setCatalogFilter] = useState<"all" | "confidential-tee" | "state-engine">("all");

  // Fetch real balance if wallet is connected
  useEffect(() => {
    let isMounted = true;
    if (connected && publicKey && connection) {
      connection.getBalance(publicKey).then((bal) => {
        if (isMounted) setWalletBalance(bal / LAMPORTS_PER_SOL);
      }).catch(() => {
        if (isMounted) setWalletBalance(null);
      });
    } else {
      setWalletBalance(null);
    }
    return () => { isMounted = false; };
  }, [connected, publicKey, connection]);

  const handleLaunchWorkload = (fn: FunctionName, defaultIters: number) => {
    setSelectedFunction(fn);
    setActiveTab("terminal");
    setTimeout(() => {
      launch(fn, defaultIters);
    }, 100);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* 1. Left Navigation Sidebar with Real Solaxis Panes */}
      <ConsoleSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isExecuting={isExecuting || daemon.connected}
        logCount={logs.length}
      />

      {/* 2. Main Workspace Deck */}
      <div className="flex-1 min-w-0 bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Notification banner */}
        {error && (
          <ConsoleErrorState
            message={error}
            onRetry={() => launch()}
          />
        )}

        {/* =========================================================================
            PANE 1: CLUSTER OVERVIEW (Clean Infrastructure & Real Session Telemetry)
            ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-6xl animate-in fade-in duration-150">
            {/* Top Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-800 shadow-xs">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    Cluster Overview
                  </h1>
                  <p className="text-xs text-slate-500">
                    Solana Devnet L1 & MagicBlock Ephemeral Rollup Telemetry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("workloads")}
                  className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  <span>Function Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("terminal")}
                  className="flex items-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all select-none"
                >
                  <TerminalIcon className="h-3.5 w-3.5" />
                  <span>CloudWatch Terminal</span>
                </button>
              </div>
            </div>

            {/* Active Execution Banner (if running or daemon connected) */}
            {(isExecuting || daemon.connected) && (
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-bold">
                    {daemon.connected
                      ? `CLI Daemon Active: ${daemon.ticksCompleted ?? 0} ticks in TEE RAM`
                      : "Micro-instance actively executing in Ephemeral SVM RAM..."}
                  </span>
                  <span className="font-mono text-[11px] text-amber-800">
                    Task {activeTaskId?.slice(0, 8)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("terminal")}
                  className="font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
                >
                  <span>View Live Stream</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Top Row: 2 Web3 KPI Action Cards (Zero Fake Numbers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Card 1: Devnet Wallet & Compute Budget */}
              <div className="dashboard-card p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <span>Devnet Wallet & Compute Budget</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                      {walletBalance !== null ? `${walletBalance.toFixed(3)} SOL` : connected ? "0.000 SOL" : "Connect Wallet"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {connected ? "Funded for on-demand task delegation & commit" : "Connect your Solana wallet to manage live state accounts"}
                    </div>
                  </div>

                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Airdrop SOL</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Card 2: Delegated Task Accounts (PDAs) */}
              <div className="dashboard-card p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span>Delegated Task Account (PDA)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight truncate max-w-[280px]">
                      {activeTaskId ? activeTaskId.slice(0, 16) + "..." : "Standby (Idle)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Program: <code className="font-mono text-slate-700">solaxis_engine</code> • Ephemeral Rollup Delegation
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Telemetry Strip (100% REAL DATA, Zero Mocked Numbers) */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Session Telemetry & Benchmarks
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric 1: Real Execution Speedup / Latency */}
                <div className="dashboard-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Zap className="h-3.5 w-3.5 text-slate-500" />
                    <span>Execution Speedup</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {telemetry ? (
                      `${(25000 / Math.max(1, telemetry.totalDurationMs)).toFixed(0)}× Faster`
                    ) : daemon.connected && daemon.latencyMs ? (
                      `${daemon.latencyMs}ms / tick`
                    ) : (
                      "--"
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-emerald-700">
                      {telemetry ? (
                        `↑ ${telemetry.totalDurationMs}ms total`
                      ) : daemon.connected ? (
                        "Live TEE RAM"
                      ) : (
                        "Awaiting run"
                      )}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {telemetry ? "vs ~25,000ms L1" : "No runs in session"}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Real L1 Base Gas Reduction */}
                <div className="dashboard-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                    <span>L1 Base Gas Reduction</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {telemetry ? (
                      `${telemetry.l1GasSavedPercent}%`
                    ) : daemon.connected && daemon.gasSaved ? (
                      daemon.gasSaved
                    ) : (
                      "--"
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-emerald-700">
                      {telemetry ? (
                        "1 Commit Tx"
                      ) : daemon.connected ? (
                        "Zero-gas SVM"
                      ) : (
                        "Awaiting settlement"
                      )}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {telemetry ? `vs ${telemetry.iterationsCompleted} L1 Txs` : "No commits yet"}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Live JSON-RPC Events */}
                <div className="dashboard-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <TerminalIcon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Live JSON-RPC Events</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {logs.length}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-emerald-700">
                      {logs.length > 0 ? "Stream Active" : "Buffer Ready"}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {logs.length > 0 ? `${logs.length} events logged` : "0 events"}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* Cluster Topology: Hexagonal Honeycomb & Dot Matrix Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-6">
                <HexClusterMap />
              </div>
              <div className="lg:col-span-6">
                <ThroughputDotChart
                  actualDurationMs={telemetry?.totalDurationMs ?? daemon.latencyMs}
                  executedTicks={telemetry?.iterationsCompleted ?? daemon.ticksCompleted}
                  tickLatencies={tickLatencies}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANE 2: FUNCTION CATALOG (Anchor 0.30+ Workloads & Copyable CLI Commands)
            ========================================================================= */}
        {activeTab === "workloads" && (
          <div className="space-y-5 max-w-6xl animate-in fade-in duration-150">
            {/* Top Title & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-800 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    Function Catalog
                  </h1>
                  <p className="text-xs text-slate-500">
                    Anchor 0.30+ Smart Contract Workloads for Ephemeral Rollups & Intel TDX TEE
                  </p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCatalogFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded transition-all",
                    catalogFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  All (3)
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter("confidential-tee")}
                  className={cn(
                    "px-3 py-1 rounded transition-all",
                    catalogFilter === "confidential-tee"
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Intel TDX TEE
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter("state-engine")}
                  className={cn(
                    "px-3 py-1 rounded transition-all",
                    catalogFilter === "state-engine"
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Standard ER
                </button>
              </div>
            </div>

            {/* Presets Table with Copyable CLI Commands */}
            <WorkloadsTable
              onLaunchWorkload={handleLaunchWorkload}
              isExecuting={isExecuting}
              filterCategory={catalogFilter}
              lastExecutedFunction={selectedFunction}
              lastExecutionDurationMs={telemetry?.totalDurationMs}
              status={status}
            />

            {/* Contract Source & Architecture Details Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Code2 className="h-4 w-4 text-slate-600" />
                  <span>On-Chain Program & Rollup Invariants</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  contracts/programs/solaxis_engine
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Anchor 0.30+ Engine</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Uses the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">#[ephemeral]</code> macro to inject undelegation callbacks CPI'd by the Delegation Program.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Hardware-Isolated TEE</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Confidential hasher runs inside Intel TDX with remote attestation, cryptographically shielding RAM from host operators.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Atomic Intent Settlement</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Uses <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">MagicIntentBundleBuilder.commit_and_undelegate</code> to atomically revert account ownership to L1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANE 3: DEDICATED CLOUDWATCH TERMINAL PANE (Full-Page Streaming Inspector)
            ========================================================================= */}
        {activeTab === "terminal" && (
          <div className="space-y-4 max-w-6xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Overview</span>
                </button>
                <span className="text-slate-300">|</span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">
                    Decentralized CloudWatch Log Stream
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Real-time JSON-RPC transaction logs, block hashes, and sub-10ms timing marks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">
                  {logs.length} events logged
                </span>
              </div>
            </div>

            {/* Full-Height Terminal Deck */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <CloudwatchTerminal />
            </div>
          </div>
        )}

        {/* =========================================================================
            PANE 4: DEDICATED EXPLORER PROOFS & BENCHMARKS PANE (Full-Page Audit)
            ========================================================================= */}
        {activeTab === "proofs" && (
          <div className="space-y-4 max-w-6xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Overview</span>
                </button>
                <span className="text-slate-300">|</span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">
                    Solana Devnet Explorer Proofs & Benchmarks
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Side-by-side performance verification & direct on-chain Devnet Explorer links
                  </p>
                </div>
              </div>

              <a
                href="https://explorer.solana.com/?cluster=devnet"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                <span>Solana Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Benchmark Card */}
            <BenchmarkCard />
          </div>
        )}
      </div>
    </div>
  );
}
