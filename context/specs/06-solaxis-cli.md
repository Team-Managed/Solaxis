Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md`, `04-delegation-and-lifecycle-controller.md`, and `05-developer-sdk-and-custom-functions.md`.

Build the standalone Node.js command-line interface (`solaxis`) in `packages/cli`. The CLI provides terminal commands for project scaffolding (`solaxis new`), task initialization, status inspection, full lifecycle execution, and custom function deployment with animated spinners and ASCII telemetry summaries. Leave web UI components to units 07-10.

## Implementation

1. Configure `packages/cli` package manifest and build toolchain.
   - Define binary name `solaxis` in `packages/cli/package.json` pointing to `dist/bin/solaxis.js`.
   - Add dependencies: `commander` for CLI parsing, `chalk` for terminal colors, `ora` for animated terminal spinners, `cli-table3` for ASCII data tables, and `@solaxis/shared`.
   - Configure TypeScript build outputting executable JavaScript with a shebang header.
2. Create CLI entrypoint at `packages/cli/src/bin/solaxis.ts`.
   - Initialize Commander program with name `solaxis`, description "Serverless Web3 Micro-Instance Engine for Solana", and version.
   - Add global options: `--rpc <url>` (override Solana RPC endpoint), `--keypair <path>` (filesystem path to Solana keypair, defaulting to `~/.config/solana/id.json`), and `--json` (output raw JSON telemetry).
3. Implement the `solaxis init` command in `packages/cli/src/commands/init.ts`.
   - Accept an optional `--task-id <id>` argument, generating a unique nano-id timestamp if omitted.
   - Load the payer keypair and verify that the account has at least 0.05 Devnet SOL for rent and transaction fees.
   - Instantiate the `LifecycleController` and invoke `initializeTask`.
   - Render an animated spinner during confirmation, followed by a green checkmark showing the initialized Task PDA public key and Solana Explorer transaction link.
4. Implement the `solaxis status` command in `packages/cli/src/commands/status.ts`.
   - Accept a required `--task-id <id>` or `--pda <pubkey>` argument.
   - Fetch the on-chain `TaskAccount` data from Solana Devnet L1.
   - Query the MagicBlock router for current delegation status and active FQDN.
   - Format and print an ASCII table displaying: Task ID, Authority, Lifecycle Status, Total Iterations Run, Compute Output, Delegated Validator, and Explorer URL.
5. Implement the `solaxis invoke` command in `packages/cli/src/commands/invoke.ts`.
   - Accept options: `--function <name>` (choice of `batch-risk-simulator`, `confidential-state-hasher`, `session-counter`, defaulting to `batch-risk-simulator`), `--iterations <count>` (number of iterations between 1 and 200, defaulting to 50), `--seed <number>` (defaulting to 42), and `--tee` (flag to route to confidential TEE enclave).
   - Verify payer balance and initialize the Task PDA if not already present.
   - Instantiate `LifecycleController` and subscribe to progress events.
   - Step 1 Display: Spin up an Ora spinner "Delegating Task PDA to MagicBlock Delegation Program...".
   - Step 2 Display: Update spinner "Discovering active Ephemeral Rollup validator via Magic Router...".
   - Step 3 Display: Render a real-time progress bar "Executing Ephemeral Micro-VM compute loop (sub-10ms/iteration)..." displaying live iteration counters and millisecond stopwatch.
   - Step 4 Display: Update spinner "Committing state and undelegating account back to Solana L1...".
   - Step 5 Display: Render green completion message "Micro-instance execution settled on Solana L1!".
6. Implement telemetry summary rendering in `packages/cli/src/views/telemetry-view.ts`.
   - If `--json` is passed, print the raw `TelemetryMetrics` JSON string to stdout and exit.
   - Otherwise, render an ASCII box containing: Total Execution Time (with breakdown of Spin-up, Rollup Compute, and Teardown ms), Iterations Processed, Throughput (iterations/second), Gas Saved Percentage, L1 Delegation Explorer Link, and L1 Settlement Explorer Link.
7. Implement robust error handling and process exit codes:
   - Exit code 0 for successful execution.
   - Exit code 1 for network, RPC, or on-chain transaction errors.
   - Exit code 2 for invalid command-line arguments or schema validation failures.
   - Print human-readable error messages in red with actionable remediation advice (e.g. "Wallet has 0 SOL. Run 'solana airdrop 1' to fund your Devnet wallet").

## Scope Limits

- Do not implement browser-specific APIs, React components, or DOM logic in this package.
- Do not write to centralized databases or create telemetry tracking files outside the current terminal session.
- Do not allow unhandled promise rejections to crash the CLI without formatted error output.

- The CLI consumes `@solaxis/sdk` for function resolution, scaffolding, and lifecycle orchestration.
- Keypair loading should check the default Solana CLI configuration path before failing.
- Depends on: 00, 01, 04, 05. Required before: 11.

## Check When Done

- Running `node dist/bin/solaxis.js --help` displays all commands and options cleanly.
- Running `solaxis init` against Devnet initializes a Task PDA and returns an Explorer link.
- Running `solaxis status` outputs an ASCII table with current account and router delegation status.
- Running `solaxis invoke --iterations 20` executes all 5 steps, updates the terminal spinner, and prints the telemetry summary table.
