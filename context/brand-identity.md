# Solaxis — Brand Identity

This document defines the core visual language, color palette, and brand aesthetics for Solaxis.

---

## Core Theme

Solaxis operates on a strict **Dark Default** theme. The visual aesthetic draws inspiration from high-end aerospace interfaces, solar phenomena, and deep-space telemetry consoles (Vercel, Linear, Raycast, and Starlink).

The canvas is anchored in deep charcoal blacks, subtle low-opacity borders, and glowing amber/cyan/emerald accents that visually track the transition of compute from Solana L1 into the ephemeral stratosphere.

---

## Brand Accents & State Colors

### 1. Solaxis Primary: Solar Amber / Gold
Evokes the solar energy of Solana and high-speed compute power.
- **Hex**: `#F59E0B` (Amber-500) / `#FBBF24` (Amber-400)
- **CSS**: `rgb(245 158 11)`
- **Role**: Primary brand glow, logo marks, and **Stage 1 (Provisioning / Delegation)** status.

### 2. Ephemeral Active: Neon Emerald / Cyan
Evokes high-speed, zero-resistance in-memory execution inside the TEE enclave.
- **Hex**: `#10B981` (Emerald-500) / `#06B6D4` (Cyan-500)
- **CSS**: `rgb(16 185 129)` / `rgb(6 182 212)`
- **Role**: Active telemetry ticker, **Stage 2 (Running in ER)** status, and sub-10ms latency indicators.

### 3. Settlement: Electric Violet / Blue
Evokes cryptographic proof, `MagicIntentBundleBuilder` sealing, and L1 atomic settlement.
- **Hex**: `#8B5CF6` (Violet-500) / `#3B82F6` (Blue-500)
- **CSS**: `rgb(139 92 246)`
- **Role**: **Stage 3 (Teardown / Commit)** and **Stage 4 (Settled)** badges.

---

## Status Indicators Matrix

| State | Label | Color | Glow Animation |
|---|---|---|---|
| **Idle** | `IDLE` | Zinc-500 (`#71717A`) | Static |
| **Stage 1** | `PROVISIONING` | Amber-400 (`#FBBF24`) | Pulse (1.5s ease-in-out) |
| **Stage 2** | `RUNNING (ER)` | Emerald-400 (`#34D399`) | Rapid Ping / Glow |
| **Stage 3** | `TEARING_DOWN` | Cyan-400 (`#22D3EE`) | Spin / Shimmer |
| **Stage 4** | `SETTLED` | Emerald-500 (`#10B981`) | Solid Bright Border |

---

## Typography

- **Headlines & Brand**: Inter / Geist Sans (Tight tracking `-0.02em`, medium/semibold weight).
- **Body & UI**: Inter / Geist Sans.
- **Telemetry, Code & Logs**: Geist Mono / JetBrains Mono (Tabular numerals enabled for millisecond counters and transaction hashes).

---

## UI Canvas & Micro-Animations

- **Ambient Solar Glow**: Subtle radial background gradient (`radial-gradient(ellipse at top, rgba(245, 158, 11, 0.08) 0%, transparent 60%)`).
- **Telemetry Rails**: 1px subtle borders with `rgba(255, 255, 255, 0.08)` that illuminate when active.
- **Log Strip**: Terminal container with scanline aesthetic, monospaced font, and automatic smooth autoscroll.
