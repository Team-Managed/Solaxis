# Solaxis — UI Context

This document defines the component conventions, layout structure, and state treatments for the Solaxis Web Developer Console.

---

## Layout Structure

The Solaxis Developer Console is a unified, single-screen responsive workspace divided into 4 primary panels:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [☀️ Solaxis]    Function: batch-risk-simulator    Devnet (TEE)   [Connect] │
├─────────────────────────┬──────────────────────────────────────────────┤
│                         │                                              │
│  PANEL 1:               │  PANEL 3:                                    │
│  INVOCATION TRIGGER     │  4-STAGE LIFECYCLE PIPELINE                  │
│  • Function Selector    │  [1. Provision] ➔ [2. Running]               │
│  • Iteration Slider     │  [3. Teardown]  ➔ [4. Settled]               │
│  • Payload Config       │                                              │
│  • [🚀 RUN INSTANCE]    ├──────────────────────────────────────────────┤
│                         │                                              │
│                         │  PANEL 4:                                    │
│  PANEL 2:               │  DECENTRALIZED CLOUDWATCH TERMINAL           │
│  BENCHMARK & SAVINGS    │  > [00:00.042] [SPINUP] Delegating PDA...    │
│  • 350ms vs 25s (98%)   │  > [00:00.180] [ER-EXEC] 50 ticks in 14ms... │
│  • 0 L1 Gas for loop    │  > [00:00.340] [SETTLE] Committed to Devnet  │
│  • Explorer Proof Links │                                              │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header & Cluster Bar (`ConsoleHeader`)
- Displays the Solaxis logo and active function name.
- Network Pill: `Solana Devnet` (Green dot indicator).
- Enclave Pill: `Intel TDX TEE (devnet-tee.magicblock.app)` (Shield icon).
- Wallet Button: Multi-wallet adapter with auto-balance display (SOL).

### 2. Invocation Controller (`InvocationPanel`)
- Function Preset Picker:
  - `batch-risk-simulator` (Default: 50 compute iterations).
  - `confidential-state-hasher` (Private TEE hash loop).
  - `session-counter` (Fast state ticker).
- Iterations Input: Slider from 10 to 100 iterations.
- Primary CTA: `Run Micro-Instance` button with glowing Amber/Emerald gradient on hover. Disabled with spinning loader during execution.

### 3. 4-Stage Lifecycle Visualizer (`LifecyclePipeline`)
The centerpiece of the demo. A horizontal pipeline with 4 distinct nodes connected by animated energy tracks:
1. **Node 1: Cold Start / Provisioning**
   - Icon: `Radio` / `UploadCloud`
   - Label: `L1 Delegation`
   - Description: PDA transferred to Delegation Program.
2. **Node 2: Ephemeral SVM Active**
   - Icon: `Cpu` / `Zap`
   - Label: `TEE Micro-Instance`
   - Description: In-memory execution at <15ms block time. Live iteration counter ticking rapidly.
3. **Node 3: Teardown & Commit**
   - Icon: `Lock` / `PackageCheck`
   - Label: `MagicIntent Seal`
   - Description: `MagicIntentBundleBuilder` committing final state.
4. **Node 4: Base Settle**
   - Icon: `ShieldCheck` / `Anchor`
   - Label: `L1 Settlement`
   - Description: Account returned to parent program on Devnet.

### 4. Decentralized CloudWatch Terminal (`CloudwatchStream`)
- Mac-style window controls (three subtle dots).
- Monospace font (`Geist Mono` or `Fira Code`).
- Streams real-time timestamped JSON-RPC events:
  - Timestamp in `[MM:SS.mmm]`.
  - Color-coded log level: `[INFO]` (Cyan), `[SPINUP]` (Amber), `[ER-EXEC]` (Emerald), `[SETTLE]` (Violet).
  - Copy logs button and autoscroll toggle.

### 5. Benchmark & Proof Card (`BenchmarkProofCard`)
- **Latency Stat**: Comparison card displaying Solaxis execution time (`342ms`) vs Solana L1 sequential time (`~25,000ms`) — highlighting `98.6% Faster`.
- **Gas Stat**: `1 Settlement Tx` vs `50 L1 Txs` — highlighting `98% Gas Saved`.
- **Solana Explorer Proofs**:
  - Button 1: `View Delegation Tx ↗` (Links to `https://explorer.solana.com/tx/.../?cluster=devnet`).
  - Button 2: `View Settlement Tx ↗` (Links to final commit tx).
