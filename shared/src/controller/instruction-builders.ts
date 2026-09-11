import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  delegationRecordPdaFromDelegatedAccount,
  delegationMetadataPdaFromDelegatedAccount,
  delegateBufferPdaFromDelegatedAccountAndOwnerProgram,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import {
  DELEGATION_PROGRAM_ID,
  MAGIC_PROGRAM_ID,
  MAGIC_CONTEXT_ID,
} from "../constants/network.js";
import { TASK_PDA_SEED_PREFIX, taskIdToBigInt } from "../utils/pda.js";

export { taskIdToBigInt } from "../utils/pda.js";

/** Anchor instruction discriminators for solaxis_engine */
export const INSTRUCTION_DISCRIMINATORS = {
  initialize: Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]),
  delegate: Buffer.from([90, 147, 75, 178, 85, 88, 4, 137]),
  executeBatch: Buffer.from([112, 159, 211, 51, 238, 70, 212, 60]),
  undelegate: Buffer.from([131, 148, 180, 198, 91, 104, 42, 238]),
} as const;

export const TASK_SEED_BYTES = Buffer.from(TASK_PDA_SEED_PREFIX, "utf-8");

/**
 * Normalizes an arbitrary taskId (string, number, or bigint) to a 64-bit unsigned integer (bigint).
 */
/**
 * Encodes a 64-bit integer into an 8-byte little-endian Buffer.
 */
export function encodeU64Le(value: bigint | number): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(value));
  return buf;
}

/**
 * Derives the task PDA for the given program, authority, and taskId.
 */
export function deriveTaskAccountPda(
  programId: PublicKey,
  authority: PublicKey,
  taskId: bigint | number | string
): [PublicKey, number] {
  const u64TaskId = taskIdToBigInt(taskId);
  const taskIdBuffer = encodeU64Le(u64TaskId);
  return PublicKey.findProgramAddressSync(
    [TASK_SEED_BYTES, authority.toBuffer(), taskIdBuffer],
    programId
  );
}

/**
 * Builds the `initialize` Anchor instruction.
 */
export function buildInitializeInstruction(params: {
  programId: PublicKey;
  authority: PublicKey;
  taskPda: PublicKey;
  taskId: bigint | number | string;
}): TransactionInstruction {
  const u64TaskId = taskIdToBigInt(params.taskId);
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.initialize,
    encodeU64Le(u64TaskId),
  ]);

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.authority, isSigner: true, isWritable: true },
      { pubkey: params.taskPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Builds the `delegate` Anchor instruction which performs CPI to the MagicBlock Delegation Program.
 */
export function buildDelegateInstruction(params: {
  programId: PublicKey;
  payer: PublicKey;
  taskPda: PublicKey;
  taskId: bigint | number | string;
  targetValidator?: PublicKey;
}): TransactionInstruction {
  const u64TaskId = taskIdToBigInt(params.taskId);
  const delegationProgramId = new PublicKey(DELEGATION_PROGRAM_ID);

  const bufferPda = delegateBufferPdaFromDelegatedAccountAndOwnerProgram(
    params.taskPda,
    params.programId
  );
  const delegationRecordPda = delegationRecordPdaFromDelegatedAccount(params.taskPda);
  const delegationMetadataPda = delegationMetadataPdaFromDelegatedAccount(params.taskPda);

  // Encode arguments: task_id (u64) + Option<Pubkey>
  const taskIdBuf = encodeU64Le(u64TaskId);
  let validatorBuf: Buffer;
  if (params.targetValidator) {
    validatorBuf = Buffer.concat([Buffer.from([1]), params.targetValidator.toBuffer()]);
  } else {
    validatorBuf = Buffer.from([0]);
  }

  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.delegate,
    taskIdBuf,
    validatorBuf,
  ]);

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: bufferPda, isSigner: false, isWritable: true },
      { pubkey: delegationRecordPda, isSigner: false, isWritable: true },
      { pubkey: delegationMetadataPda, isSigner: false, isWritable: true },
      { pubkey: params.taskPda, isSigner: false, isWritable: true },
      { pubkey: params.programId, isSigner: false, isWritable: false },
      { pubkey: delegationProgramId, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Builds the `execute_batch` Anchor instruction to execute compute loops on the Ephemeral Rollup.
 */
export function buildExecuteBatchInstruction(params: {
  programId: PublicKey;
  authority: PublicKey;
  taskPda: PublicKey;
  iterations: number;
  seed: bigint | number;
}): TransactionInstruction {
  const iterationsBuf = Buffer.alloc(4);
  iterationsBuf.writeUInt32LE(params.iterations);
  const seedBuf = encodeU64Le(params.seed);

  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.executeBatch,
    iterationsBuf,
    seedBuf,
  ]);

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.authority, isSigner: true, isWritable: false },
      { pubkey: params.taskPda, isSigner: false, isWritable: true },
    ],
    data,
  });
}

/**
 * Builds the `undelegate` Anchor instruction using MagicIntentBundleBuilder for atomic L1 settlement.
 */
export function buildUndelegateInstruction(params: {
  programId: PublicKey;
  payer: PublicKey;
  taskPda: PublicKey;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: params.taskPda, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(MAGIC_PROGRAM_ID), isSigner: false, isWritable: false },
      { pubkey: new PublicKey(MAGIC_CONTEXT_ID), isSigner: false, isWritable: true },
    ],
    data: INSTRUCTION_DISCRIMINATORS.undelegate,
  });
}
