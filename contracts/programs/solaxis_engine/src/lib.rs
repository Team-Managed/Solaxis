use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;
pub use errors::*;
pub use events::*;

pub(crate) use instructions::__client_accounts_delegate_task;
pub(crate) use instructions::__client_accounts_execute_batch;
pub(crate) use instructions::__client_accounts_initialize_task;
pub(crate) use instructions::__client_accounts_undelegate;

 declare_id!("2eq1RjrJXK4HkWux3xrLqpb6SS7yHuBeDxnPPLVsu6Yj");

#[ephemeral]
#[program]
pub mod solaxis_engine {
    use super::*;

    pub fn initialize(ctx: Context<InitializeTask>, task_id: u64) -> Result<()> {
        instructions::initialize::initialize(ctx, task_id)
    }

    pub fn delegate(
        ctx: Context<DelegateTask>,
        task_id: u64,
        target_validator: Option<Pubkey>,
    ) -> Result<()> {
        instructions::delegate::delegate(ctx, task_id, target_validator)
    }

    pub fn execute_batch(ctx: Context<ExecuteBatch>, iterations: u32, seed: u64) -> Result<()> {
        instructions::execute_batch::execute_batch(ctx, iterations, seed)
    }

    pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
        instructions::undelegate::undelegate(ctx)
    }
}
