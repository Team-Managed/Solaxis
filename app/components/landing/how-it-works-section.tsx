"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Key,
  Compass,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import gsap from "gsap";

interface StepItem {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  badge: string;
  themeColor: "sky" | "indigo" | "emerald" | "rose";
  accentText: string;
  accentBorder: string;
  accentRing: string;
  accentBg: string;
  terminalAccent: string;
  cursorColor: string;
  icon: React.ReactNode;
  description: string;
  cliCommand: string;
  outputLines: string[];
  timing: string;
  invariants: string[];
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const steps: StepItem[] = [
    {
      id: "provision",
      num: "01",
      title: "Provision & Delegate on L1",
      subtitle: "Solana Base Layer",
      badge: "L1 PDA Init",
      themeColor: "sky",
      accentText: "text-sky-600",
      accentBorder: "border-sky-300",
      accentRing: "ring-sky-500/20",
      accentBg: "bg-sky-50",
      terminalAccent: "text-sky-400",
      cursorColor: "bg-sky-400",
      icon: <Key className="h-5 w-5 text-sky-600" />,
      description:
        "Initialize a task state PDA derived from ['solaxis_task', authority, taskId] on Solana Devnet. The delegate instruction transfers account ownership temporarily to the MagicBlock Delegation Program with zero manual custody risk.",
      cliCommand: "solaxis init task-7f9a2e",
      timing: "420ms on L1",
      invariants: [
        "Deterministic PDA: ['solaxis_task', authority, taskId]",
        "Rent-exempt reserve: 2.450 SOL allocated",
        "Ownership delegated to MagicBlock Delegation Program",
      ],
      outputLines: [
        "$ solaxis init task-7f9a2e",
        "✔ Initializing Task PDA (Task ID: task-7f9a2e) on Solana Devnet...",
        "✔ Task PDA successfully initialized on L1!",
        "",
        "Task Details:",
        "  Task ID:       task-7f9a2e",
        "  Task PDA:      C93VteY6Pwo7bBiWtVZggkMzYGmZQgbENQHnFM3xzmXC",
        "  Authority:     CniPSdkAUaNTfZZUSKvAKU2VJuWecRjqvGhDmQjGSZEG",
        "  Transaction:   https://explorer.solana.com/tx/9Fnssirppi14PBfA5EzuNwLYKL7zSfQGq65EvPfXHuN9nSAQFuUouTnAmDRYeQ8gLLSAn7q5yL7iii9RvR99J3s?cluster=devnet",
      ],
    },
    {
      id: "router",
      num: "02",
      title: "Dynamic Router Discovery",
      subtitle: "MagicBlock Routing",
      badge: "< 500ms Discovery",
      themeColor: "indigo",
      accentText: "text-indigo-600",
      accentBorder: "border-indigo-300",
      accentRing: "ring-indigo-500/20",
      accentBg: "bg-indigo-50",
      terminalAccent: "text-indigo-400",
      cursorColor: "bg-indigo-400",
      icon: <Compass className="h-5 w-5 text-indigo-600" />,
      description:
        "The client discovers active Ephemeral Rollup validators dynamically via router.getDelegationStatus(taskPda), inspecting live block rates, slot heights, and hardware enclave availability with zero static IP hardcoding.",
      cliCommand: "solaxis vm task-7f9a2e",
      timing: "145ms RTT",
      invariants: [
        "Zero static regional IP dependencies",
        "Dynamic cryptographic routing to nearest ER node",
        "Active validator authentication via ER certificate",
      ],
      outputLines: [
        "$ solaxis vm task-7f9a2e",
        "┌────────────────────┬────────────────────────────────────────────────┐",
        "│ ⚡ Solaxis Micro-VM │ ● OPERATIONAL                                  │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ Environment        │ Intel TDX TEE (Encrypted)                      │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ Block Time / Rate  │ ~8.4ms (48x faster than Solana L1)             │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ Slots (VM vs L1)   │ 301,794,300 (L1: 496,024,961)                  │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ Validator Host     │ devnet-tee.magicblock.app                      │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ In-Memory State    │ Cached (168B in TEE RAM)                       │",
        "├────────────────────┼────────────────────────────────────────────────┤",
        "│ VM Web Explorer    │ https://explorer.solana.com/address/C93VteY... │",
        "└────────────────────┴────────────────────────────────────────────────┘",
      ],
    },
    {
      id: "compute",
      num: "03",
      title: "High-Speed Ephemeral Loop",
      subtitle: "Sub-10ms Micro-VM",
      badge: "Zero Base-Layer Gas",
      themeColor: "emerald",
      accentText: "text-emerald-600",
      accentBorder: "border-emerald-300",
      accentRing: "ring-emerald-500/20",
      accentBg: "bg-emerald-50",
      terminalAccent: "text-emerald-400",
      cursorColor: "bg-emerald-400",
      icon: <Cpu className="h-5 w-5 text-emerald-600" />,
      description:
        "High-frequency compute iterations execute in-memory inside the Intel TDX TEE enclave at sub-10ms tick latency with 0 Lamports consumed in base-layer gas fees, streaming real-time iteration telemetry to the client.",
      cliCommand: "solaxis invoke batch-risk-simulator -i 50 --tee",
      timing: "8.4ms / tick • 342ms total",
      invariants: [
        "In-memory SVM state transition loop (< 10ms per tick)",
        "Zero base-layer gas fees consumed during micro-instance run",
        "Hardware-isolated TEE memory cryptographically shielded from host",
      ],
      outputLines: [
        "$ solaxis invoke batch-risk-simulator -i 50 --tee",
        "",
        "⚡ Solaxis Micro-Instance Engine: Invoking \"batch-risk-simulator\" on confidential-tee",
        "Authority: CniPSdkAUaNTfZZUSKvAKU2VJuWecRjqvGhDmQjGSZEG | Task ID: task-7f9a2e",
        "",
        "✔ [1/5] Account delegated to MagicBlock Delegation Program",
        "✔ [2/5] Active Ephemeral Rollup validator discovered (devnet-tee.magicblock.app (Intel TDX TEE))",
        "✔ [3/5] Ephemeral Micro-VM compute loop completed (50 iterations in sub-10ms ER engine)",
        "✔ [4/5] Atomic state committed back to Solana L1",
        "✔ [5/5] Micro-instance execution settled on Solana L1!",
      ],
    },
    {
      id: "settle",
      num: "04",
      title: "Atomic L1 Settlement",
      subtitle: "Cryptographic Finality",
      badge: "Atomic Revert",
      themeColor: "rose",
      accentText: "text-rose-600",
      accentBorder: "border-rose-300",
      accentRing: "ring-rose-500/20",
      accentBg: "bg-rose-50",
      terminalAccent: "text-rose-400",
      cursorColor: "bg-rose-400",
      icon: <CheckCircle2 className="h-5 w-5 text-rose-600" />,
      description:
        "MagicIntentBundleBuilder.commit_and_undelegate seals the final cryptographic state on Solana L1 in a single transaction, reverting PDA account ownership back to your Anchor program with complete telemetry metrics.",
      cliCommand: "solaxis status task-7f9a2e",
      timing: "1 Commit Tx to L1",
      invariants: [
        "Single atomic settlement transaction commits final state root",
        "Account ownership cleanly reverts back to Anchor program ID",
        "Anti-dangling PDA safety prevents orphaned state lockups",
      ],
      outputLines: [
        "$ solaxis status task-7f9a2e",
        "══════════════════════════════════════════════════════════════════════════════════════",
        "                      SOLAXIS MICRO-INSTANCE SETTLEMENT SUMMARY",
        "══════════════════════════════════════════════════════════════════════════════════════",
        "┌─────────────────────────────┬────────────────────────────────────────────────────────┐",
        "│ ⚡ Solaxis Telemetry Metric  │ Execution Value                                        │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ Function Name               │ batch-risk-simulator                                   │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ Task ID                     │ task-7f9a2e                                            │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ Total Execution Duration    │ 342 ms (Spin-up: 280ms | ER: 12ms | Teardown: 50ms)    │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ Iterations Completed        │ 50 iterations                                          │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ Compute Throughput          │ 4166.7 iter/sec (~65x speedup)                         │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ L1 Gas Saved                │ 99.4% (Zero Base Gas)                                  │",
        "├─────────────────────────────┼────────────────────────────────────────────────────────┤",
        "│ L1 Settlement Tx            │ https://explorer.solana.com/tx/3XqR2vL8aB3cD4eF5g...   │",
        "└─────────────────────────────┴────────────────────────────────────────────────────────┘",
      ],
    },
  ];

  const current = steps[activeStep];

  // AUTOMATIC SCROLL-TRIGGERED STEP SELECTION
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const triggerLine = windowHeight * 0.45;

      let closestIdx = activeStep;
      let minDistance = Infinity;

      stepRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - triggerLine);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      if (closestIdx !== activeStep) {
        setActiveStep(closestIdx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeStep]);

  // GSAP animation when active step changes
  useEffect(() => {
    if (!terminalRef.current) return;

    gsap.fromTo(
      terminalRef.current,
      { opacity: 0.85, y: 6 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [activeStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText(current.cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Render individual CLI lines with authentic terminal styling matching @solaxis/cli
  const renderCliLine = (line: string, idx: number) => {
    if (!line) {
      return <div key={idx} className="h-2" />;
    }

    // Shell prompt
    if (line.startsWith("$ ")) {
      return (
        <div key={idx} className="flex items-center gap-2 font-bold text-white pb-1 pt-0.5 select-text">
          <span className="text-emerald-400 select-none">➜</span>
          <span className="text-sky-400 select-none font-bold">~</span>
          <span className="text-slate-100">{line.slice(2)}</span>
        </div>
      );
    }

    // Success checkmark lines
    if (line.startsWith("✔ ")) {
      return (
        <div key={idx} className="flex items-start gap-1.5 text-emerald-400 font-medium select-text">
          <span className="text-emerald-400 font-bold shrink-0">✔</span>
          <span className="text-slate-200">{line.slice(2)}</span>
        </div>
      );
    }

    // Settlement summary banner border
    if (line.startsWith("═")) {
      return (
        <div key={idx} className="text-amber-500/70 select-none overflow-hidden text-[10px] sm:text-[11px] leading-none font-mono">
          {line}
        </div>
      );
    }

    // Settlement summary banner title
    if (line.includes("SOLAXIS MICRO-INSTANCE SETTLEMENT SUMMARY")) {
      return (
        <div key={idx} className="text-amber-400 font-bold text-center tracking-wider py-0.5 font-mono text-[11px] sm:text-xs select-text">
          {line.trim()}
        </div>
      );
    }

    // Engine invocation header
    if (line.includes("⚡ Solaxis Micro-Instance Engine:")) {
      return (
        <div key={idx} className="font-bold pt-1 pb-0.5 font-mono select-text">
          <span className="text-amber-400">⚡ Solaxis Micro-Instance Engine: </span>
          <span className="text-white">Invoking &quot;batch-risk-simulator&quot; on confidential-tee</span>
        </div>
      );
    }

    // Task Details header
    if (line === "Task Details:") {
      return (
        <div key={idx} className="text-amber-400 font-bold font-mono pt-1 select-text">
          {line}
        </div>
      );
    }

    // Table borders: ┌, ├, └
    if (line.startsWith("┌") || line.startsWith("├") || line.startsWith("└")) {
      return (
        <div key={idx} className="text-slate-600 select-none text-[11px] sm:text-xs leading-none font-mono">
          {line}
        </div>
      );
    }

    // Table rows: │ ... │
    if (line.startsWith("│")) {
      // Header row
      if (line.includes("⚡ Solaxis")) {
        return (
          <div key={idx} className="text-slate-200 font-mono text-[11px] sm:text-xs select-text">
            <span className="text-slate-600">│ </span>
            <span className="text-amber-400 font-bold">
              {line.includes("Micro-VM") ? "⚡ Solaxis Micro-VM  " : "⚡ Solaxis Telemetry Metric "}
            </span>
            <span className="text-slate-600">│ </span>
            <span className="text-emerald-400 font-bold">
              {line.includes("OPERATIONAL") ? "● OPERATIONAL                                  " : "Execution Value                                        "}
            </span>
            <span className="text-slate-600">│</span>
          </div>
        );
      }

      const isTee = line.includes("Intel TDX TEE");
      const isLink = line.includes("https://explorer.solana.com");
      const isGreen = line.includes("99.4%") || line.includes("50 iterations") || line.includes("Cached") || line.includes("~8.4ms");

      return (
        <div key={idx} className="text-slate-300 font-mono text-[11px] sm:text-xs select-text">
          {line.split("│").map((segment, sIdx, arr) => {
            if (sIdx === 0 || sIdx === arr.length - 1) return null;
            let cellColor = "text-slate-200";

            if (sIdx === 1) {
              cellColor = "text-slate-300 font-semibold";
            } else if (sIdx === 2) {
              if (isTee) cellColor = "text-purple-400 font-semibold";
              else if (isLink) cellColor = "text-sky-400 underline";
              else if (isGreen) cellColor = "text-emerald-400 font-bold";
              else cellColor = "text-slate-100";
            }

            return (
              <React.Fragment key={sIdx}>
                <span className="text-slate-600">│</span>
                <span className={cellColor}>{segment}</span>
              </React.Fragment>
            );
          })}
          <span className="text-slate-600">│</span>
        </div>
      );
    }

    // Key-value lines under Task Details
    if (
      line.startsWith("  Task ID:") ||
      line.startsWith("  Task PDA:") ||
      line.startsWith("  Authority:") ||
      line.startsWith("  Transaction:") ||
      line.startsWith("Authority:")
    ) {
      const colonIdx = line.indexOf(":");
      const key = line.slice(0, colonIdx + 1);
      const val = line.slice(colonIdx + 1);
      const isLink = val.includes("https://");
      const isPda = key.includes("PDA");

      return (
        <div key={idx} className="font-mono text-[11px] sm:text-xs select-text">
          <span className="text-slate-500">{key}</span>
          <span
            className={
              isLink
                ? "text-sky-400 underline ml-1 truncate inline-block max-w-[400px] align-bottom"
                : isPda
                ? "text-sky-300 font-semibold ml-1"
                : "text-slate-200 ml-1"
            }
          >
            {val}
          </span>
        </div>
      );
    }

    return (
      <div key={idx} className="text-slate-300 font-mono text-[11px] sm:text-xs select-text">
        {line}
      </div>
    );
  };

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-14">
        {/* CENTERED MAIN HEADER - Normal text, zero outer box, zero sparkles */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
            4-Stage Lifecycle Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-950">
            How Solaxis Powers Sovereign Serverless
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            The complete 4-stage lifecycle from L1 state PDA to Ephemeral Rollup compute and atomic settlement. The terminal updates automatically as you scroll to mirror the standalone CLI.
          </p>
        </div>

        {/* =========================================================================
            SPLIT ARCHITECTURE:
            LEFT: Cascading Staircase Layers with full content (0 outer box)
            RIGHT: Sticky Developer CLI Console (updates on scroll & click)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* =========================================================================
              LEFT: CASCADING STAIRCASE LAYERS (lg:col-span-6)
              ========================================================================= */}
          <div className="lg:col-span-6 space-y-5">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;

              // Staircase progressive indentation: 0px, 20px, 40px, 60px
              const stairIndentClasses = [
                "translate-x-0",
                "sm:translate-x-5",
                "sm:translate-x-10",
                "sm:translate-x-15",
              ][idx];

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer transition-all duration-300 rounded-2xl p-5 sm:p-6 border ${stairIndentClasses} ${
                    isActive
                      ? `bg-white ${step.accentBorder} shadow-lg ring-2 ${step.accentRing}`
                      : "bg-white/75 hover:bg-white border-slate-200/90 text-slate-600 shadow-xs hover:border-slate-300"
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xl sm:text-2xl font-black transition-colors ${
                          isActive ? step.accentText : "text-slate-400"
                        }`}
                      >
                        {step.num}
                      </span>
                      <div>
                        <div
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isActive ? step.accentText : "text-slate-500"
                          }`}
                        >
                          {step.subtitle}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {step.badge}
                      </span>
                    </div>
                  </div>

                  {/* Step Body Content - embedded directly inside each staircase layer */}
                  <div className="pt-3 space-y-3">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Associated CLI Command Tag */}
                    <div className="pt-1 flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400 text-[11px]">Command:</span>
                      <code className={`px-2 py-0.5 rounded-sm font-bold ${isActive ? `${step.accentBg} ${step.accentText}` : "bg-slate-100 text-slate-700"}`}>
                        {step.cliCommand}
                      </code>
                    </div>

                    {/* Architectural Invariants / Specs */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {step.invariants.map((inv, invIdx) => (
                        <div key={invIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className={`font-bold mt-0.5 ${isActive ? step.accentText : "text-slate-400"}`}>
                            ›
                          </span>
                          <span>{inv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              RIGHT: STICKY DEVELOPER CLI CONSOLE (lg:col-span-6)
              Automatically tracks active step while scrolling & matches @solaxis/cli
              ========================================================================= */}
          <div className="lg:col-span-6 space-y-3 lg:sticky lg:top-24">
            {/* Terminal Window Frame */}
            <div
              ref={terminalRef}
              className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs text-slate-200"
            >
              {/* Terminal Title Bar */}
              <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium ml-2">
                    zsh • solaxis v0.1.0 (Devnet)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live CLI
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">{current.timing}</span>
                </div>
              </div>

              {/* Interactive Command Header Strip */}
              <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm truncate ${current.terminalAccent}`}>
                  <span className="text-slate-500 select-none">$</span>
                  <span className="truncate">{current.cliCommand}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors font-sans font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Execution Body / Log Stream - Authentic Monospace Box Rendering */}
              <div className="p-4 sm:p-6 space-y-1.5 min-h-[310px] bg-slate-950/95 overflow-x-auto whitespace-pre leading-relaxed text-[11px] sm:text-xs">
                {current.outputLines.map((line, idx) => renderCliLine(line, idx))}

                {/* Animated Typing Cursor */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-emerald-400 select-none">➜</span>
                  <span className="text-sky-400 select-none font-bold">~</span>
                  <span className={`h-4 w-2 ${current.cursorColor} animate-pulse inline-block`} />
                </div>
              </div>

              {/* Terminal Footer Action */}
              <div className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                <span className="text-slate-400 text-[11px]">
                  Output identical to <code className="text-slate-300 font-mono">@solaxis/cli</code> on Solana Devnet &amp; MagicBlock
                </span>

                <a
                  href="#quickstart"
                  className="flex items-center gap-1.5 font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Quickstart &amp; Install</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Sub-label */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
              <span>Step {current.num} of 04 • {current.title}</span>
              <span>Scrolls automatically or click steps</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
