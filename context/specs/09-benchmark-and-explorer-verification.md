Read `00-product-map.md` before starting.
Also read `04-delegation-and-lifecycle-controller.md`, `06-web-console-app-shell.md`, `07-live-lifecycle-visualizer.md`, and `08-decentralized-cloudwatch-stream.md`.

Build the Benchmark & Explorer Verification panel in `packages/app`. Render side-by-side cost and latency comparison analytics (Solaxis Ephemeral Rollup vs Traditional Solana L1) and verifiable Solana Explorer transaction proof links. Leave CI workflows to unit 10.

## Implementation

1. Create the benchmark card container at `packages/app/components/benchmark/benchmark-card.tsx`.
   - Render a card header: "Performance & Cost Analytics" with a summary badge "Verifiable Proof".
   - Structure two primary analytical sections: the Side-by-Side Benchmark Grid and the Solana Explorer Verification Panel.
   - Display an empty placeholder state when no invocation has been completed, encouraging the user to launch a function.
2. Implement the Side-by-Side Benchmark Grid in `packages/app/components/benchmark/comparison-grid.tsx`:
   - **Metric 1: Execution Latency**:
     - Solaxis column: Displays average latency per iteration inside the Ephemeral Rollup (e.g. `8.4ms`) with neon emerald styling.
     - Traditional Solana L1 column: Displays standard slot confirmation time (`400 - 800ms`) with muted slate styling.
     - Speedup multiplier pill: Calculates and displays the relative speedup (e.g. `~65x Faster`).
   - **Metric 2: Transaction & Gas Fees**:
     - Solaxis column: Displays `0 Lamports` for all compute iterations executed inside the rollup (with a fixed 300,000 lamport delegation session cleanup fee at undelegation, and 0 commit fee for single-session micro-instances).
     - Traditional Solana L1 column: Calculates estimated cumulative L1 fees (iterations multiplied by 5,000 lamports base fee).
     - Gas Saved percentage badge: Displays highlighted green badge (e.g. `99.4% Gas Reduction`).
   - **Metric 3: Throughput**:
     - Solaxis column: Displays sustained compute iterations per second.
     - L1 column: Displays theoretical maximum sequential transactions per slot.
3. Implement the Explorer Verification Panel in `packages/app/components/benchmark/explorer-panel.tsx`:
   - Render two verifiable proof cards for on-chain auditability:
     1. **L1 Delegation Proof**: Displays the transaction signature that transferred Task PDA ownership to the Delegation Program on Solana Devnet L1. Includes a clickable link opening the transaction in Solana Explorer with the `?cluster=devnet` query parameter.
     2. **L1 Settlement Proof**: Displays the transaction signature that atomically committed the final state and undelegated the account back to the Solaxis program on L1. Includes a clickable Solana Explorer link.
   - Provide one-click copy buttons for both transaction signatures.
   - Include a verified badge showing that the PDA ownership successfully returned to the user's authority and `solaxis_engine`.
4. Create an Execution Summary Drawer in `packages/app/components/benchmark/summary-drawer.tsx`.
   - Provide an action button: "View Full Execution Report".
   - Opens a slide-out drawer containing a complete breakdown of all phases: Task ID, authority pubkey, start/end timestamps, exact milliseconds for spin-up, compute, and teardown, total iterations, final compute output, and explorer links.
   - Include an "Export JSON" button downloading the complete `TelemetryMetrics` payload.
5. Create a shareable execution card generator:
   - Provide a "Share Proof" action that copies a pre-formatted markdown snippet or link containing the task ID, latency benchmark, gas saved percentage, and explorer links for easy sharing.

## Scope Limits

- Do not hardcode fictitious benchmark numbers; all figures must derive directly from the `TelemetryMetrics` object calculated from real execution.
- Do not link to external non-Solana explorers.
- Do not render the benchmark card in an active state prior to successful settlement.

## Notes

- The benchmark comparison is the core value proof of Solaxis, demonstrating how Ephemeral Rollups eliminate gas costs and block-time friction for high-speed compute.
- Always use the official Solana Explorer URL format: `https://explorer.solana.com/tx/<signature>?cluster=devnet`.
- Depends on: 00, 04, 06, 07, 08. Required before: 10.

## Check When Done

- Completing an invocation populates the benchmark card with accurate latency, fee, and throughput metrics.
- The gas reduction badge accurately reflects savings against traditional L1 transaction costs.
- The explorer links for delegation and settlement point to genuine Devnet transactions on `explorer.solana.com`.
- Copying signatures and exporting the JSON execution report work smoothly without errors.
