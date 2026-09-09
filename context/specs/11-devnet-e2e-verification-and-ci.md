Read `00-product-map.md` before starting.
Also read `03-solaxis-anchor-engine.md`, `04-delegation-and-lifecycle-controller.md`, `05-developer-sdk-and-custom-functions.md`, and `06-solaxis-cli.md`.

Build the automated end-to-end integration test suite on Solana Devnet + MagicBlock TEE, and configure the continuous integration (CI) workflow. Leave production deployment to post-hackathon phases.

## Implementation

1. Create the end-to-end integration test harness at `packages/contracts/tests/solaxis-e2e.ts` using Mocha, Chai, and the Anchor test runner.
   - Configure connection to Solana Devnet L1 (`https://api.devnet.solana.com`) and MagicBlock Devnet Router (`https://devnet-router.magicblock.app`).
   - Load or generate a persistent test payer keypair funded with Devnet SOL.
   - Implement test setup and teardown hooks ensuring clean state across test runs.
2. Implement Test Suite 1: Task Initialization and L1 PDA Verification.
   - Generate a unique test task ID.
   - Invoke the `initialize` instruction on Solana Base Layer L1.
   - Fetch the created `TaskAccount` and assert: `status === 0 (Idle)`, `iterations_run === 0`, `compute_output === 0`, `authority === payer.publicKey`, and account size matches `79 bytes`.
3. Implement Test Suite 2: Base Layer Delegation and Router Discovery.
   - Invoke the `delegate` instruction on Base Layer L1 passing the MagicBlock TEE Validator pubkey (`MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`).
   - Confirm transaction finality on L1 and assert that account owner transitions to the MagicBlock Delegation Program (`DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`).
   - Poll the MagicBlock Router at `devnet-router.magicblock.app` and verify that `getDelegationStatus(taskPda)` returns `delegated: true` with active validator FQDN (`https://devnet-tee.magicblock.app`).
4. Implement Test Suite 3: Ephemeral Rollup Batch Execution Loop.
   - Connect directly to the returned Ephemeral Rollup validator FQDN.
   - Submit the `execute_batch` instruction with 50 iterations and seed 42.
   - Verify that execution completes in sub-10ms per iteration with zero L1 gas fees.
   - Fetch the ephemeral state from the rollup validator and assert: `status === 2 (Running)`, `iterations_run === 50`, and `compute_output > 0`.
5. Implement Test Suite 4: Atomic Commit and Undelegation Settlement.
   - Construct the settlement transaction using `MagicIntentBundleBuilder.commit_and_undelegate` and submit to the Ephemeral Rollup.
   - Await commitment to Solana Base Layer L1.
   - Fetch the settled account on Base Layer L1 and assert:
     1. Account ownership has reverted from the Delegation Program back to `solaxis_engine`.
     2. `task_account.status === 3 (Settled)`.
     3. `task_account.iterations_run === 50`.
     4. `task_account.completed_at` is populated with a valid timestamp.
6. Implement Test Suite 5: CLI End-to-End Command Runner.
   - Execute the compiled CLI binary via `child_process.execSync` for `solaxis init` and `solaxis invoke --iterations 10 --json`.
   - Parse the stdout JSON output and assert that `TelemetryMetricsSchema.safeParse` succeeds with valid duration metrics and transaction signatures.
7. Create the GitHub Actions CI workflow at `.github/workflows/ci.yml`.
   - Trigger on `push` and `pull_request` targeting the `main` branch.
   - Job 1: `lint-and-typecheck`: Run pnpm install, linting, and root typecheck across all packages.
   - Job 2: `anchor-build`: Set up Rust and Solana CLI, install Anchor 0.30.1, and verify that `anchor build` compiles with zero warnings or errors.
   - Job 3: `app-build`: Verify that `pnpm --filter app build` completes successfully for the Next.js console.
   - Job 4: `e2e-verification`: Run the automated integration test suite on Solana Devnet with secret environment variables for the test payer keypair.

## Scope Limits

- Do not mock the Anchor contract or MagicBlock Ephemeral Rollup validator in the integration test; tests must run against live Devnet and TEE infrastructure.
- Do not commit real private keys or funded production secrets into the repository.
- Do not skip or stub test assertions to artificially achieve passing CI runs.

## Notes

- Devnet transactions occasionally experience slot congestion; implement retry logic with capped backoff for transaction confirmations.
- Depends on: 00, 01, 03, 04, 05, 06, 10.

## Check When Done

- Running the integration test suite against Devnet executes all 5 test suites and passes with green assertions.
- The Task PDA successfully delegates, executes inside the TEE rollup, commits state atomically, and reverts ownership on L1.
- CLI end-to-end command execution produces valid JSON telemetry conforming to `TelemetryMetricsSchema`.
- GitHub Actions CI workflow file is valid and ready for automated pull-request validation.
