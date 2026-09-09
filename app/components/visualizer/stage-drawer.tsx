"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, ShieldCheck, CheckCircle2, Cpu, Zap, Activity } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TelemetryMetrics } from "@solaxis/shared";

export type StageIndex = 1 | 2 | 3 | 4;

interface StageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageIndex: StageIndex | null;
  taskPda?: string | null;
  authority?: string | null;
  telemetry?: TelemetryMetrics | null;
  computeOutput?: string | null;
  currentIteration?: number;
  totalIterations?: number;
}

export function StageDrawer({
  open,
  onOpenChange,
  stageIndex,
  taskPda,
  authority,
  telemetry,
  computeOutput,
  currentIteration = 0,
  totalIterations = 50,
}: StageDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!stageIndex) return null;

  const stageTitles: Record<StageIndex, { title: string; desc: string; icon: React.ElementType }> = {
    1: {
      title: "Stage 01: L1 Provisioning & Delegation",
      desc: "Base layer PDA derivation and ownership transfer to MagicBlock Delegation Program.",
      icon: Activity,
    },
    2: {
      title: "Stage 02: Ephemeral SVM Micro-Instance",
      desc: "In-memory zero-gas compute loop inside the MagicBlock ER / Intel TDX TEE validator.",
      icon: Zap,
    },
    3: {
      title: "Stage 03: MagicIntent Bundle Commitment",
      desc: "Atomic commit-and-undelegate intent sealed by MagicIntentBundleBuilder.",
      icon: ShieldCheck,
    },
    4: {
      title: "Stage 04: Base Layer Settlement & Reversion",
      desc: "Finality confirmed on Solana Devnet L1; PDA ownership reverted to Anchor engine.",
      icon: Cpu,
    },
  };

  const currentMeta = stageTitles[stageIndex];
  const Icon = currentMeta.icon;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={currentMeta.title}
      description={currentMeta.desc}
    >
      <div className="space-y-6 pt-2">
        {/* Stage Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-obsidian-900">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-white">Verification Status</span>
          </div>
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enclave Verified
          </Badge>
        </div>

        {/* Stage Specific Fields */}
        {stageIndex === 1 && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Task PDA Address</span>
              <div className="flex items-center justify-between p-2.5 rounded bg-obsidian-900 border border-white/10">
                <span className="text-white truncate mr-2">
                  {taskPda || "Pending initialization..."}
                </span>
                {taskPda && (
                  <button
                    onClick={() => copyToClipboard(taskPda, "taskPda")}
                    className="text-muted-foreground hover:text-white"
                  >
                    {copiedKey === "taskPda" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Authority Public Key</span>
              <div className="flex items-center justify-between p-2.5 rounded bg-obsidian-900 border border-white/10">
                <span className="text-white truncate mr-2">
                  {authority || "Devnet Keypair / Connected Wallet"}
                </span>
                {authority && (
                  <button
                    onClick={() => copyToClipboard(authority, "auth")}
                    className="text-muted-foreground hover:text-white"
                  >
                    {copiedKey === "auth" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Delegation Program</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-amber-400">
                DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh
              </div>
            </div>

            {telemetry?.delegationTxSignature && (
              <div className="space-y-1">
                <span className="text-muted-foreground font-sans block">Delegation Tx Signature</span>
                <div className="flex items-center justify-between p-2.5 rounded bg-obsidian-900 border border-white/10">
                  <span className="text-amber-300 truncate mr-2">
                    {telemetry.delegationTxSignature}
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${telemetry.delegationTxSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {stageIndex === 2 && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Assigned Validator FQDN</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-cyan-300">
                {telemetry?.erEndpointUsed || "https://devnet-tee.magicblock.app"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Hardware Security Enclave</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-emerald-400">
                Intel TDX TEE (Cryptographic Memory Shielding)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10">
                <span className="text-muted-foreground font-sans block text-[11px]">Ticks Run</span>
                <span className="text-base font-bold text-white">
                  {currentIteration || telemetry?.iterationsCompleted || 0} / {totalIterations}
                </span>
              </div>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10">
                <span className="text-muted-foreground font-sans block text-[11px]">ER Loop Duration</span>
                <span className="text-base font-bold text-emerald-400">
                  {telemetry ? `${telemetry.erExecutionDurationMs.toFixed(1)}ms` : "< 15ms / tick"}
                </span>
              </div>
            </div>
          </div>
        )}

        {stageIndex === 3 && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Intent Builder Mechanism</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-cyan-300">
                MagicIntentBundleBuilder.commit_and_undelegate
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Discriminator Signature</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-zinc-300 break-all">
                [196, 28, 41, 206, 48, 37, 51, 167] (#[ephemeral] Callback)
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Teardown Duration</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-amber-300">
                {telemetry ? `${telemetry.teardownDurationMs.toFixed(1)}ms` : "Atomic commitment pending"}
              </div>
            </div>
          </div>
        )}

        {stageIndex === 4 && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">Final Settled Hash / Output</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-emerald-300 break-all">
                {computeOutput || "Hash chain output confirmed on L1"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-sans block">L1 Reversion Status</span>
              <div className="p-2.5 rounded bg-obsidian-900 border border-white/10 text-emerald-400">
                Owner Reverted: Solaxis Engine Anchor Program
              </div>
            </div>

            {telemetry?.settlementTxSignature && (
              <div className="space-y-1">
                <span className="text-muted-foreground font-sans block">L1 Settlement Signature</span>
                <div className="flex items-center justify-between p-2.5 rounded bg-obsidian-900 border border-white/10">
                  <span className="text-emerald-300 truncate mr-2">
                    {telemetry.settlementTxSignature}
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${telemetry.settlementTxSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
