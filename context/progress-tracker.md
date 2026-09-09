# Solaxis - Progress Tracker

Update this file whenever the current phase, active unit, or implementation state changes. Progress state must reflect the actual implementation, not the intended state.

---

## Current Phase

**Phase 3: Core Anchor Engine & Workspace Restructuring Complete — Ready for Lifecycle Controller & Design System**

## Current Goal

Unit 01 and Unit 03 implementations verified and complete. Monorepo restructured to root peer directories (`contracts/`, `sdk/`, `cli/`, `app/`, `shared/`). Ready to proceed to Unit 02 (Design System and Tokens) and Unit 04 (Delegation and Lifecycle Controller).

---

## Spec Status

All specs have been authored to match the Flank benchmark format: zero raw code blocks, exhaustive step-by-step prose instructions, strict scope boundaries, clear dependency ordering, and verifiable acceptance criteria.

### Foundation & Core Engine

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **00** | Product Map | ✅ Complete | Master architectural invariants, deployables, domain vocabulary, screens S1-S5, states, non-goals |
| **01** | Architecture and Shared Contracts | ✅ Complete | Root peer directory layout, shared network constants, Zod schemas, PDA derivation, environment validators, 31 tests passing |
| **02** | Design System and Tokens | ⏳ Pending | Dark default theme, solar amber & neon emerald tokens, custom primitives without 3rd-party libs |
| **03** | Solaxis Anchor Engine | ✅ Complete | Anchor 0.32.1 on-chain engine, TaskAccount (79 bytes), initialize, delegate CPI, execute_batch (hash chain loop), undelegate (MagicIntentBundleBuilder), 7 Rust unit tests passing |
| **04** | Delegation and Lifecycle Controller | ⏳ Pending | 5-step lifecycle orchestration, router polling, ER connection, telemetry calculation |
| **05** | Developer SDK and Custom Functions | ⏳ Pending | Public `@solaxis/sdk` (`SolaxisClient`, `defineFunction`, events), on-chain Rust crate `solaxis-engine-sdk`, project scaffolding |

### Developer Tooling & CLI

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **06** | Solaxis CLI Runner | ⏳ Pending | Commander.js CLI, `new`, `deploy`, `init`, `status`, `invoke`, animated spinners, ASCII tables, exit codes |

### Web Developer Console & Verification

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **07** | Web Console App Shell | ⏳ Pending | Next.js 15 App Router, Solana Wallet Adapter, function catalog, invocation controls |
| **08** | Live Lifecycle Visualizer | ⏳ Pending | 4-stage visual pipeline, animated SVG energy tracks, live millisecond timers, inspect drawer |
| **09** | Decentralized CloudWatch Stream | ⏳ Pending | Monospace terminal, ring buffer, log levels, auto-scroll pinning, search & export |
| **10** | Benchmark and Explorer Verification | ⏳ Pending | Side-by-side cost/latency cards, speedup & gas-saved badges, verifiable Solana Explorer links |
| **11** | Devnet E2E Verification and CI | ⏳ Pending | Mocha/Chai integration suite on Devnet + TEE, CLI e2e assertions, GitHub Actions CI workflow |

---

## Decisions Log

- **Target Network**: Solana Devnet + MagicBlock Devnet TEE Validator (`devnet-tee.magicblock.app`).
- **Control Surfaces**: TypeScript Developer SDK (`sdk`), Standalone Terminal CLI (`cli`), and Web3 Developer Console (`app`).
- **SDK Strategy**: Full Developer Platform. Public TypeScript SDK (`@solaxis/sdk`) for client applications and custom function definition/invocation; Rust Anchor crate (`solaxis-engine-sdk`) for authoring on-chain compute kernels; and CLI scaffolding (`solaxis new/deploy`). Internal contracts reside in `shared`.
- **Anchor Invariant**: Mandatory `#[ephemeral]` macro immediately preceding `#[program]` to inject undelegation callback processor (discriminator `[196, 28, 41, 206, 48, 37, 51, 167]`).
- **Settlement Invariant**: Exclusively use `MagicIntentBundleBuilder.commit_and_undelegate` for atomic state commitment and PDA ownership reversion to L1.
- **Spec Format**: Strictly following Flank format: zero code dumps, exhaustive numbered steps in natural technical prose, explicit file boundaries, scope limits, and verifiable checklist.
