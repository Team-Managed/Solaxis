import { z } from "zod";
import { TargetValidatorSchema } from "./invocation.js";
import { DEVNET_BASE_RPC_URL, MAGICBLOCK_DEVNET_ROUTER_URL } from "../constants/network.js";

/**
 * Regex for valid function identifiers: lowercase alphanumeric and hyphens.
 */
export const FUNCTION_NAME_REGEX = /^[a-z0-9-]+$/;

/**
 * Regex for semantic version strings (e.g. 0.1.0).
 */
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Manifest describing a custom user-defined Solaxis serverless function.
 */
export const CustomFunctionManifestSchema = z.object({
  name: z
    .string()
    .min(1, "Function name cannot be empty")
    .max(64, "Function name exceeds 64 characters")
    .regex(FUNCTION_NAME_REGEX, "Function name must be lowercase alphanumeric characters and hyphens only"),
  version: z
    .string()
    .regex(SEMVER_REGEX, "Version must follow semantic versioning (e.g. 1.0.0)")
    .default("0.1.0"),
  description: z.string().min(1, "Description cannot be empty"),
  targetValidator: TargetValidatorSchema.default("confidential-tee"),
  defaultIterations: z
    .number()
    .int()
    .min(1, "Minimum 1 iteration required")
    .max(200, "Maximum 200 iterations allowed")
    .default(50),
  entrypoint: z.string().optional(),
  programId: z.string().min(32, "programId must be a valid Solana address string").optional(),
});

export type CustomFunctionManifest = z.infer<typeof CustomFunctionManifestSchema>;

/**
 * Configuration options for initializing a SolaxisClient instance.
 */
export const SolaxisClientConfigSchema = z.object({
  rpcUrl: z.string().url("rpcUrl must be a valid URL").default(DEVNET_BASE_RPC_URL),
  routerUrl: z.string().url("routerUrl must be a valid URL").default(MAGICBLOCK_DEVNET_ROUTER_URL),
  commitment: z.enum(["processed", "confirmed", "finalized"]).default("confirmed"),
  cluster: z.enum(["devnet", "localnet", "custom"]).default("devnet"),
});

export type SolaxisClientConfig = z.infer<typeof SolaxisClientConfigSchema>;

/**
 * Lifecycle hook event names emitted by the SDK client.
 */
export const LifecycleEventNameSchema = z.enum([
  "statusChange",
  "progress",
  "log",
  "settled",
  "error",
]);

export type LifecycleEventName = z.infer<typeof LifecycleEventNameSchema>;
