import { z } from "zod";
import { DEVNET_BASE_RPC_URL, MAGICBLOCK_DEVNET_ROUTER_URL } from "./constants/network.js";

/**
 * Environment variables for the CLI runtime.
 */
export const cliEnvSchema = z.object({
  SOLANA_RPC_URL: z
    .string()
    .url("SOLANA_RPC_URL must be a valid URL")
    .default(DEVNET_BASE_RPC_URL),
  KEYPAIR_PATH: z
    .string()
    .min(1, "KEYPAIR_PATH must be a valid filesystem path")
    .optional(),
  MAGICBLOCK_ROUTER_URL: z
    .string()
    .url("MAGICBLOCK_ROUTER_URL must be a valid URL")
    .default(MAGICBLOCK_DEVNET_ROUTER_URL),
});

export type CliEnv = z.infer<typeof cliEnvSchema>;

/**
 * Environment variables for the Web Console (Next.js) runtime.
 */
export const appEnvSchema = z.object({
  NEXT_PUBLIC_SOLANA_RPC_URL: z
    .string()
    .url("NEXT_PUBLIC_SOLANA_RPC_URL must be a valid URL")
    .default(DEVNET_BASE_RPC_URL),
  NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL: z
    .string()
    .url("NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL must be a valid URL")
    .default(MAGICBLOCK_DEVNET_ROUTER_URL),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

/**
 * Validates environment record against a schema.
 * Throws a formatted Error detailing invalid fields if validation fails.
 */
export function validateEnv<T>(schema: z.ZodType<T>, env: Record<string, unknown>): T {
  const result = schema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errorDetails}`);
  }
  return result.data;
}
