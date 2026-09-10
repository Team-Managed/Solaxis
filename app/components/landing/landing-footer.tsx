"use client";

import React from "react";
import Link from "next/link";
import { Sun, ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative mt-16 border-t border-slate-300/80 py-16 text-sm text-slate-800 overflow-hidden">
      {/* Twilight Sunset Background Image from Hero - Rich & Clearly Visible */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <img
          src="/image.png"
          alt="Solaxis Twilight Sunset Cloudscape"
          className="w-full h-full object-cover object-center filter saturate-[1.35] brightness-[1.02] opacity-80"
        />
        {/* Soft translucent veil to balance text legibility and rich sunset color */}
        <div className="absolute inset-0 bg-white/35 backdrop-blur-xs" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-300/70">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                SOLAXIS
              </span>
            </Link>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              The Sovereign Serverless Web3 Micro-Instance Engine for Solana. Sub-10ms compute loops in Ephemeral Rollups and Intel TDX TEE enclaves.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-900 font-bold">
              <span className="h-1.5 w-1.5 rounded-xs bg-emerald-600" />
              <span>Solana Devnet Enclave Verified</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-800">
              <li>
                <Link href="/console" className="hover:text-rose-600 transition-colors">
                  Web Developer Console
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-rose-600 transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-rose-600 transition-colors">
                  4-Stage Pipeline
                </a>
              </li>
              <li>
                <a href="#benchmarks" className="hover:text-rose-600 transition-colors">
                  Performance Benchmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-mono">
              Developers
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-800">
              <li>
                <a
                  href="https://github.com/Team-Managed/Solaxis"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  GitHub Repository <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Team-Managed/Solaxis/blob/main/docs/DEMO_VIDEO_SCRIPT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  Demo Video Script <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.magicblock.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  MagicBlock ER Docs <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-mono">
              Sovereignty
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-800">
              <li>
                <span>Zero AWS Dependencies</span>
              </li>
              <li>
                <span>Intel TDX TEE Enclave</span>
              </li>
              <li>
                <span>MagicIntentBundleBuilder</span>
              </li>
              <li>
                <span>Anti-Dangling PDA Recovery</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700 font-medium">
          <div>
            © {new Date().getFullYear()} Solaxis Engine. Distributed under the MIT License.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-950 font-semibold transition-colors"
            >
              Solana Devnet Explorer
            </a>
            <span>•</span>
            <a
              href="https://github.com/Team-Managed/Solaxis"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-950 font-semibold transition-colors"
            >
              Open Source (MIT)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
