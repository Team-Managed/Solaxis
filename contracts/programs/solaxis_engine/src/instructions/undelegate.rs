use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_rollups_sdk::ephem::{FoldableIntentBuilder, MagicIntentBundleBuilder};
use crate::errors::SolaxisError;
use crate::state::TaskAccount;

#[commit]
#[derive(Accounts)]
pub struct Undelegate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        constraint = task_pda.authority == payer.key() @ SolaxisError::UnauthorizedAuthority
    )]
    pub task_pda: Account<'info, TaskAccount>,
}

pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
    let clock = Clock::get()?;
    let task = &mut ctx.accounts.task_pda;

    // Verify valid status: must be Provisioning (1) or Running (2)
    require!(
        task.status == 1 || task.status == 2,
        SolaxisError::InvalidStatusTransition
    );

    // Set status to 3 (Settled) and record completion timestamp
    task.status = 3; // 3 = Settled
    task.completed_at = Some(clock.unix_timestamp);

    // Construct and invoke atomic commit and undelegation intent
    MagicIntentBundleBuilder::new(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.magic_context.to_account_info(),
        ctx.accounts.magic_program.to_account_info(),
    )
    .commit_and_undelegate(&[ctx.accounts.task_pda.to_account_info()])
    .build_and_invoke()?;

    Ok(())
}
