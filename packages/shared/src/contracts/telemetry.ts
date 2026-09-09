import { z } from "zod";

/**
 * Base58 regex pattern for Solana transaction signatures (typically 64-88 characters).
 */
const BASE58_SIGNATURE_REGEX = /^[1-9A-HJ-NP-Za-km-z]{64,88}$/;

/**
 * Benchmark and execution telemetry collected across the micro-instance lifecycle.
 */
export const TelemetryMetricsSchema = z.object({
  totalDurationMs: z.number().positive("totalDurationMs must be positive"),
  spinUpDurationMs: z.number().nonnegative("spinUpDurationMs must be non-negative"),
  erExecutionDurationMs: z.number().nonnegative("erExecutionDurationMs must be non-negative"),
  teardownDurationMs: z.number().nonnegative("teardownDurationMs must be non-negative"),
  iterationsCompleted: z.number().int().nonnegative("iterationsCompleted must be non-negative"),
  l1GasSavedPercent: z.number().min(0, "Gas saved percent must be >= 0").max(100, "Gas saved percent cannot exceed 100"),
  estimatedL1CostLamports: z.number().int().nonnegative("estimatedL1CostLamports must be non-negative"),
  actualErCostLamports: z.literal(0, {
    errorMap: () => ({ message: "actualErCostLamports must be strictly 0 for Ephemeral Rollup execution" }),
  }),
  delegationTxSignature: z.string().regex(BASE58_SIGNATURE_REGEX, "delegationTxSignature must be a valid Solana Base58 signature"),
  settlementTxSignature: z.string().regex(BASE58_SIGNATURE_REGEX, "settlementTxSignature must be a valid Solana Base58 signature"),
  erEndpointUsed: z.string().url("erEndpointUsed must be a valid URL"),
});

export type TelemetryMetrics = z.infer<typeof TelemetryMetricsSchema>;
