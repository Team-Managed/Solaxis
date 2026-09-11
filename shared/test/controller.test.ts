import { describe, it, expect, vi } from "vitest";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  type AccountInfo,
} from "@solana/web3.js";

import {
  LifecycleController,
  DEFAULT_PROGRAM_ID,
  ESTIMATED_L1_COMPUTE_COST_PER_ITERATION,
} from "../src/controller/lifecycle-controller.js";
import {
  INSTRUCTION_DISCRIMINATORS,
  buildInitializeInstruction,
  buildDelegateInstruction,
  buildExecuteBatchInstruction,
  buildUndelegateInstruction,
  deriveTaskAccountPda,
  taskIdToBigInt,
  encodeU64Le,
} from "../src/controller/instruction-builders.js";
import {
  DELEGATION_PROGRAM_ID,
  MAGIC_PROGRAM_ID,
  MAGIC_CONTEXT_ID,
  MAGICBLOCK_DEVNET_TEE_VALIDATOR_PUBKEY,
  MAGICBLOCK_DEVNET_TEE_VALIDATOR_URL,
} from "../src/constants/network.js";
import { TelemetryMetricsSchema } from "../src/contracts/telemetry.js";
import type { TaskStatus } from "../src/contracts/task.js";
import type { ProgressEvent } from "../src/contracts/invocation.js";

describe("Instruction Builders", () => {
  const dummyProgramId = new PublicKey("CcXRe1NVN8fQ2jKyuNhzqZSsVbc6TuVn9SeShapCpb73");
  const dummyAuthority = new Keypair().publicKey;
  const dummyTaskPda = new Keypair().publicKey;
  const dummyValidator = new PublicKey(MAGICBLOCK_DEVNET_TEE_VALIDATOR_PUBKEY);

  it("builds initialize instruction with valid accounts and 16-byte data", () => {
    const ix = buildInitializeInstruction({
      programId: dummyProgramId,
      authority: dummyAuthority,
      taskPda: dummyTaskPda,
      taskId: 42,
    });

    expect(ix.programId.toBase58()).toBe(dummyProgramId.toBase58());
    expect(ix.keys.length).toBe(3);
    expect(ix.keys[0]).toEqual({ pubkey: dummyAuthority, isSigner: true, isWritable: true });
    expect(ix.keys[1]).toEqual({ pubkey: dummyTaskPda, isSigner: false, isWritable: true });
    expect(ix.keys[2]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false });

    // 8 bytes discriminator + 8 bytes u64 task_id
    expect(ix.data.length).toBe(16);
    expect(ix.data.subarray(0, 8)).toEqual(INSTRUCTION_DISCRIMINATORS.initialize);
    expect(ix.data.readBigUInt64LE(8)).toBe(42n);
  });
  it("builds delegate instruction with CPI delegation accounts", () => {
    const ix = buildDelegateInstruction({
      programId: dummyProgramId,
      payer: dummyAuthority,
      taskPda: dummyTaskPda,
      taskId: 101,
      targetValidator: dummyValidator,
    });

    expect(ix.programId.toBase58()).toBe(dummyProgramId.toBase58());
    // payer, buffer, record, metadata, task_pda, owner_program, delegation_program, system_program
    expect(ix.keys.length).toBe(8);
    expect(ix.keys[0].pubkey.toBase58()).toBe(dummyAuthority.toBase58());
    expect(ix.keys[4].pubkey.toBase58()).toBe(dummyTaskPda.toBase58());
    expect(ix.keys[5].pubkey.toBase58()).toBe(dummyProgramId.toBase58());
    expect(ix.keys[6].pubkey.toBase58()).toBe(DELEGATION_PROGRAM_ID);
    expect(ix.keys[7].pubkey.toBase58()).toBe(SystemProgram.programId.toBase58());

    // 8 bytes discriminator + 8 bytes u64 task_id + 1 byte option tag (1) + 32 bytes validator
    expect(ix.data.length).toBe(49);
    expect(ix.data.subarray(0, 8)).toEqual(INSTRUCTION_DISCRIMINATORS.delegate);
    expect(ix.data.readBigUInt64LE(8)).toBe(101n);
    expect(ix.data[16]).toBe(1); // Some
    expect(ix.data.subarray(17, 49)).toEqual(dummyValidator.toBuffer());
  });

  it("builds execute_batch instruction with 20-byte payload", () => {
    const ix = buildExecuteBatchInstruction({
      programId: dummyProgramId,
      authority: dummyAuthority,
      taskPda: dummyTaskPda,
      iterations: 50,
      seed: 12345678n,
    });

    expect(ix.programId.toBase58()).toBe(dummyProgramId.toBase58());
    expect(ix.keys.length).toBe(2);
    expect(ix.keys[0]).toEqual({ pubkey: dummyAuthority, isSigner: true, isWritable: false });
    expect(ix.keys[1]).toEqual({ pubkey: dummyTaskPda, isSigner: false, isWritable: true });

    // 8 bytes discriminator + 4 bytes iterations (u32) + 8 bytes seed (u64)
    expect(ix.data.length).toBe(20);
    expect(ix.data.subarray(0, 8)).toEqual(INSTRUCTION_DISCRIMINATORS.executeBatch);
    expect(ix.data.readUInt32LE(8)).toBe(50);
    expect(ix.data.readBigUInt64LE(12)).toBe(12345678n);
  });

  it("builds undelegate instruction with MagicBlock intent accounts", () => {
    const ix = buildUndelegateInstruction({
      programId: dummyProgramId,
      payer: dummyAuthority,
      taskPda: dummyTaskPda,
    });

    expect(ix.programId.toBase58()).toBe(dummyProgramId.toBase58());
    expect(ix.keys.length).toBe(4);
    expect(ix.keys[0]).toEqual({ pubkey: dummyAuthority, isSigner: true, isWritable: true });
    expect(ix.keys[1]).toEqual({ pubkey: dummyTaskPda, isSigner: false, isWritable: true });
    expect(ix.keys[2].pubkey.toBase58()).toBe(MAGIC_PROGRAM_ID);
    expect(ix.keys[3]).toEqual({ pubkey: new PublicKey(MAGIC_CONTEXT_ID), isSigner: false, isWritable: true });
    expect(ix.data).toEqual(INSTRUCTION_DISCRIMINATORS.undelegate);
  });
});

describe("PDA Derivation & Normalization", () => {
  const dummyProgramId = DEFAULT_PROGRAM_ID;
  const dummyAuthority = new Keypair().publicKey;

  it("normalizes string digits, numbers, and bigints equivalently", () => {
    expect(taskIdToBigInt(42)).toBe(42n);
    expect(taskIdToBigInt("42")).toBe(42n);
    expect(taskIdToBigInt(42n)).toBe(42n);
  });

  it("hashes arbitrary non-numeric string taskIds deterministically", () => {
    const hash1 = taskIdToBigInt("monte-carlo-task-1");
    const hash2 = taskIdToBigInt("monte-carlo-task-1");
    const hash3 = taskIdToBigInt("monte-carlo-task-2");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(typeof hash1).toBe("bigint");
  });

  it("derives valid deterministic Task PDA from numeric and string IDs", () => {
    const [pda1, bump1] = deriveTaskAccountPda(dummyProgramId, dummyAuthority, 42);
    const [pda2, bump2] = deriveTaskAccountPda(dummyProgramId, dummyAuthority, "42");

    expect(pda1.toBase58()).toBe(pda2.toBase58());
    expect(bump1).toBe(bump2);
    expect(bump1).toBeGreaterThanOrEqual(0);
    expect(bump1).toBeLessThanOrEqual(255);
  });
});

describe("LifecycleController", () => {
  const keypair = new Keypair();

  function createMockConnection(overrides: Partial<any> = {}) {
    return {
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
        lastValidBlockHeight: 12345,
      }),
      sendTransaction: vi.fn().mockResolvedValue(
        "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1"
      ),
      sendRawTransaction: vi.fn().mockResolvedValue(
        "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1"
      ),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
      getAccountInfo: vi.fn().mockResolvedValue(null),
      ...overrides,
    } as any;
  }

  it("initializes in IDLE state with default program and validator", () => {
    const mockConn = createMockConnection();
    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    expect(controller.getState()).toBe("IDLE");
    expect(controller.getPublicKey().toBase58()).toBe(keypair.publicKey.toBase58());
    expect(controller.getProgramId().toBase58()).toBe(DEFAULT_PROGRAM_ID.toBase58());
  });

  it("subscribes and receives state transition events", () => {
    const mockConn = createMockConnection();
    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    const stateChanges: Array<{ next: TaskStatus; prev: TaskStatus }> = [];
    const unsubscribe = controller.onStateChange((next, prev) => {
      stateChanges.push({ next, prev });
    });

    // Access private transition for testing state machine observer
    (controller as any).transitionTo("PROVISIONING");
    (controller as any).transitionTo("RUNNING");
    (controller as any).transitionTo("TEARING_DOWN");
    (controller as any).transitionTo("SETTLED");

    expect(stateChanges).toEqual([
      { next: "PROVISIONING", prev: "IDLE" },
      { next: "RUNNING", prev: "PROVISIONING" },
      { next: "TEARING_DOWN", prev: "RUNNING" },
      { next: "SETTLED", prev: "TEARING_DOWN" },
    ]);

    unsubscribe();
    (controller as any).transitionTo("IDLE");
    expect(stateChanges.length).toBe(4); // No new events after unsubscribe
  });

  it("calculates telemetry metrics strictly conforming to TelemetryMetricsSchema", () => {
    const mockConn = createMockConnection();
    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    // Inject fake durations
    (controller as any).spinUpDurationMs = 120.5;
    (controller as any).erExecutionDurationMs = 210.2;
    (controller as any).teardownDurationMs = 95.3;

    const fakeSig = "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1";
    const metrics = controller.calculateTelemetryMetrics({
      iterations: 50,
      delegationTxSignature: fakeSig,
      settlementTxSignature: fakeSig,
      erEndpointUsed: MAGICBLOCK_DEVNET_TEE_VALIDATOR_URL,
    });

    expect(metrics.totalDurationMs).toBe(426);
    expect(metrics.spinUpDurationMs).toBe(120.5);
    expect(metrics.erExecutionDurationMs).toBe(210.2);
    expect(metrics.teardownDurationMs).toBe(95.3);
    expect(metrics.iterationsCompleted).toBe(50);
    expect(metrics.actualErCostLamports).toBe(0);
    expect(metrics.estimatedL1CostLamports).toBe(50 * ESTIMATED_L1_COMPUTE_COST_PER_ITERATION);
    expect(metrics.l1GasSavedPercent).toBe(100);

    // Strict schema parse assertion
    const validated = TelemetryMetricsSchema.parse(metrics);
    expect(validated).toEqual(metrics);
  });

  it("skips on-chain initialization if account already exists", async () => {
    const mockConn = createMockConnection({
      getAccountInfo: vi.fn().mockResolvedValue({
        data: Buffer.alloc(79),
        executable: false,
        lamports: 1_000_000,
        owner: DEFAULT_PROGRAM_ID,
      } as AccountInfo<Buffer>),
    });

    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    const result = await controller.initializeTask(999);
    expect(result.alreadyInitialized).toBe(true);
    expect(result.signature).toBeUndefined();
    expect(mockConn.sendRawTransaction).not.toHaveBeenCalled();
  });

  it("emits live progress events during executeEphemeralLoop simulation", async () => {
    const mockConn = createMockConnection();
    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    // Mock signAndSendTransaction
    (controller as any).signAndSendTransaction = vi.fn().mockResolvedValue(
      "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1"
    );

    const progressEvents: ProgressEvent[] = [];
    controller.onProgress((event) => {
      progressEvents.push(event);
    });

    const [dummyTaskPda] = deriveTaskAccountPda(DEFAULT_PROGRAM_ID, keypair.publicKey, 1);
    const result = await controller.executeEphemeralLoop(
      MAGICBLOCK_DEVNET_TEE_VALIDATOR_URL,
      dummyTaskPda,
      {
        functionName: "batch-risk-simulator",
        iterations: 10,
        seed: 42,
        targetValidator: "confidential-tee",
      }
    );

    expect(result.iterationsRun).toBe(10);
    expect(result.computeOutput).toMatch(/^0x[0-9a-f]{16}$/);
    expect(progressEvents.length).toBe(10);
    expect(progressEvents[0].currentIteration).toBe(1);
    expect(progressEvents[9].currentIteration).toBe(10);
  });

  it("transitions to FAILED and rethrows on invocation error", async () => {
    const mockConn = createMockConnection({
      sendTransaction: vi.fn().mockRejectedValue(new Error("Simulated RPC transport drop")),
      sendRawTransaction: vi.fn().mockRejectedValue(new Error("Simulated RPC transport drop")),
    });

    const controller = new LifecycleController({
      baseConnection: mockConn,
      wallet: keypair,
    });

    const errors: string[] = [];
    controller.onLog((level, msg) => {
      if (level === "ERROR") errors.push(msg);
    });

    await expect(controller.invoke({ taskId: 12345 })).rejects.toThrow("Simulated RPC transport drop");
    expect(controller.getState()).toBe("FAILED");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Lifecycle invocation failed");
  });
});
