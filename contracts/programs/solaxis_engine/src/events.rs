use anchor_lang::prelude::*;

#[event]
pub struct BatchExecutionProgress {
    pub task_id: u64,
    pub iterations_run: u32,
    pub compute_output: u64,
    pub timestamp: i64,
}
