Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md`, `02-design-system-and-tokens.md`, and `04-delegation-and-lifecycle-controller.md`.

Build the Web Console application shell in `packages/app`. Provide the Next.js 15 App Router layout, Solana Wallet Adapter integration, function catalog selection, invocation parameter controls, and responsive grid panels. Leave visualizer tracks, terminal streaming, and benchmark cards to units 07-09.

## Implementation

1. Create the application root layout at `packages/app/app/layout.tsx`.
   - Set metadata title "Solaxis | Serverless Web3 Micro-Instance Engine" and description.
   - Include root `globals.css` and configure dark theme root classes.
   - Wrap the application tree with `SolanaWalletProvider` and `ExecutionStoreProvider`.
2. Configure the Solana Wallet Adapter in `packages/app/components/providers/wallet-provider.tsx`.
   - Configure connection pointing to Solana Devnet RPC.
   - Configure supported wallet adapters: Phantom and Solflare.
   - Provide standard wallet modal provider and styled wallet connect button matching the Solaxis solar amber design system.
   - Display active network indicator ("Solana Devnet") and truncated public key with copy-to-clipboard affordance when connected.
3. Create the top navigation header in `packages/app/components/navigation/top-nav.tsx`.
   - Display the Solaxis logo brand mark with glowing amber accent.
   - Display system status pill showing real-time ping to Solana Devnet L1 and MagicBlock Router.
   - Include external documentation link, GitHub repository link, and the wallet connect button.
4. Create the Function Catalog component in `packages/app/components/console/function-catalog.tsx`.
   - Render a three-card selection grid for supported serverless micro-instance functions:
     1. **Batch Risk Simulator**: Financial Monte Carlo algorithm simulating asset volatility over continuous iterations.
     2. **Confidential State Hasher**: Cryptographic hashing loop executing inside Intel TDX TEE enclave for privacy-preserving verification.
     3. **Session Counter**: High-throughput distributed counter demonstrating sub-10ms consecutive state mutations.
   - Card displays: function title, category badge, description, execution icon, and selected radio indicator.
   - Support keyboard navigation and accessible aria selection states.
5. Create the Invocation Control Panel in `packages/app/components/console/invocation-panel.tsx`.
   - Include an iteration count slider with numeric readout, allowing values from 1 to 200 (defaulting to 50).
   - Include a numeric seed input field with a "Randomize" action button.
   - Include an execution environment toggle: "Standard Ephemeral Rollup" vs "Confidential TEE Enclave".
   - Include the primary call-to-action button `Launch Micro-Instance`.
   - Disable button with clear tooltip when wallet is disconnected, when wallet has zero Devnet SOL, or while an invocation is actively executing.
6. Create the main console dashboard page at `packages/app/app/page.tsx` and `packages/app/components/console/console-layout.tsx`.
   - Structure a responsive 12-column engineering dashboard grid:
     - Left column (4 columns on desktop): Function Catalog and Invocation Control Panel.
     - Right column (8 columns on desktop): Top area hosting the Lifecycle Visualizer (Unit 07), middle area hosting the CloudWatch Terminal Stream (Unit 08), and bottom area hosting Benchmark & Explorer Verification (Unit 09).
   - Support smooth resizing down to tablet breakpoints with vertically stacked cards.
7. Create the execution state hook in `packages/app/hooks/use-solaxis-execution.ts`.
   - Interface directly with the `LifecycleController` from `packages/shared`.
   - Provide reactive states: `status`, `activeTaskId`, `currentIteration`, `totalIterations`, `telemetry`, `logs`, and `error`.
   - Expose `launch(request: InvocationRequest)` and `reset()` methods to trigger and clear execution runs.

## Scope Limits

- Do not implement the internal visualizer animations or SVG tracks in this unit (reserved for Unit 07).
- Do not implement terminal line rendering or log filtering in this unit (reserved for Unit 08).
- Do not implement benchmark calculation cards in this unit (reserved for Unit 09).
- Do not manage private keys in browser storage; all signing delegates to the connected wallet adapter.

## Notes

- The console layout is designed for data density, presenting controls, visual pipeline, logs, and telemetry simultaneously without tabs or page reloads.
- Ensure the wallet adapter disconnects and switches networks gracefully without page crashes.
- Depends on: 00, 01, 02, 04. Required before: 07, 08, 09.

## Check When Done

- Next.js application boots and renders the top navigation, wallet connect button, function catalog, and invocation panel.
- Connecting a Phantom or Solflare wallet displays the truncated address and Devnet network badge.
- Selecting different functions updates the active state and reflects parameter defaults.
- Running `pnpm --filter app build` passes typecheck and static generation.
