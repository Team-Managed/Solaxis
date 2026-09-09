Read `00-product-map.md` before starting.
Also read `02-design-system-and-tokens.md`, `04-delegation-and-lifecycle-controller.md`, and `07-web-console-app-shell.md`.

Build the interactive 4-stage Lifecycle Visualizer component in `packages/app`. The visualizer renders animated pipeline stages, glowing SVG energy tracks, live millisecond timers, and an interactive state inspection drawer. Leave log terminal and benchmark cards to units 09-10.

## Implementation

1. Create the visualizer container at `packages/app/components/visualizer/lifecycle-visualizer.tsx`.
   - Render a prominent header: "Micro-Instance Execution Lifecycle" with an overall status badge and total elapsed time stopwatch.
   - Structure a horizontal pipeline containing four distinct stage nodes connected by dynamic SVG paths.
   - Ensure the container scales responsively, wrapping cleanly on smaller screens while maintaining directional flow.
2. Implement the four visual stage nodes in `packages/app/components/visualizer/stage-node.tsx`:
   - **Node 1: L1 Provisioning (Spin-up)**: Represents Task PDA initialization and delegation to the MagicBlock Delegation Program on Solana Base Layer.
   - **Node 2: Ephemeral Micro-VM (Rollup Compute)**: Represents the sub-10ms execution loop inside the Ephemeral Rollup or TEE enclave.
   - **Node 3: Atomic Teardown (Commit)**: Represents the `MagicIntentBundleBuilder` atomic commit and undelegation transaction.
   - **Node 4: Settled State (L1 Base)**: Represents final state commitment and ownership reversion back to the Solaxis engine on Solana L1.
3. Define the visual states for each stage node:
   - **Pending**: Dark slate border, muted text, inactive hollow circle icon.
   - **Active (Pulsing)**: Bright glowing border (Solar Amber for L1 steps, Neon Emerald for ER compute), pulsing radar dot, live millisecond counter incrementing in real time.
   - **Completed**: Solid emerald border, green checkmark icon, frozen final duration badge (e.g. `84ms`).
   - **Failed**: Red border, cyber crimson alert triangle, error badge, click-to-view error action.
4. Implement dynamic SVG energy tracks in `packages/app/components/visualizer/energy-track.tsx`.
   - Render connecting paths between adjacent nodes with a base dark-channel stroke.
   - When transitioning between stages, animate a flowing particle or gradient beam along the SVG path to visualize state migration from L1 to the Rollup and back to L1.
   - Use CSS keyframe animations and SVG stroke-dashoffset transitions for smooth 60fps rendering without external animation bloat.
5. Implement high-resolution millisecond stopwatches in `packages/app/components/visualizer/stage-timer.tsx`.
   - When a stage becomes active, run a `requestAnimationFrame` timer displaying elapsed milliseconds with tabular numerals.
   - When a stage completes, lock the timer to the exact duration reported by the `LifecycleController` telemetry.
6. Create an interactive Stage Inspection Drawer in `packages/app/components/visualizer/stage-drawer.tsx`.
   - Clicking any completed or active stage node opens a slide-out sheet displaying deep technical metadata for that phase:
     - For Node 1: Task PDA address, Authority key, Base Layer block height, Delegation transaction signature.
     - For Node 2: Assigned Validator FQDN, TEE Enclave attestation status, iterations completed, average latency per iteration.
     - For Node 3: Intent bundle hash, commit block height, settlement transaction signature.
     - For Node 4: Final compute output, account owner verification, L1 confirmation slot.

## Scope Limits

- Do not implement raw terminal text streaming in this component (reserved for Unit 09).
- Do not render the final benchmark comparison card here (reserved for Unit 10).
- Do not trigger smart contract transactions directly from visualizer nodes; all state derives reactively from `useSolaxisExecution`.

## Notes

- Stage duration timers must match the exact telemetry metrics computed by the lifecycle controller.
- Distinct icon shapes (circle, radar dot, checkmark, triangle) must accompany color changes to ensure accessibility.
- Depends on: 00, 02, 04, 05, 07. Required before: 10.

## Check When Done

- The visualizer displays all four stages in horizontal order with connecting SVG tracks.
- Triggering an invocation smoothly transitions Node 1 -> Node 2 -> Node 3 -> Node 4 with animated energy tracks.
- Millisecond timers increment during active phases and freeze cleanly upon completion.
- Clicking any node opens the inspection drawer displaying the correct phase-specific metadata.
