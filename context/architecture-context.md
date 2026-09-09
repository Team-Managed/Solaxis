# Solaxis — Architecture Context

## Stack

| Layer | Technology | Role |
|---|---|---|
| **On-Chain Smart Contract** | Anchor 0.30+ / Rust / Solana SBF | Program logic, state storage, delegation hooks, compute loops |
| **Rollup Infrastructure** | MagicBlock Ephemeral Rollup (ER / PER) | Low-latency off-chain execution, zero-gas transactions |
| **Rollup SDK** | `ephemeral-rollups-sdk` (Rust crate) | Macros (`#[ephemeral]`, `#[delegate]`), `MagicIntentBundleBuilder` |
| **Client Rollup SDK** | `@magicblock-labs/ephemeral-rollups-sdk` | TypeScript router connection, delegation queries, ER RPC clients |
| **App Framework** | Next.js 15 (App Router) + TypeScript | Developer Console, Server-Sent Events, BFF handlers |
| **Styling** | Tailwind CSS + Custom Design Tokens | Dense dark UI, futuristic telemetry animations, solar gradients |
| **CLI Runtime** | Node.js / Commander / Chalk / Ora | Standalone terminal utility (`solaxis`) |
| **Solana RPC** | `@solana/web3.js` / Anza Devnet RPC | Base-layer transaction submission, account verification |
| **Monorepo Layout** | pnpm workspaces | `packages/contracts`, `packages/sdk`, `packages/cli`, `packages/app`, `packages/shared` |

---

## Deployables & Boundaries

Solaxis is organized as a unified monorepo with distinct packages:

1. **`packages/contracts`**:
   - The Solana Anchor program (`solaxis_engine`) and reusable on-chain Rust crate (`solaxis-engine-sdk`).
   - Owns the on-chain state machine, PDA derivations, delegation CPI, undelegation processors, and traits for custom developer compute.
   - Deploys directly to Solana Devnet via Anchor CLI.
2. **`packages/sdk`**:
   - Public TypeScript Developer SDK (`@solaxis/sdk`).
   - Exposes `SolaxisClient`, `defineFunction`, lifecycle event hooks, and direct MagicBlock ER/TEE orchestration for external dApps and scripts.
3. **`packages/cli`**:
   - Standalone Node.js CLI executable (`solaxis`).
   - Project scaffolding (`solaxis new`), function deployment (`solaxis deploy`), keypair management, router discovery, and terminal execution.
4. **`packages/app`**:
   - Next.js Web3 Developer Console.
   - Houses the visual interface, wallet adapter, live 4-stage lifecycle visualizer, streaming log terminal, and benchmark cards.
5. **`packages/shared`**:
   - Internal protocol contracts, canonical Zod schemas, network constants, PDA helpers, and environment validators.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Web3 Developer Console (packages/app)                │
│   • Next.js App Router + Tailwind CSS                                  │
│   • Wallet Adapter (Phantom, Solflare, Local Keypair)                  │
│   • Live Lifecycle Pipeline Visualizer + CloudWatch Log Terminal       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 TypeScript Developer SDK (packages/sdk)                │
│   • SolaxisClient + defineFunction + Lifecycle Event Stream            │
│   • Consumed by packages/cli, packages/app, and external developers    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Solaxis CLI (packages/cli)                        │
│   • Scaffolding (`solaxis new`), deploy, run, and benchmark            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          │                                                 │
          ▼                                                 ▼
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│   Solana Base Layer (Devnet L1)   │     │      MagicBlock Router & TEE      │
│   • RPC: api.devnet.solana.com    │     │   • Router: devnet-router         │
│   • Program: solaxis_engine       │     │   • Validator: devnet-tee         │
│   • State: Task PDA               │     │   • Sub-10ms SVM execution        │
│   • Delegation Program            │     │   • MagicIntentBundleBuilder      │
└───────────────────────────────────┘     └───────────────────────────────────┘
```

---

## MagicBlock Protocol Invariants

The following invariants are mechanically enforced across all Solaxis implementations:

1. **Macro Placement**: The `#[ephemeral]` macro MUST be placed immediately before `#[program]` on the Anchor program module. This injects the undelegation callback processor (discriminator `[196, 28, 41, 206, 48, 37, 51, 167]`) that the Delegation Program CPIs into on L1 settlement.
2. **Delegation Invariant**:
   - On Solana Base Layer: When delegated, `task_pda.owner == DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`.
   - On Ephemeral Rollup: `task_pda.owner == solaxis_engine.programId` with `delegated == true`.
   - On Settlement: `task_pda.owner == solaxis_engine.programId` on Base Layer.
3. **Modern Intent Builder**: Use `MagicIntentBundleBuilder` exclusively. Never use deprecated free functions `commit_accounts` or `commit_and_undelegate_accounts`.
4. **Router Discovery**: Clients never hardcode static regional ER endpoints for delegated transactions; they always query `router.getDelegationStatus(task_pda)` to retrieve the active FQDN.
5. **No Dangling Delegations**: Every invocation must have an explicit settlement path. If execution fails on the ER, an automatic recovery undelegation intent commits the last valid state and unlocks the account on L1.

---

## Validator Endpoints

| Environment | Service | Endpoint URL | Validator Identity |
|---|---|---|---|
| **Devnet** | Base Solana RPC | `https://api.devnet.solana.com` | N/A |
| **Devnet** | MagicBlock Router | `https://devnet-router.magicblock.app` | N/A |
| **Devnet** | TEE Validator | `https://devnet-tee.magicblock.app` | `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo` |
| **Devnet** | Asia Validator | `https://devnet-as.magicblock.app` | `MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57` |
| **Localnet** | Local ER Node | `http://localhost:7799` | `mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev` |
