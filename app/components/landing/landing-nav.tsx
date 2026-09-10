"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center group">
          <span className="text-lg font-black tracking-tight text-slate-950 font-sans hover:text-sky-600 transition-colors">
            SOLAXIS
          </span>
        </Link>

        {/* Desktop Nav Links (Matching twilight palette) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-indigo-950/80">
          <a
            href="#how-it-works"
            className="hover:text-sky-600 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#quickstart"
            className="hover:text-sky-600 transition-colors"
          >
            Quickstart
          </a>
          <a
            href="#benchmarks"
            className="hover:text-sky-600 transition-colors"
          >
            Benchmarks
          </a>
          <a
            href="#faqs"
            className="hover:text-sky-600 transition-colors"
          >
            FAQs
          </a>
          <a
            href="https://github.com/Team-Managed/Solaxis"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-sky-600 transition-colors normal-case font-semibold text-xs text-indigo-900/75"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </nav>

        {/* Right CTA Buttons (Ref: answerr reference navbar) */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#how-it-works"
            className="text-xs font-bold text-indigo-950 hover:text-sky-600 px-3 py-1.5 transition-colors"
          >
            Architecture
          </a>

          <a href="#quickstart">
            <Button className="h-9 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all hover:scale-102 gap-1.5">
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-800 hover:text-sky-600 rounded-md hover:bg-white/50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/60 bg-white/90 backdrop-blur-xl p-5 space-y-3 shadow-xl">
          <nav className="flex flex-col gap-3 text-sm font-bold text-indigo-950">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              How It Works
            </a>
            <a
              href="#quickstart"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              Quickstart
            </a>
            <a
              href="#benchmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              Benchmarks
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              FAQs
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
            <a href="#quickstart" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
