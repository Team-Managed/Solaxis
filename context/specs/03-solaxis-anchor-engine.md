Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md`.

Implement the on-chain Anchor smart contract (`solaxis-engine`) in `packages/contracts` utilizing MagicBlock Ephemeral Rollup macros, state PDAs, delegation CPI, batch execution loops, and atomic undelegation. Leave client-side orchestration, CLI, and UI to later units.

## Implementation

1. Initialize the Anchor workspace inside `packages/contracts` with `Anchor.toml` and `Cargo.toml`.
   - Configure Anchor version `0.30.1`.
   - Add `ephemeral-rollups-sdk = { version = "0.16.2", features = ["anchor-compat"] }` to dependencies (using the `anchor-compat` feature flag for Anchor >=0.28,<1.0 compatibility with Anchor 0.30.1; note that the `anchor` feature is reserved for Anchor 1.x).
   - Configure localnet and devnet cluster configurations in `Anchor.toml` targeting program name `solaxis_engine`.
2. Define the `TaskAccount` state struct in `packages/contracts/programs/solaxis_engine/src/state.rs`.
   - Field 1: `task_id` as an unsigned 64-bit integer (`u64`).
   - Field 2: `authority` as a 32-byte `Pubkey`.
   - Field 3: `status` as an unsigned 8-bit integer (`u8`) representing the lifecycle state: 0 for Idle, 1 for Provisioning, 2 for Running, 3 for TearingDown, 4 for Settled, 5 for Failed.
   - Field 4: `iterations_run` as an unsigned 32-bit integer (`u32`).
   - Field 5: `compute_output` as an unsigned 64-bit integer (`u64`) storing the cumulative mathematical output of the micro-instance compute loop.
   - Field 6: `started_at` as a signed 64-bit integer (`i64`) epoch timestamp.
   - Field 7: `completed_at` as an option signed 64-bit integer (`Option<i64>`).
   - Field 8: `bump` as an unsigned 8-bit integer (`u8`).
   - Implement an explicit constant for account space calculation: 8-byte Anchor discriminator + 8 bytes (task_id) + 32 bytes (authority) + 1 byte (status) + 4 bytes (iterations_run) + 8 bytes (compute_output) + 8 bytes (started_at) + 9 bytes (completed_at) + 1 byte (bump), totaling 79 bytes.
3. Configure the program module in `packages/contracts/programs/solaxis_engine/src/lib.rs` with the mandatory MagicBlock macro.
   - Place the `#[ephemeral]` attribute macro immediately preceding `#[program]`.
   - Ensure the `#[ephemeral]` macro injects the undelegation callback instruction handler with discriminator `[196, 28, 41, 206, 48, 37, 51, 167]`.
   - Declare the program ID matching the generated keypair.
4. Implement the `initialize` instruction and `InitializeTask` accounts context in `packages/contracts/programs/solaxis_engine/src/instructions/initialize.rs`.
   - Derive the `task_pda` using seeds: `b"solaxis_task"`, `authority.key().as_ref()`, and `task_id.to_le_bytes().as_ref()`.
   - Require `authority` as a mutable `Signer` and payer for rent.
   - Allocate `TaskAccount::LEN` bytes and set initial fields: `task_id`, `authority`, `status = 0 (Idle)`, `iterations_run = 0`, `compute_output = 0`, `started_at = Clock::get()?.unix_timestamp`, `completed_at = None`, and `bump`.
5. Implement the `delegate` instruction and `DelegateTask` accounts context in `packages/contracts/programs/solaxis_engine/src/instructions/delegate.rs`.
   - Decorate the accounts context with the MagicBlock `#[delegate]` attribute macro.
   - Mark the `task_pda` account with the `del` attribute to denote delegation eligibility.
   - Require `payer` as a mutable `Signer`.
   - Pass the target validator public key (e.g. MagicBlock TEE Validator) and invoke the auto-generated CPI helper `ctx.accounts.delegate_task_pda(&ctx.accounts.payer, &[b"solaxis_task", ctx.accounts.payer.key().as_ref(), task_id.to_le_bytes().as_ref()], DelegateConfig { validator: Some(target_validator), ..Default::default() })` to transfer account ownership on Solana Base Layer to the MagicBlock Delegation Program.
   - Transition `task_pda.status` to 1 (`Provisioning`).
6. Implement the `execute_batch` instruction in `packages/contracts/programs/solaxis_engine/src/instructions/execute_batch.rs`.
   - Require `task_pda` as a mutable account and verify caller authority.
   - Accept parameters: `iterations` (u32) and `seed` (u64).
   - Verify that `task_pda.status` is either 1 (`Provisioning`) or 2 (`Running`), updating status to 2 (`Running`).
   - Execute a deterministic compute loop running `iterations` cycles: calculate a pseudo-random hash chain using bitwise XOR and modular multiplication based on the `seed` and loop index, updating `task_pda.compute_output`.
   - Increment `task_pda.iterations_run` by the number of iterations executed.
   - Emit an Anchor event `BatchExecutionProgress` containing `task_id`, `iterations_run`, `compute_output`, and `clock.unix_timestamp`.
7. Implement the `undelegate` instruction and `Undelegate` accounts context in `packages/contracts/programs/solaxis_engine/src/instructions/undelegate.rs`.
   - Decorate the `Undelegate` accounts struct with the MagicBlock `#[commit]` attribute macro, which automatically injects the required `magic_context` and `magic_program` accounts into the context.
   - Require `payer` as a mutable `Signer` and `task_pda` as a mutable `Account<TaskAccount>`.
   - Construct the atomic commit and undelegation intent using `MagicIntentBundleBuilder::new(ctx.accounts.payer.to_account_info(), ctx.accounts.magic_context.to_account_info(), ctx.accounts.magic_program.to_account_info()).commit_and_undelegate(&[ctx.accounts.task_pda.to_account_info()]).build_and_invoke()?`.
   - Set `task_pda.status = 3 (Settled)` and record `task_pda.completed_at = Clock::get()?.unix_timestamp`.
   - Package the instruction so that upon execution in the Ephemeral Rollup, the final state is committed to Solana L1 and ownership reverts from the Delegation Program back to `solaxis_engine`.
8. Define domain error codes in `packages/contracts/programs/solaxis_engine/src/errors.rs`.
   - Define `InvalidStatusTransition` for illegal state progression.
   - Define `UnauthorizedAuthority` when a non-owner attempts execution or settlement.
   - Define `ComputeOverflow` for iteration bounds exceeded (>200 per batch).
   - Define `DelegationMismatch` if account owner does not match expected Delegation Program ID during rollup phase.

## Scope Limits

- Do not implement client-side polling, RPC routing, or wallet signatures in this unit.
- Do not add arbitrary external crate dependencies beyond Anchor and `ephemeral-rollups-sdk`.
- Do not bypass the `#[ephemeral]` macro or write manual unsafe undelegation handlers.
- Do not hardcode static authority keys; all PDA ownership must resolve from instruction signers.

## Notes

- The `#[ephemeral]` macro is strictly required for the MagicBlock Delegation Program to verify callback validity on L1.
- In Ephemeral Rollups, `Clock::get()` returns the rollup validator's local clock with sub-10ms increments.
- Account byte size must account for the 8-byte Anchor discriminator.
- Depends on: 00, 01. Required before: 04, 05, 06, 10.

## Check When Done

- The Anchor program compiles cleanly using `anchor build`.
- The generated IDL in `target/idl/solaxis_engine.json` contains `initialize`, `delegate`, `execute_batch`, and `undelegate` instructions.
- The IDL contains the undelegation callback instruction injected by `#[ephemeral]`.
- Program error codes and account sizes match this specification.
