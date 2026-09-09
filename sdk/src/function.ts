import { z } from "zod";
import { type TargetValidator, FUNCTION_NAME_REGEX } from "@solaxis/shared";

export { FUNCTION_NAME_REGEX };

/**
 * Execution context passed to custom execution handlers.
 */
export interface FunctionExecutionContext<TInput = unknown> {
  input: TInput;
  iterations: number;
  seed: number;
  taskId: string;
}

/**
 * Declarative configuration structure for custom serverless micro-instance functions.
 */
export interface FunctionConfig<TInput = any, TOutput = any> {
  /** Unique function identifier (e.g. "batch-risk-simulator") */
  name: string;
  /** Human-readable explanation of function's purpose */
  description: string;
  /** Zod schema validating input arguments */
  inputSchema?: z.ZodType<TInput>;
  /** Optional Zod schema validating compute output */
  outputSchema?: z.ZodType<TOutput>;
  /** Default execution iteration count (1 to 200) */
  defaultIterations?: number;
  /** Target execution validator (standard-er or confidential-tee) */
  targetValidator?: TargetValidator;
  /** Optional custom client-side compute execution hook */
  handler?: (context: FunctionExecutionContext<TInput>) => Promise<TOutput> | TOutput;
}

/**
 * Sealed, validated function definition.
 */
export interface FunctionDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema?: z.ZodType<TOutput>;
  defaultIterations: number;
  targetValidator: TargetValidator;
  handler?: (context: FunctionExecutionContext<TInput>) => Promise<TOutput> | TOutput;
}

/**
 * Helper to define and validate a Solaxis serverless micro-instance function.
 */
export function defineFunction<TInput = any, TOutput = any>(
  config: FunctionConfig<TInput, TOutput>
): FunctionDefinition<TInput, TOutput> {
  if (!config.name || typeof config.name !== "string") {
    throw new Error("Function name must be a non-empty string");
  }

  if (!FUNCTION_NAME_REGEX.test(config.name)) {
    throw new Error(
      `Function name "${config.name}" is invalid. Names must contain only lowercase alphanumeric characters and hyphens (e.g. "my-custom-task").`
    );
  }

  const defaultIterations = config.defaultIterations ?? 50;
  if (
    !Number.isInteger(defaultIterations) ||
    defaultIterations < 1 ||
    defaultIterations > 200
  ) {
    throw new Error(
      `Invalid defaultIterations: ${defaultIterations}. Must be an integer between 1 and 200.`
    );
  }

  return {
    name: config.name,
    description: config.description ?? "",
    inputSchema: config.inputSchema ?? (z.any() as z.ZodType<TInput>),
    outputSchema: config.outputSchema,
    defaultIterations,
    targetValidator: config.targetValidator ?? "confidential-tee",
    handler: config.handler,
  };
}

// =========================================================================
// Built-In Function Templates
// =========================================================================

export const batchRiskSimulator = defineFunction({
  name: "batch-risk-simulator",
  description: "High-frequency Monte Carlo risk calculation executed inside Intel TDX TEE enclave",
  defaultIterations: 50,
  targetValidator: "confidential-tee",
  inputSchema: z.object({
    portfolioId: z.string().default("default-vault"),
    trials: z.number().int().min(1).max(200).default(50),
  }),
});

export const confidentialStateHasher = defineFunction({
  name: "confidential-state-hasher",
  description: "Zero-knowledge hash chain state accumulator in TEE memory",
  defaultIterations: 100,
  targetValidator: "confidential-tee",
  inputSchema: z.object({
    seed: z.number().int().default(42),
    rounds: z.number().int().min(1).max(200).default(100),
  }),
});

export const sessionCounter = defineFunction({
  name: "session-counter",
  description: "Sub-10ms ephemeral session counter with atomic L1 teardown",
  defaultIterations: 25,
  targetValidator: "standard-er",
  inputSchema: z.object({
    initialCount: z.number().int().default(0),
    increments: z.number().int().min(1).max(200).default(25),
  }),
});

export const BUILTIN_FUNCTIONS: FunctionDefinition[] = [
  batchRiskSimulator,
  confidentialStateHasher,
  sessionCounter,
];

export function getBuiltinFunction(name: string): FunctionDefinition | undefined {
  return BUILTIN_FUNCTIONS.find((fn) => fn.name === name);
}
