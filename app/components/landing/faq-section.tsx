"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "What is an Ephemeral Rollup, and how is it different from a traditional L2?",
      answer:
        "Traditional L2s are permanent, separate blockchains that require liquidity bridges, separate wallets, and centralized sequencers. An Ephemeral Rollup (ER) is an on-demand, temporary execution sandbox powered by MagicBlock. It spins up directly around a delegated Solana state account (PDA), processes high-speed compute in memory at sub-10ms ticks, and atomically settles the final state back to Solana L1 upon completion, dismantling the rollup instance.",
    },
    {
      question: "Why use Solaxis instead of centralized cloud functions like AWS Lambda?",
      answer:
        "AWS Lambda forces Web3 applications back into centralized Web2 cloud infrastructure, introducing vendor lock-in, centralized key custody, and opaque execution. Solaxis provides the exact same serverless micro-instance DX—spin-up, execute, teardown—without AWS, running inside decentralized Ephemeral Rollups and cryptographically attested Intel TDX TEE hardware enclaves.",
    },
    {
      question: "How does Solaxis prevent accounts or funds from being locked (dangling delegations)?",
      answer:
        "Solaxis enforces an architectural invariant: every Anchor program includes the #[ephemeral] macro, injecting the mandatory undelegation callback processor (discriminator [196, 28, 41, 206, 48, 37, 51, 167]). Additionally, the Solaxis LifecycleController implements automatic fault recovery: if an execution drops or errors midway, a recovery undelegation transaction seals the last valid state and restores PDA ownership back to L1.",
    },
    {
      question: "What kind of workloads can be executed in a Solaxis micro-instance?",
      answer:
        "Any computation compiled to native Solana SBF bytecode via Anchor or orchestrated through @solaxis/sdk. Ideal workloads include DeFi Monte Carlo risk simulations, high-frequency limit orderbook batch matching, fully on-chain PvP game sessions, confidential DAO voting tallies, and DePIN sensor telemetry compression.",
    },
    {
      question: "How does Intel TDX hardware confidentiality prevent data spoofing in DePIN?",
      answer:
        "Private Ephemeral Rollups (PER) run inside Intel TDX Trusted Execution Environments (TEE). In an enclave, CPU hardware cryptographically encrypts execution memory with ephemeral keys. Neither cloud host administrators, operating systems, nor validator node operators can read or tamper with the telemetry data while it is computing.",
    },
    {
      question: "Can I run a persistent micro-instance on my own edge hardware?",
      answer:
        "Yes! Using the solaxis daemon command (or solaxis serve), you can launch a persistent sovereign micro-instance on any local machine or IoT gateway. It runs continuous compute ticks in a TEE enclave and exposes a local HTTP REST API on port 8080 (/health, /metrics, /state) for local applications to query.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-950">
            Everything You Need to Know About Solaxis
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Deep technical answers on Ephemeral Rollups, TEE enclaves, and state safety invariants.
          </p>
        </div>

        {/* FAQ Frosted Accordion */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="frosted-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 sm:px-8 flex items-center justify-between text-left font-bold text-slate-900 hover:text-rose-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-rose-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-1 text-sm text-slate-700 leading-relaxed border-t border-white/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
