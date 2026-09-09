use anchor_lang::prelude::*;
use crate::errors::SolaxisError;
use crate::events::BatchExecutionProgress;
use crate::state::TaskAccount;

#[derive(Accounts)]
pub struct ExecuteBatch<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ SolaxisError::UnauthorizedAuthority
    )]
    pub task_pda: Account<'info, TaskAccount>,
}

pub fn execute_batch(ctx: Context<ExecuteBatch>, iterations: u32, seed: u64) -> Result<()> {
    require!(iterations > 0 && iterations <= 200, SolaxisError::ComputeOverflow);

    let task = &mut ctx.accounts.task_pda;

    // Verify valid status: must be 1 (Provisioning) or 2 (Running)
    require!(
        task.status == 1 || task.status == 2,
        SolaxisError::InvalidStatusTransition
    );

    task.status = 2; // 2 = Running

    // Deterministic compute loop running `iterations` cycles:
    // pseudo-random hash chain using bitwise XOR and modular multiplication
    let mut current_output = task.compute_output;
    for i in 0..iterations {
        let step = seed
            .wrapping_add(i as u64)
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        current_output = current_output ^ step;
        current_output = current_output
            .rotate_left(5)
            .wrapping_mul(0x517cc1b727220a95);
    }

    task.compute_output = current_output;
    task.iterations_run = task
        .iterations_run
        .checked_add(iterations)
        .ok_or(SolaxisError::ComputeOverflow)?;

    let clock = Clock::get()?;
    emit!(BatchExecutionProgress {
        task_id: task.task_id,
        iterations_run: task.iterations_run,
        compute_output: task.compute_output,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
