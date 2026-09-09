Read `00-product-map.md` before starting.

Establish the repository boundary, package layout, shared Zod schemas, TypeScript types, RPC network constants, and environment validators across the Solaxis monorepo. Leave smart contract code, CLI commands, and UI screens to subsequent units.

## Implementation

1. Create the monorepo workspace layout at `packages/contracts`, `packages/sdk`, `packages/cli`, `packages/app`, and `packages/shared`, configured with root `pnpm-workspace.yaml` and root `package.json`.
   - Configure `packages/contracts` for Anchor (Rust) smart contract development and the `solaxis-engine-sdk` crate.
   - Configure `packages/sdk` for the public TypeScript Developer SDK (`@solaxis/sdk`).
   - Configure `packages/cli` for the standalone Node.js CLI executable.
   - Configure `packages/app` for the Next.js 15 App Router web console.
   - Configure `packages/shared` as an internal TypeScript package providing types, validation contracts, constants, and utilities consumed by `sdk`, `cli`, and `app`.
   - Prevent `cli` and `app` from importing each other's source files; all shared code must reside exclusively inside `packages/shared`.
2. Create `packages/shared/src/constants/network.ts` defining canonical network addresses and endpoints for Solana Devnet and MagicBlock infrastructure.
   - Define the MagicBlock Delegation Program public key as `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`.
   - Define the primary Solana Devnet Base L1 RPC endpoint as `https://rpc.magicblock.app/devnet` with fallback to `https://api.devnet.solana.com`.
   - Define the MagicBlock Magic Program ID as `Magic11111111111111111111111111111111111111`.
   - Define the MagicBlock Magic Context ID as `MagicContext1111111111111111111111111111111`.
   - Define the MagicBlock Devnet Router endpoint as `https://devnet-router.magicblock.app`.
   - Define the MagicBlock Devnet TEE Validator endpoint as `https://devnet-tee.magicblock.app` and validator public key as `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`.
   - Define the MagicBlock Devnet Asia Validator public key as `MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57`.
   - Define the Localnet Ephemeral Rollup validator endpoint as `http://localhost:7799` and validator public key as `mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev`.
3. Create `packages/shared/src/contracts/task.ts` defining Zod schemas and inferred TypeScript types for micro-instance task state.
   - Define `TaskStatusSchema` as an enumeration with values: `IDLE`, `PROVISIONING`, `RUNNING`, `TEARING_DOWN`, `SETTLED`, and `FAILED`.
   - Define `DelegationStatusSchema` matching the MagicBlock router response with fields: `isDelegated` (boolean), `fqdn` (optional string URL), and optional `delegationRecord` object containing `authority` (string), `owner` (string), `delegationSlot` (number), and `lamports` (number).
   - Define `TaskAccountStateSchema` with fields: `taskId` (string identifier), `authority` (Solana public key string), `status` (`TaskStatusSchema`), `iterationsRun` (non-negative integer), `computeOutput` (string representation of computed output or hash), `startedAt` (integer epoch timestamp in milliseconds), `completedAt` (nullable integer epoch timestamp), `delegatedValidator` (nullable public key string), and `bump` (integer bump seed).
   - Export inferred TypeScript types alongside each Zod schema; do not duplicate manual interface definitions.
4. Create `packages/shared/src/contracts/invocation.ts` defining Zod schemas for user invocation requests.
   - Define `InvocationRequestSchema` with fields: `functionName` (enumeration of `batch-risk-simulator`, `confidential-state-hasher`, and `session-counter`), `iterations` (integer between 1 and 200, defaulting to 50), `seed` (integer defaulting to 42), and `targetValidator` (enumeration of `standard-er` and `confidential-tee`, defaulting to `confidential-tee`).
   - Define `ProgressEventSchema` with fields: `taskId` (string), `currentIteration` (integer), `totalIterations` (integer), `currentOutput` (string), and `timestamp` (integer).
5. Create `packages/shared/src/contracts/function.ts` defining Zod schemas for custom function definitions and SDK client configuration.
   - Define `CustomFunctionManifestSchema` with fields: `name` (regex `^[a-z0-9-]+$`), `version` (semver regex), `description` (string), `targetValidator` (`TargetValidatorSchema`), `defaultIterations` (1 to 200), optional `entrypoint`, and optional `programId`.
   - Define `SolaxisClientConfigSchema` with fields: `rpcUrl` (string URL), `routerUrl` (string URL), `commitment` (`processed`, `confirmed`, `finalized`), and `cluster` (`devnet`, `localnet`, `custom`).
   - Export inferred types `CustomFunctionManifest` and `SolaxisClientConfig`.
6. Create `packages/shared/src/contracts/telemetry.ts` defining Zod schemas for benchmark and execution telemetry.
   - Define `TelemetryMetricsSchema` with fields: `totalDurationMs` (positive number), `spinUpDurationMs` (non-negative number), `erExecutionDurationMs` (non-negative number), `teardownDurationMs` (non-negative number), `iterationsCompleted` (integer), `l1GasSavedPercent` (number between 0 and 100), `estimatedL1CostLamports` (integer), `actualErCostLamports` (integer, strictly zero for ER transactions), `delegationTxSignature` (Solana base58 transaction signature string), `settlementTxSignature` (Solana base58 transaction signature string), and `erEndpointUsed` (string URL).
7. Create `packages/shared/src/utils/pda.ts` for Program Derived Address derivation and validation.
   - Implement `deriveTaskPda` function taking `programId`, `authority`, and `taskId`, deriving the address using seeds: the string constant `solaxis_task`, the authority public key buffer, and the UTF-8 encoded `taskId` buffer.
   - Return both the derived public key and the bump seed; validate that seeds do not exceed Solana PDA seed length limits.
8. Create `packages/shared/src/env.ts` with Zod-based environment variable validators for the CLI, SDK, and Web Console runtimes.
   - Define `cliEnvSchema` validating `SOLANA_RPC_URL` (optional string URL defaulting to Devnet), `KEYPAIR_PATH` (optional filesystem path to a Solana keypair), and `MAGICBLOCK_ROUTER_URL` (optional string URL defaulting to Devnet router).
   - Define `appEnvSchema` validating `NEXT_PUBLIC_SOLANA_RPC_URL` and `NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL`.
   - Ensure environment validation fails process startup immediately with descriptive field names if invalid configuration is detected.
9. Create root workspace scripts in root `package.json` for `build`, `lint`, `typecheck`, `test`, and individual package development targets (`pnpm --filter sdk ...`, `pnpm --filter cli ...`, `pnpm --filter app ...`).

## Scope Limits

- Do not implement Anchor smart contract instructions or account serialization in this unit.
- Do not build CLI command handlers or terminal rendering in this unit.
- Do not create Next.js pages, UI components, or wallet adapter configurations in this unit.
- Do not introduce external database dependencies or ORM configurations; state resides on-chain in Solana PDAs.
- Do not create a separate publishable SDK package; all shared utilities remain internal to the monorepo.

## Notes

- All downstream units consume `packages/shared` for contracts, schemas, types, and constants.
- Zod schemas must always be the single source of truth for runtime validation and inferred TypeScript types.
- Ensure strict TypeScript configuration across all packages with `noImplicitAny: true`, `strictNullChecks: true`, and path aliases mapping to `@solaxis/shared`.
- Depends on: 00. Required before: 02, 03, 04, 05, 06, 07, 08, 09, 10.

## Check When Done

- Monorepo packages (`packages/contracts`, `packages/cli`, `packages/app`, and `packages/shared`) are created and linked via pnpm workspaces.
- Running `pnpm typecheck` across the workspace completes with zero errors.
- `packages/shared` exports all constants, Zod schemas, inferred types, PDA derivation helpers, and environment validators.
- Validating sample task state and telemetry payloads against the Zod schemas succeeds, and validating malformed payloads produces actionable error paths.
