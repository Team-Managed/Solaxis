"use client";

import React, { useState } from "react";
import {
  Terminal,
  Code2,
  Copy,
  Check,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";

type QuickstartTab = "cli" | "sdk";

export function QuickstartSection() {
  const [activeTab, setActiveTab] = useState<QuickstartTab>("cli");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const cliSnippet = `# 1. Install Solaxis CLI globally (or run with npx without installing)
npm install -g @solaxis/cli

# 2. Run instant micro-instance compute on Devnet & Intel TDX TEE
npx solaxis invoke batch-risk-simulator -i 50 --tee

# 3. Scaffold a new custom function project
solaxis new my-risk-engine

# 4. Diagnose live Ephemeral Micro-VM tick rates & memory state
solaxis vm`;

  const sdkSnippet = `import { SolaxisClient, defineFunction } from "@solaxis/sdk";

// 1. Define a serverless micro-instance function
export const riskSimulator = defineFunction({
  name: "batch-risk-simulator",
  defaultIterations: 50,
  targetValidator: "confidential-tee", // Route to Intel TDX TEE enclave
});

// 2. Initialize client and attach real-time tick listeners
const client = new SolaxisClient({ cluster: "devnet" });

client.on("progress", (event) => {
  console.log(\`[Tick \${event.currentIteration}/\${event.totalIterations}] Compute State: \${event.currentOutput}\`);
});

// 3. Execute end-to-end: L1 delegation -> ER loop -> Atomic L1 settlement
const metrics = await client.invoke(riskSimulator, { iterations: 50 });
console.log(\`Settled in \${metrics.totalDurationMs}ms (Gas Saved: \${metrics.l1GasSavedPercent}%)\`);`;

  return (
    <section id="quickstart" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-12">
        {/* CENTERED HEADER - Clean typography, zero outer box, zero sparkles */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
            Developer Quickstart
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-950">
            Deploy Your First Micro-Instance in Seconds
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Choose your preferred developer interface: standalone terminal CLI or programmatic TypeScript SDK.
          </p>
        </div>

        {/* Quickstart Container Card - Light Twilight Tint (#f0f4fa), Not Dark Mode */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#f0f4fa] border border-[#dce6f2] p-6 sm:p-10 shadow-sm text-slate-900 space-y-8">
          {/* Top Interface Tab Selector (Clean rectangular buttons, zero pills) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("cli")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "cli"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Terminal className="h-4 w-4 text-sky-400" />
                <span>Terminal CLI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sdk")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "sdk"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>TypeScript SDK</span>
              </button>
            </div>

            {/* Quick Instant Run Command Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 shadow-2xs">
              <span className="text-slate-400 select-none">$</span>
              <span className="font-semibold text-sky-700">npx solaxis invoke</span>
              <span className="text-slate-500">batch-risk-simulator</span>
              <button
                type="button"
                onClick={() => handleCopy("npx solaxis invoke batch-risk-simulator -i 50 --tee", "top-cmd")}
                className="ml-2 p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy Command"
              >
                {copiedKey === "top-cmd" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: TERMINAL CLI */}
          {activeTab === "cli" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Run via Standalone CLI (<code className="font-mono text-sky-700">solaxis</code>)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Execute micro-instances from terminal pipelines, CI/CD, or local developer scripts on Solana Devnet.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy("npm install -g @solaxis/cli", "cli-npm")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-xs font-mono font-medium text-slate-800 transition-colors shadow-2xs"
                  >
                    {copiedKey === "cli-npm" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>npm i -g @solaxis/cli</span>
                  </button>
                </div>
              </div>

              {/* Monospace Code Terminal Window */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[11px] text-slate-400 ml-2">bash • terminal</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(cliSnippet, "cli-snippet")}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedKey === "cli-snippet" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto whitespace-pre leading-relaxed text-slate-200 text-[11px] sm:text-xs">
                  {cliSnippet.split("\n").map((line, i) => {
                    const isComment = line.startsWith("#");
                    const isCommand = line.startsWith("npm") || line.startsWith("npx") || line.startsWith("solaxis");

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-slate-600 select-none text-[10px] w-4 text-right shrink-0">
                          {i + 1}
                        </span>
                        <span
                          className={
                            isComment
                              ? "text-slate-500 font-normal italic"
                              : isCommand
                              ? "text-sky-300 font-semibold"
                              : "text-slate-200"
                          }
                        >
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Micro Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-sky-600" />
                    <span>Instant Execution</span>
                  </div>
                  <div className="text-slate-600 mt-1 text-[11px] leading-normal">
                    Run directly via <code className="text-slate-800 font-mono font-semibold">npx solaxis invoke</code> without prior installation.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Devnet Keypairs</span>
                  </div>
                  <div className="text-slate-600 mt-1 text-[11px] leading-normal">
                    Uses your existing <code className="text-slate-800 font-mono font-semibold">~/.config/solana/id.json</code> or creates an ephemeral test signer.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Simulation Mode</span>
                  </div>
                  <div className="text-slate-600 mt-1 text-[11px] leading-normal">
                    Pass <code className="text-slate-800 font-mono font-semibold">--simulate</code> to test telemetry pipelines offline in 800ms.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPESCRIPT SDK */}
          {activeTab === "sdk" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Programmatic Integration (<code className="font-mono text-emerald-700">@solaxis/sdk</code>)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Embed serverless micro-instance compute loops into Web3 dApps, Node backends, or autonomous AI agents.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy("npm install @solaxis/sdk @solana/web3.js", "sdk-npm")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-xs font-mono font-medium text-slate-800 transition-colors shadow-2xs"
                  >
                    {copiedKey === "sdk-npm" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>npm i @solaxis/sdk</span>
                  </button>
                </div>
              </div>

              {/* Monospace Code Window */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[11px] text-slate-400 ml-2">compute.ts • TypeScript</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(sdkSnippet, "sdk-snippet")}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedKey === "sdk-snippet" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto whitespace-pre leading-relaxed text-slate-200 text-[11px] sm:text-xs">
                  {sdkSnippet.split("\n").map((line, i) => {
                    const isComment = line.trim().startsWith("//");
                    const isImport = line.startsWith("import");
                    const isExport = line.startsWith("export");

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-slate-600 select-none text-[10px] w-4 text-right shrink-0">
                          {i + 1}
                        </span>
                        <span
                          className={
                            isComment
                              ? "text-slate-500 font-normal italic"
                              : isImport || isExport
                              ? "text-purple-300 font-semibold"
                              : line.includes("SolaxisClient") || line.includes("defineFunction")
                              ? "text-emerald-300 font-semibold"
                              : "text-slate-200"
                          }
                        >
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
