//! Reusable on-chain Rust SDK for authoring Solaxis micro-instance compute kernels.
//!
//! Provides traits, deterministic compute engines, and MagicBlock Ephemeral Rollup
//! undelegation helpers for custom Solana programs running in isolated TEE micro-instances.

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::ephem::{FoldableIntentBuilder, MagicIntentBundleBuilder};

pub const TASK_SEED_PREFIX: &[u8] = b"solaxis_task";
pub const FNV_PRIME_64: u64 = 0x100000001b3;
pub const FNV_OFFSET_64: u64 = 0xcbf29ce484222325;

/// Trait implemented by on-chain compute kernels executing inside Solaxis micro-instances.
pub trait SolaxisComputeHandler {
    /// Executes a single discrete compute iteration, mutating the internal accumulator state.
    fn compute_step(state: &mut u64, iteration: u32, seed: u64) -> Result<u64>;

    /// Validates whether the final computed state accumulator matches an expected hash.
    fn verify_state(state: u64, expected_hash: u64) -> bool {
        state == expected_hash
    }
}

/// Canonical deterministic pseudo-random hash chain compute kernel.
/// Computes an in-memory FNV-1a hash chain across high-speed Ephemeral Rollup ticks.
#[derive(Default, Debug, Clone, Copy)]
pub struct DeterministicHashChainKernel;

impl SolaxisComputeHandler for DeterministicHashChainKernel {
    fn compute_step(state: &mut u64, iteration: u32, seed: u64) -> Result<u64> {
        let input = (iteration as u64) ^ seed;
        *state = (*state ^ input).wrapping_mul(FNV_PRIME_64);
        Ok(*state)
    }
}

/// Helper that wraps MagicIntentBundleBuilder for atomic teardown and L1 commitment.
pub fn commit_and_undelegate_account<'info>(
    payer: &AccountInfo<'info>,
    delegated_account: &AccountInfo<'info>,
    magic_context: &AccountInfo<'info>,
    magic_program: &AccountInfo<'info>,
) -> Result<()> {
    MagicIntentBundleBuilder::new(
        payer.to_account_info(),
        magic_context.to_account_info(),
        magic_program.to_account_info(),
    )
    .commit_and_undelegate(&[delegated_account.to_account_info()])
    .build_and_invoke()?;
    Ok(())
}

/// Derives the canonical Task PDA for a given authority and task_id.
pub fn derive_task_pda(
    program_id: &Pubkey,
    authority: &Pubkey,
    task_id: u64,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            TASK_SEED_PREFIX,
            authority.as_ref(),
            &task_id.to_le_bytes(),
        ],
        program_id,
    )
}

pub mod prelude {
    pub use super::{
        commit_and_undelegate_account, derive_task_pda, DeterministicHashChainKernel,
        SolaxisComputeHandler, FNV_OFFSET_64, FNV_PRIME_64, TASK_SEED_PREFIX,
    };
    pub use ephemeral_rollups_sdk::ephem::{FoldableIntentBuilder, MagicIntentBundleBuilder};
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_handler_deterministic_execution() {
        let mut state = 42u64;
        let seed = 12345u64;

        for i in 1..=10 {
            let res = DeterministicHashChainKernel::compute_step(&mut state, i, seed).unwrap();
            assert_eq!(res, state);
            assert_ne!(state, 0);
        }

        assert!(DeterministicHashChainKernel::verify_state(state, state));
        assert!(!DeterministicHashChainKernel::verify_state(state, state + 1));
    }

    #[test]
    fn test_task_pda_derivation() {
        let program_id = Pubkey::new_unique();
        let authority = Pubkey::new_unique();
        let task_id = 999u64;

        let (pda1, bump1) = derive_task_pda(&program_id, &authority, task_id);
        let (pda2, bump2) = derive_task_pda(&program_id, &authority, task_id);

        assert_eq!(pda1, pda2);
        assert_eq!(bump1, bump2);
    }
}
