use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum TaskStatus {
    Idle = 0,
    Provisioning = 1,
    Running = 2,
    TearingDown = 3,
    Settled = 4,
    Failed = 5,
}

impl From<u8> for TaskStatus {
    fn from(value: u8) -> Self {
        match value {
            0 => TaskStatus::Idle,
            1 => TaskStatus::Provisioning,
            2 => TaskStatus::Running,
            3 => TaskStatus::TearingDown,
            4 => TaskStatus::Settled,
            _ => TaskStatus::Failed,
        }
    }
}

#[account]
#[derive(Default, Debug)]
pub struct TaskAccount {
    pub task_id: u64,
    pub authority: Pubkey,
    pub status: u8,
    pub iterations_run: u32,
    pub compute_output: u64,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

impl TaskAccount {
    /// Explicit space allocation for TaskAccount PDA:
    /// 8 bytes (Anchor discriminator) +
    /// 8 bytes (task_id: u64) +
    /// 32 bytes (authority: Pubkey) +
    /// 1 byte (status: u8) +
    /// 4 bytes (iterations_run: u32) +
    /// 8 bytes (compute_output: u64) +
    /// 8 bytes (started_at: i64) +
    /// 9 bytes (completed_at: Option<i64> = 1 byte discriminant + 8 bytes value) +
    /// 1 byte (bump: u8)
    /// Total = 79 bytes
    pub const LEN: usize = 8 + 8 + 32 + 1 + 4 + 8 + 8 + 9 + 1;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_account_len() {
        assert_eq!(TaskAccount::LEN, 79);
    }
}
