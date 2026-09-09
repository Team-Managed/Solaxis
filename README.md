# Solaxis

> **The Sovereign Serverless Micro-Instance Engine for Solana.**  
> Execute zero-gas, sub-10ms compute loops offloaded from Solana L1 into Ephemeral Rollups (ER) and Private Ephemeral Rollups (PER inside Intel TDX TEE enclaves) — with atomic on-chain settlement.

[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana&logoColor=white)](https://explorer.solana.com/?cluster=devnet)
[![MagicBlock](https://img.shields.io/badge/MagicBlock-ER%20SDK%20v0.16.2-5D5FEF?style=flat-square)](https://docs.magicblock.gg)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-black?style=flat-square&logo=rust)](https://www.anchor-lang.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## Overview

Traditional cloud serverless (e.g. AWS Lambda) forces Web3 apps onto centralized infrastructure, introducing vendor lock-in, centralized custody, and opaque execution. Running compute loops directly on Solana L1 is cost-prohibitive (~5,000 lamports per tx) and constrained by 400ms block times.

**Solaxis turns Solana state accounts (PDAs) into on-demand serverless micro-instances:**
- **Spin-up**: A state PDA is delegated from Solana L1 to the MagicBlock Delegation Program.
- **Execute**: High-frequency compute loops execute inside an Ephemeral Rollup (ER) or Private Ephemeral Rollup (PER inside an Intel TDX TEE enclave) at **sub-10ms block times with zero gas fees**.
- **Settle**: The final state commits atomically back to Solana Base Layer L1 via `MagicIntentBundleBuilder`, reverting account ownership with cryptographic finality.

---

## Key Highlights

- **Sub-10ms Execution**: Execute rapid state mutations (~65x faster than Solana L1 block times).
- **Zero-Gas Compute**: 0 Lamports consumed per execution iteration inside the rollup.
- **Confidential Compute**: Hardware-isolated execution via Private Ephemeral Rollups (PER inside Intel TDX TEE enclaves).
- **Atomic Settlement**: Sealed state commits to L1 in a single transaction with automatic ownership reversion.
- **Dual Interfaces**: Standalone developer CLI (`solaxis`) and a real-time Web3 Developer Console.

---

## How It Works

```mermaid
flowchart LR
    L1["Solana L1\n(Task PDA)"] -->|Delegate| Router["Magic Router\n(Discovery)"]
    Router -->|Route| Rollup["Ephemeral Micro-VM\n(Sub-10ms / Zero Gas)"]
    Rollup -->|Commit & Undelegate| L1Settle["Solana L1\n(Settled State)"]
```

---

## Performance Benchmark

| Metric | Solaxis Ephemeral Micro-VM | Traditional Solana L1 |
|---|---|---|
| **Iteration Latency** | **< 10ms** | 400 – 800ms slot confirmation |
| **Compute Gas Fee** | **0 Lamports** | ~5,000 Lamports per transaction |
| **50-Iteration Duration** | **~350ms** | ~25 – 40 seconds |
| **Settlement Cost** | **300k Lamports** (flat session fee) | 250k – 1M+ Lamports cumulative |
| **Gas Savings** | **> 99%** | Baseline |

---

## Repository Structure

```
packages/
├── contracts/    # Anchor smart contract (solaxis-engine) with #[ephemeral] & #[delegate]
├── shared/       # Canonical Zod schemas, TypeScript types, constants & LifecycleController
├── cli/          # Standalone developer CLI (solaxis init / status / invoke)
└── app/          # Next.js 15 Web3 Developer Console (Visualizer & CloudWatch stream)
```

---

## Quickstart

### Prerequisites

- **Node.js**: `>= 20.x` with `pnpm` installed (`npm i -g pnpm`)
- **Rust Toolchain**: `rustc >= 1.79` (`1.89+` / `1.91+` supported)
- **Solana CLI**: `>= 1.18` configured to Devnet
- **Anchor CLI**: `anchor 0.30.1`
*(Note: On Windows, Solana CLI, Rust, and Anchor run via WSL).*

### Installation

```bash
git clone https://github.com/Team-Managed/Solaxis.git
cd Solaxis
pnpm install
```

### Environment Configuration

```bash
cp .env.example .env
```

### Build and Run

```bash
# Build the Anchor smart contract
cd packages/contracts && anchor build && cd ../..

# Run the standalone CLI
pnpm --filter cli solaxis invoke --iterations 50

# Launch the Web Developer Console
pnpm --filter app dev
```

---

## License

Distributed under the [MIT License](LICENSE).
