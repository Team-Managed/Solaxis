import { z } from "zod";

/**
 * Pre-configured task templates.
 */
export const FunctionNameSchema = z.enum([
  "batch-risk-simulator",
  "confidential-state-hasher",
  "session-counter",
]);

export type FunctionName = z.infer<typeof FunctionNameSchema>;

/**
 * Ephemeral execution environment target.
 */
export const TargetValidatorSchema = z.enum([
  "standard-er",
  "confidential-tee",
]);

export type TargetValidator = z.infer<typeof TargetValidatorSchema>;

/**
 * Micro-instance user invocation request configuration.
 */
export const InvocationRequestSchema = z.object({
  functionName: FunctionNameSchema,
  iterations: z.number().int().min(1, "Minimum 1 iteration required").max(200, "Maximum 200 iterations allowed").default(50),
  seed: z.number().int().default(42),
  targetValidator: TargetValidatorSchema.default("confidential-tee"),
});

export type InvocationRequest = z.infer<typeof InvocationRequestSchema>;

/**
 * Real-time event emitted during micro-instance compute execution loop.
 */
export const ProgressEventSchema = z.object({
  taskId: z.string().min(1, "taskId cannot be empty"),
  currentIteration: z.number().int().nonnegative("currentIteration must be non-negative"),
  totalIterations: z.number().int().positive("totalIterations must be positive"),
  currentOutput: z.string(),
  timestamp: z.number().int().positive("timestamp must be a valid positive epoch timestamp"),
});

export type ProgressEvent = z.infer<typeof ProgressEventSchema>;
