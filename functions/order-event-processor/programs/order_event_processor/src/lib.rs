use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::{anchor::{commit, delegate, ephemeral}, cpi::DelegateConfig, ephem::MagicIntentBundleBuilder};

declare_id!("D9z5WitdAhw1yhougBPMETFRDrg91h7pNjEHzyayLEeJ");
const LEN: usize = 79;

#[account]
pub struct TaskAccount { pub task_id: u64, pub authority: Pubkey, pub status: u8, pub iterations_run: u32, pub compute_output: u64, pub started_at: i64, pub completed_at: Option<i64>, pub bump: u8 }

#[error_code]
pub enum FunctionError { #[msg("Invalid lifecycle state")] InvalidState, #[msg("Unauthorized authority")] Unauthorized, #[msg("Too many iterations")] TooManyIterations }

#[ephemeral]
#[program]
pub mod order_event_processor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, task_id: u64) -> Result<()> {
        let task = &mut ctx.accounts.task_pda;
        task.task_id = task_id; task.authority = ctx.accounts.authority.key(); task.status = 0;
        task.iterations_run = 0; task.compute_output = 0; task.started_at = Clock::get()?.unix_timestamp;
        task.completed_at = None; task.bump = ctx.bumps.task_pda; Ok(())
    }

    pub fn delegate(ctx: Context<Delegate>, task_id: u64, validator: Option<Pubkey>) -> Result<()> {
        {
            let mut data = ctx.accounts.task_pda.try_borrow_mut_data()?;
            let mut task = TaskAccount::try_deserialize(&mut &data[..])?;
            require_keys_eq!(task.authority, ctx.accounts.payer.key(), FunctionError::Unauthorized);
            task.status = 1;
            task.try_serialize(&mut &mut data[..])?;
        }
        let task_id_bytes = task_id.to_le_bytes();
        let seeds: &[&[u8]] = &[b"solaxis_task", ctx.accounts.payer.key.as_ref(), task_id_bytes.as_ref()];
        ctx.accounts.delegate_task_pda(&ctx.accounts.payer, seeds, DelegateConfig { validator, ..Default::default() })?;
        Ok(())
    }

    pub fn execute_batch(ctx: Context<ExecuteBatch>, iterations: u32, seed: u64) -> Result<()> {
        require!(iterations > 0 && iterations <= 200, FunctionError::TooManyIterations);
        let task = &mut ctx.accounts.task_pda;
        require_keys_eq!(task.authority, ctx.accounts.authority.key(), FunctionError::Unauthorized);
        require!(task.status == 1 || task.status == 2, FunctionError::InvalidState);
        task.status = 2;
        for i in 0..iterations { task.compute_output = task.compute_output.wrapping_add(seed).wrapping_add(i as u64); }
        task.iterations_run = task.iterations_run.checked_add(iterations).ok_or(FunctionError::TooManyIterations)?;
        Ok(())
    }

    pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
        let task_info = ctx.accounts.task_pda.to_account_info();
        let data = task_info.try_borrow_data()?;
        let task = TaskAccount::try_deserialize(&mut &data[..])?;
        require_keys_eq!(task.authority, ctx.accounts.payer.key(), FunctionError::Unauthorized);
        drop(data);
        MagicIntentBundleBuilder::new(ctx.accounts.payer.to_account_info(), ctx.accounts.magic_context.to_account_info(), ctx.accounts.magic_program.to_account_info()).commit_and_undelegate(&[task_info]).build_and_invoke()?; Ok(())
    }
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct Initialize<'info> { #[account(mut)] pub authority: Signer<'info>, #[account(init, payer = authority, space = LEN, seeds = [b"solaxis_task", authority.key().as_ref(), &task_id.to_le_bytes()], bump)] pub task_pda: Account<'info, TaskAccount>, pub system_program: Program<'info, System> }
#[delegate]
#[derive(Accounts)]
pub struct Delegate<'info> { #[account(mut)] pub payer: Signer<'info>, /// CHECK: Delegated TaskAccount PDA validated by the program before delegation.
 #[account(mut, del)] pub task_pda: AccountInfo<'info> }
#[derive(Accounts)]
pub struct ExecuteBatch<'info> { pub authority: Signer<'info>, #[account(mut)] pub task_pda: Account<'info, TaskAccount> }
#[commit]
#[derive(Accounts)]
pub struct Undelegate<'info> { #[account(mut)] pub payer: Signer<'info>, /// CHECK: TaskAccount is explicitly validated and serialized before ownership-changing settlement.
 #[account(mut)] pub task_pda: UncheckedAccount<'info> }
