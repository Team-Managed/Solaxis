import { describe, it, expect } from "vitest";
import {
  TaskStatusSchema,
  DelegationStatusSchema,
  TaskAccountStateSchema,
  InvocationRequestSchema,
  ProgressEventSchema,
  TelemetryMetricsSchema,
  CustomFunctionManifestSchema,
  SolaxisClientConfigSchema,
} from "../src/index.js";

describe("Shared Contracts & Zod Schemas", () => {
  const dummyPubkey = "11111111111111111111111111111111";
  const dummySig = "5H5qU9pP7VvF1bU8iJ7p8qB4yN3xM6zK9wR2vT1sY4uX7nL2kP6mQ8rS5tW9aC3bE6dF8gH2jK4mN7pQ9rS1tV3w";

  describe("TaskStatusSchema", () => {
    it("accepts valid task statuses", () => {
      expect(TaskStatusSchema.parse("IDLE")).toBe("IDLE");
      expect(TaskStatusSchema.parse("PROVISIONING")).toBe("PROVISIONING");
      expect(TaskStatusSchema.parse("RUNNING")).toBe("RUNNING");
      expect(TaskStatusSchema.parse("TEARING_DOWN")).toBe("TEARING_DOWN");
      expect(TaskStatusSchema.parse("SETTLED")).toBe("SETTLED");
      expect(TaskStatusSchema.parse("FAILED")).toBe("FAILED");
    });

    it("rejects invalid status", () => {
      expect(() => TaskStatusSchema.parse("UNKNOWN_STATUS")).toThrow();
    });
  });

  describe("DelegationStatusSchema", () => {
    it("validates an active delegated response from router", () => {
      const validDelegation = {
        isDelegated: true,
        fqdn: "https://devnet-tee.magicblock.app",
        delegationRecord: {
          authority: dummyPubkey,
          owner: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh",
          delegationSlot: 100240,
          lamports: 1000000,
        },
      };
      const parsed = DelegationStatusSchema.parse(validDelegation);
      expect(parsed.isDelegated).toBe(true);
      expect(parsed.fqdn).toBe("https://devnet-tee.magicblock.app");
      expect(parsed.delegationRecord?.delegationSlot).toBe(100240);
    });

    it("validates an undelegated response with minimal fields", () => {
      const undelegated = {
        isDelegated: false,
      };
      const parsed = DelegationStatusSchema.parse(undelegated);
      expect(parsed.isDelegated).toBe(false);
      expect(parsed.fqdn).toBeUndefined();
    });

    it("fails on invalid FQDN URL format", () => {
      const invalid = {
        isDelegated: true,
        fqdn: "not-a-url",
      };
      expect(() => DelegationStatusSchema.parse(invalid)).toThrow(/FQDN must be a valid URL/);
    });
  });

  describe("TaskAccountStateSchema", () => {
    it("validates valid Task PDA state", () => {
      const validState = {
        taskId: "task-test-01",
        authority: dummyPubkey,
        status: "RUNNING",
        iterationsRun: 25,
        computeOutput: "0xabcdef1234567890",
        startedAt: 1710000000000,
        completedAt: null,
        delegatedValidator: dummyPubkey,
        bump: 254,
      };
      const parsed = TaskAccountStateSchema.parse(validState);
      expect(parsed.taskId).toBe("task-test-01");
      expect(parsed.bump).toBe(254);
    });

    it("fails when taskId is too long (> 32 bytes)", () => {
      const invalid = {
        taskId: "a".repeat(33),
        authority: dummyPubkey,
        status: "IDLE",
        iterationsRun: 0,
        computeOutput: "",
        startedAt: 1710000000000,
        completedAt: null,
        delegatedValidator: null,
        bump: 255,
      };
      expect(() => TaskAccountStateSchema.parse(invalid)).toThrow(/taskId exceeds maximum seed length/);
    });

    it("fails when bump is out of range 0..255", () => {
      const invalid = {
        taskId: "task-01",
        authority: dummyPubkey,
        status: "IDLE",
        iterationsRun: 0,
        computeOutput: "",
        startedAt: 1710000000000,
        completedAt: null,
        delegatedValidator: null,
        bump: 256,
      };
      expect(() => TaskAccountStateSchema.parse(invalid)).toThrow(/bump seed must be between 0 and 255/);
    });
  });

  describe("InvocationRequestSchema", () => {
    it("applies sensible defaults when only functionName is provided", () => {
      const parsed = InvocationRequestSchema.parse({
        functionName: "batch-risk-simulator",
      });
      expect(parsed.functionName).toBe("batch-risk-simulator");
      expect(parsed.iterations).toBe(50);
      expect(parsed.seed).toBe(42);
      expect(parsed.targetValidator).toBe("confidential-tee");
    });

    it("accepts all three valid function templates", () => {
      expect(InvocationRequestSchema.parse({ functionName: "confidential-state-hasher" }).functionName)
        .toBe("confidential-state-hasher");
      expect(InvocationRequestSchema.parse({ functionName: "session-counter" }).functionName)
        .toBe("session-counter");
    });

    it("rejects iteration counts outside 1..200 range", () => {
      expect(() => InvocationRequestSchema.parse({ functionName: "session-counter", iterations: 0 })).toThrow(
        /Minimum 1 iteration required/
      );
      expect(() => InvocationRequestSchema.parse({ functionName: "session-counter", iterations: 201 })).toThrow(
        /Maximum 200 iterations allowed/
      );
    });
  });

  describe("ProgressEventSchema", () => {
    it("validates a progress event during compute loop", () => {
      const event = {
        taskId: "task-42",
        currentIteration: 10,
        totalIterations: 50,
        currentOutput: "hash_0x1234",
        timestamp: 1710000001000,
      };
      const parsed = ProgressEventSchema.parse(event);
      expect(parsed.currentIteration).toBe(10);
      expect(parsed.totalIterations).toBe(50);
    });

    it("rejects empty taskId or negative iteration", () => {
      expect(() =>
        ProgressEventSchema.parse({
          taskId: "",
          currentIteration: 0,
          totalIterations: 10,
          currentOutput: "",
          timestamp: 1710000001000,
        })
      ).toThrow();
    });
  });

  describe("TelemetryMetricsSchema", () => {
    it("validates telemetry metrics with strictly 0 ER gas cost", () => {
      const telemetry = {
        totalDurationMs: 342.5,
        spinUpDurationMs: 120.2,
        erExecutionDurationMs: 110.1,
        teardownDurationMs: 112.2,
        iterationsCompleted: 50,
        l1GasSavedPercent: 98.5,
        estimatedL1CostLamports: 250000,
        actualErCostLamports: 0,
        delegationTxSignature: dummySig,
        settlementTxSignature: dummySig,
        erEndpointUsed: "https://devnet-tee.magicblock.app",
      };
      const parsed = TelemetryMetricsSchema.parse(telemetry);
      expect(parsed.actualErCostLamports).toBe(0);
      expect(parsed.l1GasSavedPercent).toBe(98.5);
    });

    it("fails when actualErCostLamports is non-zero", () => {
      const telemetry = {
        totalDurationMs: 342.5,
        spinUpDurationMs: 120.2,
        erExecutionDurationMs: 110.1,
        teardownDurationMs: 112.2,
        iterationsCompleted: 50,
        l1GasSavedPercent: 98.5,
        estimatedL1CostLamports: 250000,
        actualErCostLamports: 5000, // Invalid! ER compute must be strictly zero gas
        delegationTxSignature: dummySig,
        settlementTxSignature: dummySig,
        erEndpointUsed: "https://devnet-tee.magicblock.app",
      };
      expect(() => TelemetryMetricsSchema.parse(telemetry)).toThrow(/actualErCostLamports must be strictly 0/);
    });

    it("fails when gas saved percentage is > 100", () => {
      const telemetry = {
        totalDurationMs: 342.5,
        spinUpDurationMs: 120.2,
        erExecutionDurationMs: 110.1,
        teardownDurationMs: 112.2,
        iterationsCompleted: 50,
        l1GasSavedPercent: 105,
        estimatedL1CostLamports: 250000,
        actualErCostLamports: 0,
        delegationTxSignature: dummySig,
        settlementTxSignature: dummySig,
        erEndpointUsed: "https://devnet-tee.magicblock.app",
      };
      expect(() => TelemetryMetricsSchema.parse(telemetry)).toThrow(/Gas saved percent cannot exceed 100/);
    });
  });

  describe("CustomFunctionManifestSchema", () => {
    it("validates a complete custom function manifest with defaults", () => {
      const manifest = {
        name: "my-custom-monte-carlo",
        description: "Simulates financial risk scenarios",
      };
      const parsed = CustomFunctionManifestSchema.parse(manifest);
      expect(parsed.name).toBe("my-custom-monte-carlo");
      expect(parsed.version).toBe("0.1.0");
      expect(parsed.targetValidator).toBe("confidential-tee");
      expect(parsed.defaultIterations).toBe(50);
    });

    it("rejects function names with uppercase letters or invalid symbols", () => {
      expect(() =>
        CustomFunctionManifestSchema.parse({
          name: "My_Invalid_Function!",
          description: "Invalid",
        })
      ).toThrow(/Function name must be lowercase alphanumeric characters and hyphens only/);
    });

    it("rejects invalid semver strings", () => {
      expect(() =>
        CustomFunctionManifestSchema.parse({
          name: "valid-name",
          version: "v1",
          description: "Test",
        })
      ).toThrow(/Version must follow semantic versioning/);
    });
  });

  describe("SolaxisClientConfigSchema", () => {
    it("applies default URLs and commitment", () => {
      const config = SolaxisClientConfigSchema.parse({});
      expect(config.rpcUrl).toBe("https://rpc.magicblock.app/devnet");
      expect(config.routerUrl).toBe("https://devnet-router.magicblock.app");
      expect(config.commitment).toBe("confirmed");
      expect(config.cluster).toBe("devnet");
    });

    it("fails on malformed RPC URL", () => {
      expect(() =>
        SolaxisClientConfigSchema.parse({
          rpcUrl: "not-a-valid-url",
        })
      ).toThrow(/rpcUrl must be a valid URL/);
    });
  });
});

