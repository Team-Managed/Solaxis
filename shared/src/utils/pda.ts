import { PublicKey } from "@solana/web3.js";

export const TASK_PDA_SEED_PREFIX = "solaxis_task" as const;
export const MAX_SEED_LENGTH = 32 as const;

export interface DerivedPdaResult {
  pda: PublicKey;
  bump: number;
}

export function taskIdToBigInt(taskId: string | number | bigint): bigint {
  if (typeof taskId === "bigint") return taskId;
  if (typeof taskId === "number") return BigInt(Math.floor(taskId));
  if (/^\d+$/.test(taskId)) return BigInt(taskId);

  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (const byte of Buffer.from(taskId, "utf-8")) {
    hash = ((hash ^ BigInt(byte)) * prime) & 0xffffffffffffffffn;
  }
  return hash;
}

/**
 * Derives the Task PDA for a given programId, authority, and taskId.
 * Seeds: [b"solaxis_task", authority.key(), taskId.as_bytes()]
 * 
 * Validates that seeds conform to Solana PDA constraints (max 32 bytes per seed).
 */
export function deriveTaskPda(
  programId: PublicKey | string,
  authority: PublicKey | string,
  taskId: string
): DerivedPdaResult {
  if (!taskId || typeof taskId !== "string") {
    throw new Error("taskId must be a non-empty string");
  }

  const taskIdBuffer = Buffer.from(taskId, "utf-8");
  if (taskIdBuffer.length === 0) throw new Error("taskId buffer must not be empty");
  if (taskIdBuffer.length > MAX_SEED_LENGTH) {
    throw new Error(`taskId seed byte length (${taskIdBuffer.length}) exceeds Solana maximum seed length limit (${MAX_SEED_LENGTH} bytes)`);
  }

  const programPubKey = typeof programId === "string" ? new PublicKey(programId) : programId;
  const authorityPubKey = typeof authority === "string" ? new PublicKey(authority) : authority;
  const prefixBuffer = Buffer.from(TASK_PDA_SEED_PREFIX, "utf-8");

  if (prefixBuffer.length > MAX_SEED_LENGTH) {
    throw new Error(`Prefix seed exceeds maximum seed length (${MAX_SEED_LENGTH} bytes)`);
  }

  const encodedTaskId = Buffer.alloc(8);
  encodedTaskId.writeBigUInt64LE(taskIdToBigInt(taskId));

  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      prefixBuffer,
      authorityPubKey.toBuffer(),
      encodedTaskId,
    ],
    programPubKey
  );

  return { pda, bump };
}
