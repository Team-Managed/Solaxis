import { describe, it, expect, vi } from "vitest";
import { Keypair } from "@solana/web3.js";
import { SolaxisClient } from "../src/client.js";
import { batchRiskSimulator } from "../src/function.js";
import type { TaskStatus, ProgressEvent, TelemetryMetrics } from "@solaxis/shared";

describe("SolaxisClient", () => {
  const dummyKeypair = new Keypair();

  it("instantiates with default configuration and generated keypair", () => {
    const client = new SolaxisClient({ cluster: "devnet" });

    expect(client.getState()).toBe("IDLE");
    expect(client.getPublicKey()).toBeDefined();
    expect(client.getConnection()).toBeDefined();
    expect(client.getProgramId()).toBeDefined();
  });

  it("instantiates with explicit wallet and custom parameters", () => {
    const client = new SolaxisClient({
      wallet: dummyKeypair,
      cluster: "devnet",
    });

    expect(client.getPublicKey().toBase58()).toBe(dummyKeypair.publicKey.toBase58());
  });

  it("attaches event listeners and propagates lifecycle events", async () => {
    const client = new SolaxisClient({
      wallet: dummyKeypair,
    });

    const statusHistory: TaskStatus[] = [];
    const progressList: ProgressEvent[] = [];
    let settledMetrics: TelemetryMetrics | undefined;

    client.on("statusChange", (status) => statusHistory.push(status));
    client.on("progress", (ev) => progressList.push(ev));
    client.on("settled", (m) => {
      settledMetrics = m;
    });

    // Mock the internal controller invoke method
    const mockMetrics: TelemetryMetrics = {
      totalDurationMs: 320,
      spinUpDurationMs: 100,
      erExecutionDurationMs: 140,
      teardownDurationMs: 80,
      iterationsCompleted: 50,
      l1GasSavedPercent: 99.5,
      estimatedL1CostLamports: 250_000,
      actualErCostLamports: 0,
      delegationTxSignature: "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1",
      settlementTxSignature: "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYj7WNQ422P3uQpP1k74v9bBkWz9GkS7P6U5Xk4vK6kQW9jRz1",
      erEndpointUsed: "https://devnet-tee.magicblock.app",
    };

    (client as any).controller.invoke = vi.fn().mockImplementation(async () => {
      // Simulate state transitions
      (client as any).controller.transitionTo("PROVISIONING");
      (client as any).controller.transitionTo("RUNNING");
      (client as any).controller.emitProgress({
        taskId: "test-task",
        currentIteration: 1,
        totalIterations: 50,
        currentOutput: "0x0001",
        timestamp: Date.now(),
      });
      (client as any).controller.transitionTo("TEARING_DOWN");
      (client as any).controller.transitionTo("SETTLED");

      return {
        taskId: "test-task",
        taskPda: dummyKeypair.publicKey,
        status: "SETTLED",
        metrics: mockMetrics,
        computeOutput: "0x0001",
        delegationTxSignature: mockMetrics.delegationTxSignature,
        settlementTxSignature: mockMetrics.settlementTxSignature,
        erEndpoint: mockMetrics.erEndpointUsed,
      };
    });

    const result = await client.invoke(batchRiskSimulator, {
      trials: 50,
    });

    expect(result.status).toBe("SETTLED");
    expect(result.metrics).toEqual(mockMetrics);
    expect(settledMetrics).toEqual(mockMetrics);
    expect(statusHistory).toContain("PROVISIONING");
    expect(statusHistory).toContain("RUNNING");
    expect(statusHistory).toContain("TEARING_DOWN");
    expect(statusHistory).toContain("SETTLED");
    expect(progressList.length).toBe(1);
    expect(progressList[0].currentIteration).toBe(1);
  });

  it("handles errors during invocation and emits error event", async () => {
    const client = new SolaxisClient({
      wallet: dummyKeypair,
    });

    let caughtError: Error | undefined;
    client.on("error", (err) => {
      caughtError = err;
    });

    (client as any).controller.invoke = vi.fn().mockRejectedValue(
      new Error("Simulated delegation RPC rejection")
    );

    await expect(client.invoke(batchRiskSimulator)).rejects.toThrow(
      "Simulated delegation RPC rejection"
    );

    expect(caughtError).toBeDefined();
    expect(caughtError?.message).toBe("Simulated delegation RPC rejection");
  });
});
