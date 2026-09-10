"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  Play,
  RotateCcw,
  Zap,
  LayoutGrid,
  Wallet,
  Clock,
  Layers,
  TrendingUp,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HexClusterMap } from "@/components/console/hex-cluster-map";
import { ThroughputDotChart } from "@/components/console/throughput-dot-chart";
import { cn } from "@/lib/utils";

const SAMPLE_TICK_LATENCIES = [
  8.4, 9.2, 7.8, 8.5, 9.0, 10.1, 8.2, 7.9, 8.6, 9.4, 8.8, 11.0, 9.5, 8.7, 8.1, 9.0,
  10.2, 8.9, 7.6, 8.3, 9.1, 8.7, 9.8, 8.4, 7.8, 8.5, 9.2, 8.6, 10.3, 8.9, 8.2, 9.3,
  8.7, 7.9, 8.4, 9.1, 10.4, 8.8, 8.1, 9.2, 8.5, 8.0, 9.0, 8.6, 9.4, 8.3, 7.9, 8.7, 9.1, 8.5
];

export function HeroSection() {
  const [simulating, setSimulating] = useState(false);
  const [simTick, setSimTick] = useState(50);
  const [simDuration, setSimDuration] = useState(342);
  const [simLatencies, setSimLatencies] = useState<number[]>(SAMPLE_TICK_LATENCIES);

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimTick(0);
    setSimDuration(0);
    setSimLatencies([]);

    const start = performance.now();
    let tick = 0;

    const interval = setInterval(() => {
      tick += 5;
      setSimTick(tick);
      setSimDuration(Math.round(performance.now() - start));
      setSimLatencies(SAMPLE_TICK_LATENCIES.slice(0, tick));

      if (tick >= 50) {
        clearInterval(interval);
        setSimDuration(Math.round(performance.now() - start));
        setSimulating(false);
      }
    }, 35);
  };

  return (
    <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 w-full flex flex-col justify-center">
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-8 lg:px-12 space-y-8 sm:space-y-12">
        {/* =========================================================================
            TOP HALF: EXPANSIVE WIDESCREEN EDITORIAL HERO TEXT (Zero pills, solid)
            ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-4 sm:space-y-5">
          {/* Scaled Wide Headline without gradients or pills */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-slate-950 leading-[1.08] max-w-4xl mx-auto">
            AWS Lambda for Solana.
            <br />
            <span className="italic font-serif text-slate-700">
              Without the cloud.
            </span>
          </h1>

          {/* Scaled Wide Product Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Solaxis turns any Solana state account into an isolated, confidential execution sandbox.
            Powered by MagicBlock Ephemeral Rollups and Intel TDX TEEs—compute at <strong className="text-slate-900 font-bold">sub-10ms latency</strong> with <strong className="text-slate-900 font-bold">zero gas</strong>, and settle atomically to L1.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <a href="#quickstart">
              <Button className="h-10 sm:h-11 px-6 sm:px-7 rounded-md bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all hover:scale-102">
                Get Started
              </Button>
            </a>

            <a href="#how-it-works">
              <Button
                variant="outline"
                className="h-10 sm:h-11 px-6 sm:px-7 rounded-md border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
              >
                How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* =========================================================================
            LOWER HALF: BACKGROUND IMAGE SPANS WIDE (1680px), MOCK DASHBOARD MATCHING REAL CONSOLE
            ========================================================================= */}
        <div className="relative mx-auto w-full max-w-[1680px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl px-4 py-8 sm:px-10 sm:py-12 lg:px-20 lg:py-16">
          {/* Ambient Twilight Sunset Background Image extending far beyond mock dashboard */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <img
              src="/image.png"
              alt="Solaxis Twilight Sunset Cloudscape"
              className="w-full h-full object-cover object-center filter saturate-[1.25] brightness-[0.95]"
            />
            {/* Soft solid dark overlay for clean contrast */}
            <div className="absolute inset-0 bg-slate-950/15" />
          </div>

          {/* THE MOCK DASHBOARD (Matching real console: Sidebar + Workspace Deck) */}
          <div className="mx-auto w-full max-w-5xl lg:max-w-[1140px] rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900 flex flex-col md:flex-row">
            {/* Left Mock Console Sidebar */}
            <div className="hidden md:flex w-52 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 select-none">
              <div className="space-y-4">
                {/* Brand */}
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="text-xs font-black tracking-widest text-slate-900 font-sans">
                    SOLAXIS
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Devnet TEE Cluster
                  </div>
                </div>

                {/* 4 Panes Nav */}
                <nav className="space-y-1 text-xs font-medium">
                  <div className="px-1.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspace Panes
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 text-white font-bold text-xs shadow-xs">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cluster Overview</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 text-xs transition-colors">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>Function Catalog</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 text-xs transition-colors">
                    <TerminalIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>CloudWatch Logs</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 text-xs transition-colors">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>Explorer Proofs</span>
                  </div>
                </nav>
              </div>

              {/* Bottom Enclave Status Badge */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase text-slate-700 font-sans">Intel TDX</span>
                  <span className="text-[10px] font-bold text-emerald-600">Operational</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans truncate">
                  devnet-tee.magicblock.app
                </div>
              </div>
            </div>

            {/* Right Main Deck */}
            <div className="flex-1 min-w-0 p-5 sm:p-6 space-y-5 bg-[#f8fafc]">
              {/* Top Dashboard Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-800 shadow-xs">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Cluster Overview
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Solana Devnet L1 & MagicBlock Ephemeral Rollup Telemetry
                    </p>
                  </div>
                </div>

                {/* Quick Simulation Trigger */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={runSimulation}
                    disabled={simulating}
                    size="sm"
                    className="h-8 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 shadow-xs"
                  >
                    {simulating ? (
                      <>
                        <RotateCcw className="h-3 w-3 animate-spin" />
                        <span>Running {simTick}/50...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span>Simulate Invocation</span>
                      </>
                    )}
                  </Button>

                  <Link href="/console">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-md border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs shadow-xs"
                    >
                      Console ↗
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Top 2 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="dashboard-card p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-slate-500" />
                      <span>Devnet Wallet Budget</span>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                    2.450 SOL
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Rent-exempt reserve for PDA task delegation
                  </div>
                </div>

                <div className="dashboard-card p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>Delegated Task Account</span>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono truncate">
                    task-7f9a2e...4b1
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Program: <code className="text-slate-700 font-mono">solaxis_engine</code> • Ephemeral Delegation
                  </div>
                </div>
              </div>

              {/* Performance Telemetry Strip (Matches Real Console) */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Session Telemetry & Benchmarks
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="dashboard-card p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Zap className="h-3.5 w-3.5 text-slate-500" />
                      <span>Execution Speedup</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 font-mono">
                      {simDuration > 0 ? `${(25000 / Math.max(1, simDuration)).toFixed(0)}× Faster` : "--"}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-mono font-bold">
                        {simDuration > 0 ? `↑ ${simDuration}ms total` : "Awaiting run"}
                      </span>
                      <span className="text-slate-500 font-mono">vs ~25,000ms L1</span>
                    </div>
                  </div>

                  <div className="dashboard-card p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                      <span>L1 Base Gas Reduction</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 font-mono">
                      {simTick > 0 ? `${(((simTick * 5000 - 5000) / (simTick * 5000)) * 100).toFixed(1)}%` : "--"}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-mono font-bold">
                        1 Commit Tx
                      </span>
                      <span className="text-slate-500 font-mono">vs {simTick} L1 Txs</span>
                    </div>
                  </div>

                  <div className="dashboard-card p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <TerminalIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>Live JSON-RPC Events</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 font-mono">
                      {simTick * 2}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-mono font-bold">
                        Stream Active
                      </span>
                      <span className="text-slate-500 font-mono">CloudWatch Buffer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The 2 Visualizations: Hexagonal Honeycomb & Throughput Dot Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-6">
                  <HexClusterMap compact={true} />
                </div>
                <div className="lg:col-span-6">
                  <ThroughputDotChart
                    compact={true}
                    actualDurationMs={simDuration}
                    executedTicks={simTick}
                    tickLatencies={simLatencies}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
