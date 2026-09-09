"use client";

import React, { useState } from "react";
import { ExternalLink, Copy, Check, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TelemetryMetrics } from "@solaxis/shared";

interface ExplorerPanelProps {
  telemetry: TelemetryMetrics;
}

export function ExplorerPanel({ telemetry }: ExplorerPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySignature = (sig: string, key: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const delegationUrl = `https://explorer.solana.com/tx/${telemetry.delegationTxSignature}?cluster=devnet`;
  const settlementUrl = `https://explorer.solana.com/tx/${telemetry.settlementTxSignature}?cluster=devnet`;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-graphite-800/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-white">
            Solana Devnet On-Chain Auditability
          </h4>
        </div>
        <Badge variant="success" className="gap-1 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          PDA Ownership Reverted to Engine
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Proof 1: L1 Delegation Tx */}
        <div className="rounded-lg border border-white/10 bg-obsidian-900/90 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-400">
                1. Delegation Proof (L1 ➔ ER)
              </span>
              <button
                onClick={() => copySignature(telemetry.delegationTxSignature, "delegation")}
                className="text-zinc-500 hover:text-white transition-colors"
                title="Copy Delegation Tx Signature"
              >
                {copiedKey === "delegation" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans mb-2">
              CPI transfer of Task PDA to MagicBlock Delegation Program.
            </p>
            <span className="font-mono text-xs text-zinc-300 break-all block mb-3">
              {telemetry.delegationTxSignature}
            </span>
          </div>

          <a
            href={delegationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-mono text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <span>View Delegation on Solana Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Proof 2: L1 Settlement Tx */}
        <div className="rounded-lg border border-white/10 bg-obsidian-900/90 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-400">
                2. Settlement Proof (ER ➔ L1)
              </span>
              <button
                onClick={() => copySignature(telemetry.settlementTxSignature, "settlement")}
                className="text-zinc-500 hover:text-white transition-colors"
                title="Copy Settlement Tx Signature"
              >
                {copiedKey === "settlement" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans mb-2">
              Atomic undelegation intent sealed by MagicIntentBundleBuilder.
            </p>
            <span className="font-mono text-xs text-zinc-300 break-all block mb-3">
              {telemetry.settlementTxSignature}
            </span>
          </div>

          <a
            href={settlementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <span>View Settlement on Solana Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
