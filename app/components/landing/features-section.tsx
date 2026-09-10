"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Zap,
  Coins,
  ShieldCheck,
  RotateCcw,
  Terminal,
  Radio,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  microStat: string;
  accentColor: string;
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Palette harmoniously balanced with the hero twilight sky: Blue, Green, and Sunset Rose
  const features: FeatureItem[] = [
    {
      icon: <Zap className="h-6 w-6 text-emerald-600" />,
      title: "Sub-10ms SVM Execution",
      description:
        "Execute high-frequency compute loops in-memory inside dedicated Ephemeral Rollups at ~65x the speed of standard 400ms Solana L1 slots.",
      badge: "< 10ms Ticks",
      microStat: "⚡ 8.4ms / tick",
      accentColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      icon: <Coins className="h-6 w-6 text-teal-600" />,
      title: "Zero Base-Layer Gas Fees",
      description:
        "Run 50 to 200 compute iterations inside the micro-instance consuming 0 Lamports in gas, saving over 99.4% in fees compared to repeated L1 transactions.",
      badge: "0 Gas in ER",
      microStat: "0 Lamports Gas",
      accentColor: "rgba(20, 184, 166, 0.12)",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
      title: "Intel TDX Hardware TEE Enclaves",
      description:
        "Private Ephemeral Rollups execute within hardware-isolated Trusted Execution Environments (TEE). State memory is cryptographically shielded from host nodes and MEV searchers.",
      badge: "Confidential TEE",
      microStat: "TDX Enclave Locked",
      accentColor: "rgba(99, 102, 241, 0.12)",
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-rose-600" />,
      title: "Atomic L1 Settlement",
      description:
        "Using MagicIntentBundleBuilder, final state changes commit to Solana L1 in a single transaction while PDA ownership reverts cleanly back to your Anchor program.",
      badge: "Atomic Commit",
      microStat: "Atomic L1 Commit",
      accentColor: "rgba(225, 29, 72, 0.12)",
    },
    {
      icon: <Terminal className="h-6 w-6 text-sky-600" />,
      title: "Turnkey Developer CLI & SDK",
      description:
        "Author custom micro-instance functions in TypeScript with @solaxis/sdk (defineFunction) and Anchor Rust compute kernels (solaxis-engine-sdk), complete with scaffolding and deploy.",
      badge: "CLI + SDK",
      microStat: "v0.3.0 Ready",
      accentColor: "rgba(14, 165, 233, 0.12)",
    },
    {
      icon: <Radio className="h-6 w-6 text-emerald-600" />,
      title: "Edge & DePIN Persistent Daemons",
      description:
        "Deploy persistent micro-instance daemons (solaxis daemon) directly on IoT hardware, edge gateways, or local devices with built-in REST endpoints for real-time telemetry ingestion.",
      badge: "DePIN Ready",
      microStat: "Active Beacon",
      accentColor: "rgba(16, 185, 129, 0.12)",
    },
  ];

  // GSAP Scroll Entrance Animation
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header subtle lift & reveal
      gsap.from(".features-header > *", {
        opacity: 0,
        y: 25,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Cards staggered 3D entrance
      gsap.from(".feature-card-item", {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Handle 3D Tilt and Spotlight on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = cardsRef.current[idx];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    gsap.to(card, {
      rotateX,
      rotateY,
      y: -4,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 800,
    });

    // Update cursor spotlight position
    const glowEl = card.querySelector(".card-spotlight-glow") as HTMLElement;
    if (glowEl) {
      glowEl.style.opacity = "1";
      glowEl.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(56, 189, 248, 0.08), transparent 70%)`;
    }
  };

  const handleMouseLeave = (idx: number) => {
    const card = cardsRef.current[idx];
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    const glowEl = card.querySelector(".card-spotlight-glow") as HTMLElement;
    if (glowEl) {
      glowEl.style.opacity = "0";
    }
    setHoveredIdx(null);
  };

  return (
    <section ref={sectionRef} id="features" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="features-header text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
            Architecture Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-950">
            Engineered for High-Frequency, Confidential Web3 Compute
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Everything you need to spin up on-demand serverless micro-instances directly from Solana state accounts without centralized cloud dependencies.
          </p>
        </div>

        {/* 6 Features Frosted Grid with GSAP Tilt & Spotlight */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              onMouseMove={(e) => handleMouseMove(e, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              style={{ transformStyle: "preserve-3d" }}
              className="feature-card-item relative frosted-card p-7 sm:p-8 flex flex-col justify-between cursor-default transition-shadow duration-300 hover:shadow-xl hover:border-slate-300 overflow-hidden"
            >
              {/* Dynamic Mouse Spotlight Glow */}
              <div
                className="card-spotlight-glow absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
                style={{ zIndex: 0 }}
              />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs transition-transform duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>

                  {/* Micro Live Stat Tag */}
                  <span className="text-[11px] font-mono font-medium text-slate-500">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline justify-between">
                  <span>{feature.title}</span>
                </h3>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {feature.description}
                </p>

                {/* Micro Metric Telemetry Tag */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    {feature.microStat}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors relative z-10">
                <div className="flex items-center group">
                  <span className="hover:text-sky-600 transition-colors">Explore Architecture</span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 ml-1 transition-transform duration-200 ${
                      hoveredIdx === idx ? "translate-x-1.5 text-sky-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
