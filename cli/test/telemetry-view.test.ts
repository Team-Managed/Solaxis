import { describe, it, expect } from "vitest";
import { renderTelemetryView } from "../src/views/telemetry-view.js";
import type { TelemetryMetrics } from "@solaxis/shared";

describe("renderTelemetryView", () => {
  const sampleMetrics: TelemetryMetrics = {
    totalDurationMs: 450,
    spinUpDurationMs: 120,
    erExecutionDurationMs: 230,
    teardownDurationMs: 100,
    iterationsCompleted: 50,
    l1GasSavedPercent: 99.4,
    estimatedL1CostLamports: 250_000,
    actualErCostLamports: 0,
    delegationTxSignature: "4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM",
    settlementTxSignature: "2xY9bM4L68u7N99h9xT69k3mK38qR7b9xT69k3mK38q2xY9bM4L68u7N99h9xT69k3mK38qR7b9xT69k3mK38q",
    erEndpointUsed: "https://devnet-tee.magicblock.app",
  };

  it("renders raw JSON when json option is true", () => {
    const output = renderTelemetryView(sampleMetrics, { json: true });
    const parsed = JSON.parse(output);

    expect(parsed.totalDurationMs).toBe(450);
    expect(parsed.iterationsCompleted).toBe(50);
    expect(parsed.l1GasSavedPercent).toBe(99.4);
    expect(parsed.actualErCostLamports).toBe(0);
  });

  it("renders ASCII table when json option is false", () => {
    const output = renderTelemetryView(sampleMetrics, {
      json: false,
      taskId: "123456789",
      functionName: "batch-risk-simulator",
    });

    expect(output).toContain("SOLAXIS MICRO-INSTANCE SETTLEMENT SUMMARY");
    expect(output).toContain("450 ms");
    expect(output).toContain("50 iterations");
    expect(output).toContain("99.4%");
    expect(output).toContain("batch-risk-simulator");
    expect(output).toContain("123456789");
    expect(output).toContain(sampleMetrics.delegationTxSignature);
  });
});
