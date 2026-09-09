import { z } from "zod";

/**
 * Task execution lifecycle status.
 */
export const TaskStatusSchema = z.enum([
  "IDLE",
  "PROVISIONING",
  "RUNNING",
  "TEARING_DOWN",
  "SETTLED",
  "FAILED",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * Record describing the account delegation on-chain.
 */
export const DelegationRecordSchema = z.object({
  authority: z.string().min(32, "Authority must be a valid Solana public key string"),
  owner: z.string().min(32, "Owner must be a valid Solana public key string"),
  delegationSlot: z.number().int().nonnegative("Delegation slot must be non-negative"),
  lamports: z.number().int().nonnegative("Lamports must be non-negative"),
});

export type DelegationRecord = z.infer<typeof DelegationRecordSchema>;

/**
 * Response structure returned by the MagicBlock Router query getDelegationStatus.
 */
export const DelegationStatusSchema = z.object({
  isDelegated: z.boolean(),
  fqdn: z.string().url("FQDN must be a valid URL").optional(),
  delegationRecord: DelegationRecordSchema.optional(),
});

export type DelegationStatus = z.infer<typeof DelegationStatusSchema>;

/**
 * On-chain representation of a Solaxis Task PDA state.
 */
export const TaskAccountStateSchema = z.object({
  taskId: z.string().min(1, "taskId cannot be empty").max(32, "taskId exceeds maximum seed length (32 bytes)"),
  authority: z.string().min(32, "Authority must be a valid Solana public key string"),
  status: TaskStatusSchema,
  iterationsRun: z.number().int().nonnegative("iterationsRun must be non-negative"),
  computeOutput: z.string(),
  startedAt: z.number().int().positive("startedAt must be a valid positive epoch timestamp"),
  completedAt: z.number().int().positive("completedAt must be a valid positive epoch timestamp").nullable(),
  delegatedValidator: z.string().min(32, "delegatedValidator must be a valid Solana public key").nullable(),
  bump: z.number().int().min(0).max(255, "bump seed must be between 0 and 255"),
});

export type TaskAccountState = z.infer<typeof TaskAccountStateSchema>;
