"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Layers,
  Terminal as TerminalIcon,
  ShieldCheck,
  Search,
  ArrowLeft,
  Sun,
  Shield,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/providers/wallet-provider";
import { cn } from "@/lib/utils";

export type ConsoleTab =
  | "overview"
  | "terminal"
  | "proofs";

interface ConsoleSidebarProps {
  activeTab: ConsoleTab;
  onSelectTab: (tab: ConsoleTab) => void;
  isExecuting?: boolean;
  logCount?: number;
}

export function ConsoleSidebar({
  activeTab,
  onSelectTab,
  isExecuting = false,
  logCount = 0,
}: ConsoleSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { connected, publicKey } = useWallet();

  const panes = [
    {
      id: "overview" as ConsoleTab,
      label: "Cluster Overview",
      icon: LayoutGrid,
      badge: null,
      description: "Telemetry & Topology",
    },
    {
      id: "terminal" as ConsoleTab,
      label: "CloudWatch Terminal",
      icon: TerminalIcon,
      badge: logCount > 0 ? `${logCount} logs` : null,
      badgeVariant: isExecuting ? "running" : "default",
      description: "JSON-RPC Stream",
    },
    {
      id: "proofs" as ConsoleTab,
      label: "Explorer Proofs",
      icon: ShieldCheck,
      badge: null,
      badgeVariant: "default",
      description: "Solana Devnet Audit",
    },
  ];

  const filteredPanes = panes.filter(
    (pane) =>
      pane.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pane.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:overflow-y-auto p-4 select-none z-30">
      <div className="space-y-4">
        {/* Workspace Brand with Link Back to Landing (Zero Logo Box, Minimalist) */}
        <div className="border-b border-slate-100 pb-3">
          <Link
            href="/"
            className="group flex items-center justify-between w-full hover:opacity-85 transition-opacity"
            title="Return to Solaxis Landing Page"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-widest text-slate-900 leading-tight font-sans">
                  SOLAXIS
                </span>
                <ArrowLeft className="h-3 w-3 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Devnet TEE Cluster
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-slate-700 transition-colors">
              ↗
            </span>
          </Link>
        </div>

        {/* Search Bar with Keyboard Shortcut */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search panes..."
            className="w-full h-8 pl-8 pr-7 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all font-medium"
          />
          <span className="absolute right-2.5 top-2 rounded bg-slate-200/70 px-1 py-0.2 text-[9px] font-mono text-slate-600">
            /
          </span>
        </div>

        {/* Console Panes Navigation */}
        <nav className="space-y-1 text-xs font-medium">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace Panes
          </div>

          {filteredPanes.map((pane) => {
            const Icon = pane.icon;
            const isActive = activeTab === pane.id;

            return (
              <button
                key={pane.id}
                type="button"
                onClick={() => onSelectTab(pane.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-left",
                  isActive
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "text-slate-400"
                    )}
                  />
                  <div className="truncate">
                    <span className="truncate block">{pane.label}</span>
                  </div>
                </div>

                {pane.badge && (
                  <span
                    className={cn(
                      "shrink-0 ml-2 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight",
                      isActive
                        ? "bg-slate-800 text-slate-200 border border-slate-700"
                        : pane.badgeVariant === "running"
                        ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    )}
                  >
                    {pane.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Wallet Connect in Sidebar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Devnet Wallet</span>
            <span className="font-mono text-[9px] text-slate-500">
              {connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "Disconnected"}
            </span>
          </div>
          <div className="[&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:h-8 [&_.wallet-adapter-button]:text-xs [&_.wallet-adapter-button]:rounded-md [&_.wallet-adapter-button]:font-semibold [&_.wallet-adapter-button]:bg-slate-100 [&_.wallet-adapter-button]:hover:bg-slate-200 [&_.wallet-adapter-button]:text-slate-800 [&_.wallet-adapter-button]:border [&_.wallet-adapter-button]:border-slate-200 [&_.wallet-adapter-button]:justify-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {/* Cluster Infrastructure Card */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                TEE Enclave
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">
              Operational
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-sans text-[10px]">Network</span>
              <span className="text-slate-800 font-semibold">Devnet L1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-sans text-[10px]">Router</span>
              <span className="text-slate-800 font-semibold truncate max-w-[110px]" title="devnet-router.magicblock.app">
                MagicBlock ER
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-sans text-[10px]">Hardware</span>
              <span className="text-slate-800 font-semibold">Intel TDX</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>Solana Explorer</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <span className="text-slate-600 font-mono">Anchor 0.30+</span>
          </div>
        </div>

        {/* Appearance & Cluster Status Footer */}
        <div className="flex items-center justify-between px-1 text-slate-500 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5 text-slate-500" />
            <span>Light Theme</span>
          </div>
          <span className="font-mono text-[10px] text-slate-600">
            v0.3.0
          </span>
        </div>
      </div>
    </aside>
  );
}
