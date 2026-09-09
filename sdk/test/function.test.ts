import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  defineFunction,
  batchRiskSimulator,
  confidentialStateHasher,
  sessionCounter,
  BUILTIN_FUNCTIONS,
  getBuiltinFunction,
  FUNCTION_NAME_REGEX,
} from "../src/function.js";

describe("defineFunction", () => {
  it("defines a valid custom function with defaults", () => {
    const fn = defineFunction({
      name: "custom-matrix-inverter",
      description: "Inverts high-dimensional matrices in TEE enclave",
    });

    expect(fn.name).toBe("custom-matrix-inverter");
    expect(fn.defaultIterations).toBe(50);
    expect(fn.targetValidator).toBe("confidential-tee");
    expect(fn.inputSchema).toBeDefined();
  });

  it("validates function name adhering to naming regex", () => {
    expect(() =>
      defineFunction({
        name: "Invalid_Name_With_Caps",
        description: "Test",
      })
    ).toThrow(/is invalid/);

    expect(() =>
      defineFunction({
        name: "name with spaces",
        description: "Test",
      })
    ).toThrow(/is invalid/);

    expect(() =>
      defineFunction({
        name: "",
        description: "Test",
      })
    ).toThrow(/must be a non-empty string/);

    expect(FUNCTION_NAME_REGEX.test("valid-function-123")).toBe(true);
  });

  it("enforces defaultIterations between 1 and 200", () => {
    expect(() =>
      defineFunction({
        name: "test-underflow",
        description: "Test",
        defaultIterations: 0,
      })
    ).toThrow(/between 1 and 200/);

    expect(() =>
      defineFunction({
        name: "test-overflow",
        description: "Test",
        defaultIterations: 201,
      })
    ).toThrow(/between 1 and 200/);

    expect(() =>
      defineFunction({
        name: "test-float",
        description: "Test",
        defaultIterations: 50.5,
      })
    ).toThrow(/between 1 and 200/);
  });

  it("attaches inputSchema, outputSchema, and custom handler", async () => {
    const inputSchema = z.object({
      trials: z.number().max(100),
    });
    const outputSchema = z.object({
      result: z.string(),
    });

    const fn = defineFunction({
      name: "sim-runner",
      description: "Custom simulator",
      defaultIterations: 75,
      targetValidator: "standard-er",
      inputSchema,
      outputSchema,
      handler: (ctx) => ({ result: `done-${ctx.iterations}` }),
    });

    expect(fn.defaultIterations).toBe(75);
    expect(fn.targetValidator).toBe("standard-er");
    expect(fn.handler).toBeDefined();

    const output = await fn.handler!({
      input: { trials: 10 },
      iterations: 75,
      seed: 42,
      taskId: "task-01",
    });
    expect(output).toEqual({ result: "done-75" });
  });
});

describe("Built-In Functions Catalog", () => {
  it("includes all 3 canonical function templates", () => {
    expect(BUILTIN_FUNCTIONS.length).toBe(3);
    expect(BUILTIN_FUNCTIONS).toContain(batchRiskSimulator);
    expect(BUILTIN_FUNCTIONS).toContain(confidentialStateHasher);
    expect(BUILTIN_FUNCTIONS).toContain(sessionCounter);
  });

  it("resolves built-in functions by name", () => {
    const resolved = getBuiltinFunction("batch-risk-simulator");
    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("batch-risk-simulator");
    expect(resolved?.targetValidator).toBe("confidential-tee");

    const nonExistent = getBuiltinFunction("does-not-exist");
    expect(nonExistent).toBeUndefined();
  });
});
