"use client";

import React from "react";
import { Zap } from "lucide-react";

interface ComparisonRow {
  metric: string;
  l1: string;
  aws: string;
  solaxis: string;
  textColor: string;
  cellBg: string;
}

export function ComparisonSection() {
  const rows: ComparisonRow[] = [
    {
      metric: "Iteration Latency",
      l1: "400 – 800ms (slot times)",
      aws: "100 – 250ms",
      solaxis: "< 10ms (sub-slot ticks)",
      textColor: "text-emerald-700 font-bold",
      cellBg: "bg-emerald-50/50",
    },
    {
      metric: "Gas Cost Per Iteration",
      l1: "~5,000 Lamports",
      aws: "0 gas (monthly cloud bill)",
      solaxis: "0 Lamports (zero gas)",
      textColor: "text-teal-700 font-bold",
      cellBg: "bg-teal-50/50",
    },
    {
      metric: "50-Iteration Duration",
      l1: "25 – 40 seconds",
      aws: "200 – 500ms",
      solaxis: "~340ms (~65x faster)",
      textColor: "text-sky-700 font-bold",
      cellBg: "bg-sky-50/50",
    },
    {
      metric: "Infrastructure Sovereignty",
      l1: "High (Solana L1)",
      aws: "None (Centralized cloud)",
      solaxis: "High (On-chain + TEE)",
      textColor: "text-indigo-700 font-bold",
      cellBg: "bg-indigo-50/50",
    },
    {
      metric: "Confidentiality / MEV Shield",
      l1: "None (Public mempool)",
      aws: "Opaque (Cloud admin access)",
      solaxis: "Intel TDX Hardware TEE",
      textColor: "text-purple-700 font-bold",
      cellBg: "bg-purple-50/50",
    },
    {
      metric: "State Settlement",
      l1: "Fragmented (50 txs)",
      aws: "Off-chain (Requires custom oracle)",
      solaxis: "1 Atomic L1 Commitment",
      textColor: "text-rose-700 font-bold",
      cellBg: "bg-rose-50/50",
    },
    {
      metric: "Cumulative Cost Reduction",
      l1: "Baseline",
      aws: "Cloud lock-in",
      solaxis: "> 99.4% Gas Reduction",
      textColor: "text-emerald-700 font-bold",
      cellBg: "bg-emerald-50/50",
    },
  ];

  return (
    <section id="benchmarks" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Soft Twilight Sky-Tinted Background Container - Light & Ethereal */}
        <div className="relative rounded-3xl bg-[#f0f4fa] border border-[#dce6f2] p-6 sm:p-10 lg:p-12 shadow-sm text-slate-900">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">
              Performance Benchmarks & Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-950">
              Why Solaxis Outperforms L1 & Web2 Cloud
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Side-by-side technical comparison across latency, fees, confidentiality, and architectural sovereignty.
            </p>
          </div>

          {/* Crisp White Frosted Table on Soft Sky Background */}
          <div className="mt-12 max-w-5xl mx-auto overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-4 px-6 font-bold text-slate-900">
                        Architecture Feature
                      </th>
                      <th className="py-4 px-6 font-semibold text-slate-600">
                        Traditional Solana L1
                      </th>
                      <th className="py-4 px-6 font-semibold text-slate-600">
                        AWS Lambda (Cloud)
                      </th>
                      <th className="py-4 px-6 font-black text-slate-900 bg-slate-100/80 border-l border-slate-200">
                        <div className="flex items-center gap-1.5 text-slate-900">
                          <Zap className="h-4 w-4 text-sky-600 fill-current" />
                          <span>Solaxis Micro-VM</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-medium">
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {row.metric}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {row.l1}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {row.aws}
                        </td>
                        <td
                          className={`py-4 px-6 font-mono text-xs border-l border-slate-200 ${row.cellBg} ${row.textColor}`}
                        >
                          {row.solaxis}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
