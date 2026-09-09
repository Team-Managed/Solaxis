Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md`, `03-solaxis-anchor-engine.md`, and `04-delegation-and-lifecycle-controller.md`.

Build the public TypeScript Developer SDK (`@solaxis/sdk`) in `packages/sdk` and the reusable on-chain Rust crate (`solaxis-engine-sdk`) in `packages/contracts/crates/solaxis-engine-sdk`. Enables developers to author custom compute functions in TypeScript or Rust, scaffold new functions, deploy them to Solana Devnet, and execute them across MagicBlock Ephemeral Rollups and TEE enclaves. Leave CLI terminal commands and UI rendering to subsequent units.

## Implementation

1. Configure `packages/sdk` package layout and build toolchain.
   - Define package name `@solaxis/sdk` in `packages/sdk/package.json`.
   - Add dependencies: `@solaxis/shared`, `@solana/web3.js`, `@magicblock-labs/ephemeral-rollups-sdk`, and `eventemitter3`.
   - Configure TypeScript compiler extending `tsconfig.base.json` with declaration generation and source maps outputting to `dist/`.
   - Add test runner configuration using Vitest.
2. Implement the declarative custom function definition API in `packages/sdk/src/function.ts`.
   - Export `defineFunction` helper accepting: function name (string), description (string), input schema (Zod schema), output schema (Zod schema), default iteration count (integer between 1 and 200), target validator environment (`standard-er` vs `confidential-tee`), and a custom execution handler.
   - Validate that custom function definitions adhere to name formatting rules (lowercase alphanumeric and hyphens) and valid iteration limits.
   - Export `FunctionDefinition` type inferred from the configuration parameters.
   - Implement the built-in functions registry providing pre-configured templates: `batch-risk-simulator`, `confidential-state-hasher`, and `session-counter`.
3. Implement `SolaxisClient` class in `packages/sdk/src/client.ts`.
   - Accept configuration options: `rpcUrl` (defaulting to Solana Devnet), `routerUrl` (defaulting to MagicBlock Devnet router), `wallet` (Keypair or browser Wallet Adapter), and optional `commitment`.
   - Implement `createTask(taskId, options)`: derives Task PDA and submits L1 initialization transaction.
   - Implement `delegateTask(taskPda, validator)`: transfers account ownership to the Delegation Program on L1.
   - Implement `discoverEndpoint(taskPda)`: queries MagicBlock Router for the assigned validator FQDN.
   - Implement `execute(taskPda, erUrl, functionDef, inputs)`: connects to the Ephemeral Rollup and dispatches compute iterations at zero L1 gas.
   - Implement `settle(taskPda, erUrl)`: executes atomic `commit_and_undelegate` via `MagicIntentBundleBuilder`, awaits base layer confirmation, and extracts the settlement signature.
   - Implement high-level `invoke(functionDef, inputs, options)`: orchestrates the full 5-stage lifecycle in a single call, returning validated `TelemetryMetrics`.
4. Implement typed lifecycle event emitter in `packages/sdk/src/events.ts`.
   - Define event map supporting: `statusChange` (emitting current `TaskStatus`), `progress` (emitting `ProgressEvent` during compute iterations), `log` (emitting structured log level and message), `settled` (emitting `TelemetryMetrics`), and `error` (emitting diagnostic error details).
   - Ensure event listeners can be attached to `SolaxisClient` instances before or during invocation.
5. Implement the reusable on-chain Rust crate in `packages/contracts/crates/solaxis-engine-sdk`.
   - Configure `Cargo.toml` with dependencies: `anchor-lang`, `ephemeral-rollups-sdk`.
   - Define the `SolaxisComputeHandler` trait requiring implementations of `compute_step` (processing a single iteration within the ephemeral micro-instance) and `verify_state`.
   - Define CPI helpers for custom Anchor programs to invoke `solaxis_engine` initialization and delegation instructions without duplicating PDA logic.
   - Provide an undelegation helper wrapping `MagicIntentBundleBuilder` to ensure atomic state commitment on the developer's program accounts.
6. Implement project scaffolding generator in `packages/sdk/src/scaffold.ts`.
   - Implement `scaffoldFunctionProject(targetDir, options)`: generates a turnkey starter project directory containing:
     - `solaxis.config.ts` defining the function metadata and deployment settings.
     - Custom Anchor program skeleton in Rust implementing `SolaxisComputeHandler`.
     - Client test script invoking the function via `SolaxisClient`.
7. Export canonical public API from `packages/sdk/src/index.ts`.
   - Export `SolaxisClient`, `defineFunction`, `scaffoldFunctionProject`, all event types, function interfaces, and re-export foundational contracts from `@solaxis/shared`.

## Scope Limits

- Do not implement interactive terminal prompts, spinners, or CLI argument parsing in this unit (reserved for Unit 06).
- Do not implement Web Console React components or UI pages in this unit (reserved for Units 07-10).
- Do not build custom compiler binaries; developer on-chain programs are compiled using standard `anchor build`.
- Do not store user private keys or credentials across client sessions.

## Notes

- `SolaxisClient` must run seamlessly in both Node.js server environments and browser frontend contexts.
- All network calls must implement timeouts and retry policies to ensure resilient execution across Devnet RPC nodes.
- Depends on: 00, 01, 03, 04. Required before: 06, 07, 08, 09, 10, 11.

## Check When Done

- `packages/sdk` compiles cleanly via `pnpm --filter @solaxis/sdk build` with TypeScript declarations generated.
- Unit tests verify `defineFunction` parameter validation, `SolaxisClient` instantiation, and event emission.
- `scaffoldFunctionProject` creates a valid project directory structure with expected configuration and code files.
- The Rust crate `solaxis-engine-sdk` compiles cleanly via `cargo check` inside `packages/contracts`.
- `@solaxis/sdk` exports all client symbols and re-exports core schemas without type conflicts.
