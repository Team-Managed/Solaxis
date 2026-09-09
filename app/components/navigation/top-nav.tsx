"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Sun,
  Shield,
  ExternalLink,
  Copy,
  Check,
  Activity,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulseIndicator } from "@/components/solaxis/pulse-indicator";
import { WalletMultiButton } from "@/components/providers/wallet-provider";

export function TopNav() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [l1Ping, setL1Ping] = useState<number | null>(48);
  const [routerPing, setRouterPing] = useState<number | null>(12);

  // Measure or poll cluster ping and balance
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const start = performance.now();
        const slot = await connection.getSlot("processed");
        if (isMounted && slot) {
          setL1Ping(Math.round(performance.now() - start));
        }
      } catch {
        if (isMounted) setL1Ping(null);
      }

      if (connected && publicKey) {
        try {
          const bal = await connection.getBalance(publicKey);
          if (isMounted) setBalance(bal / 1e9);
        } catch {
          if (isMounted) setBalance(null);
        }
      } else {
        if (isMounted) setBalance(null);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [connection, connected, publicKey]);

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)]">
            <Sun className="h-5 w-5 text-obsidian-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                SOLAXIS
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-400 border border-amber-500/20">
                v0.1.0
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Serverless Web3 Micro-Instance Engine
            </p>
          </div>
        </div>

        {/* Network & Infrastructure Status Pills */}
        <div className="hidden md:flex items-center gap-2">
          {/* L1 Status */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-graphite-900/90 px-3 py-1 text-xs">
            <PulseIndicator
              active={l1Ping !== null}
              color={l1Ping ? "emerald" : "crimson"}
              size="sm"
            />
            <span className="text-muted-foreground">Solana Devnet</span>
            {l1Ping !== null && (
              <span className="font-mono text-[11px] text-emerald-400">
                {l1Ping}ms
              </span>
            )}
          </div>

          {/* MagicBlock TEE Enclave Status */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-graphite-900/90 px-3 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-muted-foreground">MagicBlock TEE</span>
            <span className="font-mono text-[11px] text-cyan-400">
              {routerPing}ms
            </span>
          </div>
        </div>

        {/* Action Links & Wallet Connect */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Team-Managed/Solaxis"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* Connected Balance & Address pill */}
          {connected && publicKey && (
            <div className="hidden lg:flex items-center gap-2 rounded-lg border border-white/10 bg-graphite-800/80 px-2.5 py-1 text-xs font-mono">
              <span className="text-amber-400 font-bold">
                {balance !== null ? `${balance.toFixed(2)} SOL` : "..."}
              </span>
              <span className="text-white/20">|</span>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
                title="Copy address"
              >
                <span>{truncatedAddress}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          )}

          {/* Wallet Multi Button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
