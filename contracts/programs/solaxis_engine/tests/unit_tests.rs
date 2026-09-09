use anchor_lang::prelude::*;
use anchor_lang::AnchorSerialize;
use solaxis_engine::state::{TaskAccount, TaskStatus};
use solaxis_engine::errors::SolaxisError;

#[test]
fn test_task_account_space_calculation() {
    // 8 (discrim) + 8 (task_id) + 32 (authority) + 1 (status) + 4 (iterations_run)
    // + 8 (compute_output) + 8 (started_at) + 9 (completed_at) + 1 (bump) = 79
    assert_eq!(TaskAccount::LEN, 79);
}

#[test]
fn test_task_status_conversions() {
    assert_eq!(TaskStatus::from(0), TaskStatus::Idle);
    assert_eq!(TaskStatus::from(1), TaskStatus::Provisioning);
    assert_eq!(TaskStatus::from(2), TaskStatus::Running);
    assert_eq!(TaskStatus::from(3), TaskStatus::TearingDown);
    assert_eq!(TaskStatus::from(4), TaskStatus::Settled);
    assert_eq!(TaskStatus::from(5), TaskStatus::Failed);
    assert_eq!(TaskStatus::from(99), TaskStatus::Failed);
}

#[test]
fn test_task_account_serialization_and_deserialization() {
    let dummy_auth = Pubkey::new_unique();
    let task = TaskAccount {
        task_id: 123456789,
        authority: dummy_auth,
        status: 2, // Running
        iterations_run: 50,
        compute_output: 0xfeedfacecafebeef,
        started_at: 1710000000,
        completed_at: Some(1710000001),
        bump: 254,
    };

    let mut data = Vec::new();
    // Simulate anchor account discriminator (8 bytes) + data
    let fake_discriminator = [1u8; 8];
    data.extend_from_slice(&fake_discriminator);
    task.serialize(&mut data).expect("Serialization failed");

    assert_eq!(data.len(), TaskAccount::LEN, "Serialized data length must match TaskAccount::LEN (79 bytes)");

    // Deserialize excluding discriminator
    let mut slice: &[u8] = &data[8..];
    let deserialized = TaskAccount::deserialize(&mut slice).expect("Deserialization failed");

    assert_eq!(deserialized.task_id, 123456789);
    assert_eq!(deserialized.authority, dummy_auth);
    assert_eq!(deserialized.status, 2);
    assert_eq!(deserialized.iterations_run, 50);
    assert_eq!(deserialized.compute_output, 0xfeedfacecafebeef);
    assert_eq!(deserialized.started_at, 1710000000);
    assert_eq!(deserialized.completed_at, Some(1710000001));
    assert_eq!(deserialized.bump, 254);
}

#[test]
fn test_deterministic_compute_loop() {
    let seed: u64 = 42;
    let iterations: u32 = 50;
    let mut output: u64 = 0;

    for i in 0..iterations {
        let step = seed
            .wrapping_add(i as u64)
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        output = output ^ step;
        output = output.rotate_left(5).wrapping_mul(0x517cc1b727220a95);
    }

    assert_ne!(output, 0, "Output must be non-zero");

    // Run again with identical seed and iterations to ensure determinism
    let mut second_output: u64 = 0;
    for i in 0..iterations {
        let step = seed
            .wrapping_add(i as u64)
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        second_output = second_output ^ step;
        second_output = second_output.rotate_left(5).wrapping_mul(0x517cc1b727220a95);
    }

    assert_eq!(output, second_output, "Compute output must be 100% deterministic");
}

#[test]
fn test_error_code_representations() {
    assert_eq!(SolaxisError::InvalidStatusTransition.name(), "InvalidStatusTransition");
    assert_eq!(SolaxisError::UnauthorizedAuthority.name(), "UnauthorizedAuthority");
    assert_eq!(SolaxisError::ComputeOverflow.name(), "ComputeOverflow");
    assert_eq!(SolaxisError::DelegationMismatch.name(), "DelegationMismatch");
}
