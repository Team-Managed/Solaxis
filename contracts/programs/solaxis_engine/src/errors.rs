use anchor_lang::prelude::*;

#[error_code]
pub enum SolaxisError {
    #[msg("Illegal state progression or invalid task lifecycle status")]
    InvalidStatusTransition,

    #[msg("Caller is unauthorized to operate on this task PDA")]
    UnauthorizedAuthority,

    #[msg("Compute iterations bound exceeded or arithmetic overflow")]
    ComputeOverflow,

    #[msg("Account owner does not match expected Delegation Program ID during rollup phase")]
    DelegationMismatch,
}
