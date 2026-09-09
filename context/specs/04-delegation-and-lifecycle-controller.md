Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md` and `03-solaxis-anchor-engine.md`.

Implement the client-side lifecycle orchestration controller in `packages/shared/src/controller/`. This module manages the complete 5-step micro-instance execution flow: L1 initialization, L1 delegation, router discovery, high-frequency ER compute execution, and atomic settlement. Leave CLI formatting and UI rendering to subsequent units.

## Implementation

1. Create `packages/shared/src/controller/lifecycle-controller.ts` exporting the `LifecycleController` class.
   - Accept configuration options: `baseConnection` (Solana L1 Connection), `routerUrl` (string MagicBlock router URL), `wallet` (Solana wallet adapter or keypair signer), and `programId` (Anchor Program ID).
   - Maintain internal lifecycle state transitioning through: `IDLE`, `PROVISIONING`, `RUNNING`, `TEARING_DOWN`, `SETTLED`, and `FAILED`.
   - Provide an event emitter or subscription callback mechanism (`onStateChange`, `onLog`, `onProgress`) so the CLI and Web Console can subscribe to live lifecycle updates without tight coupling.
2. Implement Step 1: `initializeTask(taskId: string)`.
   - Derive the Task PDA using `deriveTaskPda(programId, wallet.publicKey, taskId)`.
   - Check whether the account already exists on Base Layer L1; if not, build and submit the `initialize` Anchor transaction.
   - Confirm transaction finality on Base Layer and emit an `INFO` log with the transaction signature.
3. Implement Step 2: `delegateTask(taskPda: PublicKey, validatorPubkey: PublicKey)`.
   - Build the `delegate` instruction targeting the specified validator (defaulting to the MagicBlock TEE Validator `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`).
   - Submit the transaction to Solana Base Layer L1 and await confirmation.
   - Record the delegation transaction signature and start a high-resolution performance timer for the spin-up phase.
   - Emit a lifecycle transition to `PROVISIONING`.
4. Implement Step 3: `discoverRouterEndpoint(taskPda: PublicKey)`.
   - Poll the MagicBlock router at `routerUrl` using `router.getDelegationStatus(taskPda)`.
   - Implement polling with a 500ms interval and a maximum timeout of 15 seconds.
   - When the router reports that delegation is active, extract the assigned validator fully-qualified domain name (FQDN), such as `https://devnet-tee.magicblock.app`.
   - Stop the spin-up timer and record `spinUpDurationMs`.
   - Transition lifecycle state to `RUNNING`.
5. Implement Step 4: `executeEphemeralLoop(erUrl: string, taskPda: PublicKey, request: InvocationRequest)`.
   - Establish a secondary Solana `Connection` pointing directly to the Ephemeral Rollup FQDN returned by the router.
   - Start a high-resolution performance timer for the ephemeral execution phase.
   - Dispatch `execute_batch` instructions into the Ephemeral Rollup validator with zero L1 gas fees.
   - For batch sizes up to 200 iterations, stream progress updates via the `onProgress` callback containing iteration index, percentage complete, and intermediate compute output.
   - Stop the ephemeral execution timer and record `erExecutionDurationMs`.
6. Implement Step 5: `undelegateAndSettle(erUrl: string, taskPda: PublicKey)`.
   - Transition lifecycle state to `TEARING_DOWN`.
   - Start a high-resolution performance timer for the teardown phase.
   - Build and submit the settlement transaction targeting the Anchor `undelegate` instruction directly to the Ephemeral Rollup connection, passing `payer`, `taskPda`, `magicProgram` (`Magic11111111111111111111111111111111111111`), and `magicContext` (`MagicContext1111111111111111111111111111111`).
   - Extract the base L1 commitment transaction signature using the SDK helper `GetCommitmentSignature(erTxHash, erConnection)` from `@magicblock-labs/ephemeral-rollups-sdk`.
   - Await confirmation of the extracted commitment transaction signature on Base Layer L1 (`baseConnection.confirmTransaction(commitTxHash, "confirmed")`), guaranteeing that state is sealed and PDA ownership has cleanly reverted from the Delegation Program back to `programId`.
   - Record the settlement transaction signature and record `teardownDurationMs`.
   - Transition lifecycle state to `SETTLED`.
7. Implement `calculateTelemetryMetrics()`:
   - Compute total duration as the sum of spin-up, execution, and teardown durations.
   - Calculate gas savings: estimate traditional L1 cost as 5,000 lamports multiplied by the number of iterations; subtract actual ER execution cost (0 lamports) plus L1 delegation/settlement base fees; compute percentage saved.
   - Validate and return the complete payload against `TelemetryMetricsSchema`.
8. Implement error recovery and abort logic:
   - Handle router polling timeouts by providing descriptive diagnostic errors.
   - Handle network disconnections by attempting up to 3 retries with exponential backoff on transient errors.
   - Transition state to `FAILED` and emit full error diagnostics if an unrecoverable failure occurs.

## Scope Limits

- Do not implement terminal formatting, Ora spinners, or Chalk styling in this unit (reserved for Unit 05).
- Do not implement React hooks or UI component state in this unit (reserved for Unit 06).
- Do not bypass the MagicBlock router to connect to arbitrary untrusted endpoints.
- Do not store private keys in memory beyond what is required for immediate signing operations.

## Notes

- Re-use the `Connection` instance for Base Layer and create an ephemeral `Connection` for the ER endpoint.
- Always use monotonic performance clocks (`performance.now()`) to capture millisecond telemetry.
- The controller must be isomorphic, running seamlessly in both Node.js (CLI) and browser (Next.js) environments.
- Depends on: 00, 01, 03. Required before: 05, 06, 07, 08, 09, 10.

## Check When Done

- `LifecycleController` compiles cleanly without type errors.
- Unit tests verify state machine progression: `IDLE` -> `PROVISIONING` -> `RUNNING` -> `TEARING_DOWN` -> `SETTLED`.
- Telemetry calculation generates valid `TelemetryMetrics` conforming to the shared schema.
- Polling logic times out cleanly with actionable errors when an un-delegated PDA is queried.
