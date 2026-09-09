use anchor_lang::prelude::*;
use crate::state::TaskAccount;

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct InitializeTask<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = TaskAccount::LEN,
        seeds = [
            b"solaxis_task",
            authority.key().as_ref(),
            &task_id.to_le_bytes()
        ],
        bump
    )]
    pub task_pda: Account<'info, TaskAccount>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<InitializeTask>, task_id: u64) -> Result<()> {
    let clock = Clock::get()?;
    let task = &mut ctx.accounts.task_pda;

    task.task_id = task_id;
    task.authority = ctx.accounts.authority.key();
    task.status = 0; // 0 = Idle
    task.iterations_run = 0;
    task.compute_output = 0;
    task.started_at = clock.unix_timestamp;
    task.completed_at = None;
    task.bump = ctx.bumps.task_pda;

    Ok(())
}
