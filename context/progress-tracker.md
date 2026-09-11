# Solaxis - Progress Tracker

Update this file whenever the current phase, active unit, or implementation state changes. Progress state must reflect the actual implementation, not the intended state.

---

## Current Phase

**Phase 10: Developer Quickstart, Streamlined Landing Architecture & CLI Uniformity**

## Current Goal

Design aesthetics, developer quickstart, and observability layout have been elevated to match developer-grade standards:
- **Developer Quickstart Module (`QuickstartSection`)**: Added interactive developer get-started section with dedicated interface tabs:
  1. **Terminal CLI (`@solaxis/cli`)**: Multi-platform installer tabs:
     - **macOS & Linux**: `curl -fsSL https://solaxis.run/install.sh | bash` (or local `./install.sh`).
     - **Windows PowerShell**: `irm https://solaxis.run/install.ps1 | iex` (or local `.\install.ps1`).
     - **NPM / Global**: `npm i -g @solaxis/cli` and `npx solaxis invoke`.
  2. **TypeScript SDK (`@solaxis/sdk`)**: Direct package install (`npm i @solaxis/sdk @solana/web3.js`) and syntax-highlighted `defineFunction` + `SolaxisClient` programmatic snippet.
- **Cross-Platform Installation Scripts**:
  - Authored root `install.sh` and `install.ps1`, mirrored to `app/public/` for static delivery via web servers and GitHub raw links.
  - Automatic Node.js version detection (>= 18/20), build automation, executable wrapper generation, and shell PATH (`.zshrc`, `.bashrc`, Windows User Environment) registration.
  - Added `pnpm setup-cli` and `pnpm link-cli` scripts to root `package.json`.
- **CLI-First Execution Model (Presets Removed)**:
  - Removed generic preset functions catalog (`batch-risk-simulator`, `confidential-state-hasher`, `session-counter`) and the `workloads` catalog tab from the Web Console.
  - Positioned the **Solaxis CLI** and **TypeScript SDK** as the primary surfaces where developers author, scaffold (`solaxis new`), and execute (`solaxis invoke <function>`) their own custom functions.
  - Web Console streamlined into 3 core observability & verification panes:
    1. **Cluster Overview**: Live Intel TDX TEE status, devnet wallet reserve, Hex Cluster Topology, and Throughput Dot Matrix.
    2. **CloudWatch Terminal**: Real-time 4-stage lifecycle visualizer and monospace JSON-RPC streaming logs.
    3. **Explorer Proofs**: Verifiable on-chain settlement signatures and Solana Explorer audit links.
- All TypeScript types pass validation with 0 errors across all monorepo packages, all 70+ unit tests passing.
- Audit remediation: Anchor-compatible PDA derivation, strict L1 settlement proof handling, corrected lifecycle status codes, deterministic workspace ordering, and non-interactive app linting are implemented.
- Custom function foundation: `solaxis new` now generates a standalone Anchor/SBF program with its own program ID and lifecycle protocol; SDK invocation routes to that custom program when its manifest includes `programId`.
- Client demo routing: the Next.js app exposes `/demo`, redirecting server-side to the Render `DEMO_REDIRECT_URL` environment variable.

---

## Spec Status

All specs have been authored to match the Flank benchmark format: zero raw code blocks, exhaustive step-by-step prose instructions, strict scope boundaries, clear dependency ordering, and verifiable acceptance criteria.

### Foundation & Core Engine

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **00** | Product Map | ✅ Complete | Master architectural invariants, deployables, domain vocabulary, screens S1-S5, states, non-goals |
| **01** | Architecture and Shared Contracts | ✅ Complete | Root peer directory layout, shared network constants, Zod schemas, PDA derivation, environment validators, 31 tests passing |
| **02** | Design System and Tokens | ✅ Complete | Dark default theme, solar amber & neon emerald tokens, custom primitives without 3rd-party libs, typecheck & build passing |
| **03** | Solaxis Anchor Engine | ✅ Complete | Anchor 0.32.1 on-chain engine, TaskAccount (79 bytes), initialize, delegate CPI, execute_batch (hash chain loop), undelegate (MagicIntentBundleBuilder), 7 Rust unit tests passing |
| **04** | Delegation and Lifecycle Controller | ✅ Complete | 5-step lifecycle orchestration, MagicBlock router polling, ER sub-10ms loop, GetCommitmentSignature settlement, telemetry engine, 44 tests passing |
| **05** | Developer SDK and Custom Functions | ✅ Complete | Public `@solaxis/sdk` (`SolaxisClient`, `defineFunction`, events, deployer, scaffolder), on-chain Rust crate `solaxis-engine-sdk`, 14 SDK unit tests, 9 Rust tests passing |

### Developer Tooling & CLI

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **06** | Solaxis CLI Runner | ✅ Complete | Commander.js CLI, `new`, `deploy`, `init`, `status`, `invoke`, `vm`, `daemon`, animated Ora spinners, cli-table3 telemetry, 11 tests passing |

### Web Developer Console & Verification

| Unit | Spec | Status | Notes |
|---|---|---|---|
| **07** | Web Console App Shell | ✅ Complete | Next.js 15 App Router, Solana Wallet Adapter, 3-card function catalog, invocation controls, 12-column engineering grid |
| **08** | Live Lifecycle Visualizer | ✅ Complete | 4-stage visual pipeline, animated SVG energy tracks, live millisecond stopwatches, stage inspection drawer |
| **09** | Decentralized CloudWatch Stream | ✅ Complete | Monospace terminal, 1000-entry ring buffer, smart sticky auto-scroll, log level filters, search, JSON export |
| **10** | Benchmark and Explorer Verification | ✅ Complete | Side-by-side speedup multiplier, 99.4% gas reduction cards, verifiable Solana Explorer links, report drawer |
| **11** | Devnet E2E Verification and CI | ⏳ Pending | Mocha/Chai integration suite on Devnet + TEE, CLI e2e assertions, GitHub Actions CI workflow |

---

## Decisions Log

- **Target Network**: Solana Devnet + MagicBlock Devnet TEE Validator (`devnet-tee.magicblock.app`).
- **Control Surfaces**: TypeScript Developer SDK (`sdk`), Standalone Terminal CLI (`cli`), and Web3 Developer Console (`app`).
- **SDK Strategy**: Full Developer Platform. Public TypeScript SDK (`@solaxis/sdk`) for client applications and custom function definition/invocation; Rust Anchor crate (`solaxis-engine-sdk`) for authoring on-chain compute kernels; and CLI scaffolding (`solaxis new/deploy`). Internal contracts reside in `shared`.
- **Anchor Invariant**: Mandatory `#[ephemeral]` macro immediately preceding `#[program]` to inject undelegation callback processor (discriminator `[196, 28, 41, 206, 48, 37, 51, 167]`).
- **Settlement Invariant**: Exclusively use `MagicIntentBundleBuilder.commit_and_undelegate` for atomic state commitment and PDA ownership reversion to L1.
- **Spec Format**: Strictly following Flank format: zero code dumps, exhaustive numbered steps in natural technical prose, explicit file boundaries, scope limits, and verifiable checklist.
