use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use crate::errors::SolaxisError;
use crate::state::TaskAccount;

#[delegate]
#[derive(Accounts)]
pub struct DelegateTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: The task PDA delegated to Delegation Program
    #[account(mut, del)]
    pub task_pda: AccountInfo<'info>,
}

pub fn delegate(
    ctx: Context<DelegateTask>,
    task_id: u64,
    target_validator: Option<Pubkey>,
) -> Result<()> {
    // Deserialize, verify authority, and advance state to Provisioning (1)
    {
        let mut data = ctx.accounts.task_pda.try_borrow_mut_data()?;
        require!(data.len() >= TaskAccount::LEN, SolaxisError::InvalidStatusTransition);
        let mut task = TaskAccount::try_deserialize(&mut &data[..])?;
        require_keys_eq!(task.authority, ctx.accounts.payer.key(), SolaxisError::UnauthorizedAuthority);
        require!(task.status == 0, SolaxisError::InvalidStatusTransition);
        task.status = 1; // 1 = Provisioning
        task.try_serialize(&mut &mut data[..])?;
    }

    let task_id_bytes = task_id.to_le_bytes();
    let seeds: &[&[u8]] = &[
        b"solaxis_task",
        ctx.accounts.payer.key.as_ref(),
        task_id_bytes.as_ref(),
    ];

    let delegate_config = DelegateConfig {
        validator: target_validator,
        ..Default::default()
    };

    ctx.accounts.delegate_task_pda(&ctx.accounts.payer, seeds, delegate_config)?;

    Ok(())
}
