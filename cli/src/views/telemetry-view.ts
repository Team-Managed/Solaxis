import type { TelemetryMetrics } from "@solaxis/shared";
import Table from "cli-table3";
import chalk from "chalk";

export interface TelemetryViewOptions {
  json?: boolean;
  taskId?: string;
  functionName?: string;
}

/**
 * Renders execution telemetry metrics either as formatted JSON or a rich ASCII summary box.
 */
export function renderTelemetryView(
  metrics: TelemetryMetrics,
  options: TelemetryViewOptions = {}
): string {
  if (options.json) {
    return JSON.stringify(
      metrics,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
  }

  const throughput =
    metrics.erExecutionDurationMs > 0
      ? (metrics.iterationsCompleted / (metrics.erExecutionDurationMs / 1000)).toFixed(1)
      : "N/A";

  const table = new Table({
    head: [
      chalk.bold.hex("#F59E0B")("⚡ Solaxis Telemetry Metric"),
      chalk.bold.hex("#10B981")("Execution Value"),
    ],
    style: {
      head: [],
      border: ["grey"],
    },
    wordWrap: true,
  });

  if (options.functionName) {
    table.push([chalk.white("Function Name"), chalk.yellow(options.functionName)]);
  }

  if (options.taskId) {
    table.push([chalk.white("Task ID"), chalk.cyan(options.taskId)]);
  }

  table.push(
    [
      chalk.white("Total Execution Duration"),
      chalk.bold.white(`${metrics.totalDurationMs} ms`) +
        chalk.gray(
          ` (Spin-up: ${metrics.spinUpDurationMs}ms | Compute: ${metrics.erExecutionDurationMs}ms | Teardown: ${metrics.teardownDurationMs}ms)`
        ),
    ],
    [
      chalk.white("Iterations Completed"),
      chalk.greenBright(`${metrics.iterationsCompleted} iterations`),
    ],
    [
      chalk.white("Compute Throughput"),
      chalk.bold.hex("#38BDF8")(`${throughput} iter/sec`),
    ],
    [
      chalk.white("L1 Gas Saved"),
      chalk.bold.greenBright(`${metrics.l1GasSavedPercent.toFixed(1)}%`),
    ]
  );

  if (metrics.delegationTxSignature) {
    const delUrl = `https://explorer.solana.com/tx/${metrics.delegationTxSignature}?cluster=devnet`;
    table.push([
      chalk.white("L1 Delegation Tx"),
      chalk.underline.blue(delUrl),
    ]);
  }

  if (metrics.settlementTxSignature) {
    const setUrl = `https://explorer.solana.com/tx/${metrics.settlementTxSignature}?cluster=devnet`;
    table.push([
      chalk.white("L1 Settlement Tx"),
      chalk.underline.green(setUrl),
    ]);
  }

  const headerBanner =
    chalk.bold.hex("#F59E0B")("\n══════════════════════════════════════════════════════════════════════════════════════\n") +
    chalk.bold.white("                      SOLAXIS MICRO-INSTANCE SETTLEMENT SUMMARY\n") +
    chalk.bold.hex("#F59E0B")("══════════════════════════════════════════════════════════════════════════════════════");

  const consoleNotice =
    chalk.bold.hex("#38BDF8")("🔍 Live Web Developer Console:") +
    " " +
    chalk.underline.cyan("https://solaxis.run/console") +
    chalk.gray(" (or http://localhost:3000/console)\n") +
    chalk.gray("   • Stream real-time CloudWatch JSON-RPC telemetry, TEE enclave health & Explorer proofs");

  return `${headerBanner}\n${table.toString()}\n\n${consoleNotice}\n`;
}
