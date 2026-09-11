import { Command } from "commander";
import { Connection } from "@solana/web3.js";
import { getBuiltinFunction } from "@solaxis/sdk";
import {
  DEVNET_BASE_RPC_URL,
  MAGICBLOCK_DEVNET_ROUTER_URL,
  LifecycleController,
  type ProgressEvent,
  type TaskStatus,
  type TargetValidator,
  type TelemetryMetrics,
  TelemetryMetricsSchema,
} from "@solaxis/shared";
import ora from "ora";
import chalk from "chalk";
import { loadKeypair, verifyPayerBalance, formatInsufficientFundsAdvice } from "../utils/keypair.js";
import { renderTelemetryView } from "../views/telemetry-view.js";

type OraInstance = ReturnType<typeof ora>;

export function registerInvokeCommand(program: Command): void {
  program
    .command("invoke [function]")
    .description("Execute end-to-end 5-step micro-instance serverless function lifecycle")
    .option(
      "-f, --function <name>",
      "Function to execute (price-feed, batch-risk-simulator, orderbook, confidential-state-hasher, session-counter)",
      "batch-risk-simulator"
    )
    .option("-i, --iterations <count>", "Iterations to compute (1-200)", "50")
    .option("-s, --seed <number>", "Randomness seed for compute loop", "42")
    .option("--tee", "Route to confidential TEE enclave", false)
    .option("-t, --task-id <id>", "Unique Task ID")
    .option("--simulate", "Run simulation of the 5-stage lifecycle with realistic telemetry", false)
    .action(async (fnArg, options, cmd) => {
      const globalOptions = cmd.optsWithGlobals();
      const rpcUrl = globalOptions.rpc || DEVNET_BASE_RPC_URL;
      const keypairPath = globalOptions.keypair;
      const isJson = !!globalOptions.json;

      const iterations = parseInt(options.iterations, 10);
      if (isNaN(iterations) || iterations < 1 || iterations > 200) {
        console.error(chalk.red("Error: --iterations must be between 1 and 200."));
        process.exit(2);
      }

      const seed = parseInt(options.seed, 10);
      const rawFuncName = (typeof fnArg === "string" && fnArg) || options.function || "batch-risk-simulator";
      const functionDef = getBuiltinFunction(rawFuncName.toLowerCase());

      if (!functionDef) {
        console.error(
          chalk.red(
            `Error: Unknown function "${rawFuncName}". Available: price-feed, batch-risk-simulator, orderbook, confidential-state-hasher, session-counter`
          )
        );
        process.exit(2);
      }

      const spinner = ora();

      try {
        const { keypair } = await loadKeypair(keypairPath);
        const connection = new Connection(rpcUrl, "confirmed");

        // Verify balance
        const { balanceSol, isSufficient } = await verifyPayerBalance(connection, keypair, 0.05);
        if (!isSufficient && !rpcUrl.includes("localhost") && !rpcUrl.includes("mock") && !options.simulate) {
          console.error(formatInsufficientFundsAdvice(keypair.publicKey.toBase58(), balanceSol, 0.05));
          process.exit(1);
        }

        const taskId = options.taskId || `task-${Date.now()}`;
        const validatorTarget: TargetValidator = options.tee ? "confidential-tee" : functionDef.targetValidator || "standard-er";

        if (!isJson) {
          console.log(
            chalk.bold.hex("#F59E0B")("\n⚡ Solaxis Micro-Instance Engine: ") +
              chalk.white(`Invoking "${functionDef.name}" on ${validatorTarget}`)
          );
          console.log(chalk.gray(`Authority: ${keypair.publicKey.toBase58()} | Task ID: ${taskId}\n`));
        }

        if (options.simulate || rpcUrl.includes("mock") || rpcUrl.includes("simulate")) {
          await runSimulatedLifecycle({
            functionDef,
            taskId,
            iterations,
            seed,
            validatorTarget,
            isJson,
            spinner,
          });
          process.exit(0);
        }

        // Initialize LifecycleController with event callbacks
        const controller = new LifecycleController({
          baseConnection: connection,
          wallet: keypair,
          routerUrl: MAGICBLOCK_DEVNET_ROUTER_URL,
        });

        let currentStep = 0;
        let computeStart = 0;

        controller.onStateChange((state: TaskStatus) => {
          if (isJson) return;

          switch (state) {
            case "PROVISIONING":
              currentStep = 1;
              spinner.start(
                chalk.cyan("[1/5] Delegating Task PDA to MagicBlock Delegation Program...")
              );
              break;
            case "RUNNING":
              if (currentStep < 2) {
                currentStep = 2;
                spinner.succeed(chalk.green("[1/5] Account delegated to MagicBlock Delegation Program"));
                spinner.start(
                  chalk.cyan("[2/5] Discovering active Ephemeral Rollup validator via Magic Router...")
                );
              }
              break;
            case "TEARING_DOWN":
              currentStep = 4;
              spinner.succeed(chalk.green("[3/5] Ephemeral Micro-VM compute loop completed"));
              spinner.start(
                chalk.cyan("[4/5] Committing state and undelegating account back to Solana L1...")
              );
              break;
            case "SETTLED":
              currentStep = 5;
              spinner.succeed(chalk.green("[4/5] Atomic state committed back to Solana L1"));
              spinner.succeed(
                chalk.bold.greenBright("[5/5] Micro-instance execution settled on Solana L1!")
              );
              break;
          }
        });

        controller.onProgress((event: ProgressEvent) => {
          if (isJson) return;

          if (currentStep === 2) {
            currentStep = 3;
            computeStart = Date.now();
            spinner.succeed(chalk.green("[2/5] Active Ephemeral Rollup validator discovered"));
          }

          const elapsedMs = computeStart > 0 ? Date.now() - computeStart : 0;
          spinner.text = chalk.cyan(
            `[3/5] Executing Ephemeral Micro-VM compute loop: tick ${event.currentIteration}/${event.totalIterations} ` +
              chalk.gray(`(${elapsedMs}ms | state: 0x${event.currentOutput.slice(-8)})`)
          );
        });

        controller.onLog((level, message) => {
          if (globalOptions.verbose && !isJson) {
            console.log(chalk.gray(`  [LOG ${level}] ${message}`));
          }
        });

        try {
          const result = await controller.invoke({
            taskId,
            iterations,
            seed,
            targetValidator: validatorTarget,
          });

          // Render Telemetry
          const telemetryOutput = renderTelemetryView(result.metrics, {
            json: isJson,
            taskId,
            functionName: functionDef.name,
          });

          console.log(telemetryOutput);
          process.exit(0);
        } catch (execErr: unknown) {
          const errMsg = String((execErr as Error)?.message || "");
          throw execErr;
        }
      } catch (err) {
        spinner.fail(chalk.red(`Execution failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}

async function runSimulatedLifecycle({
  functionDef,
  taskId,
  iterations,
  seed,
  validatorTarget,
  isJson,
  spinner,
}: {
  functionDef: { name: string; targetValidator: string };
  taskId: string;
  iterations: number;
  seed: number;
  validatorTarget: TargetValidator;
  isJson: boolean;
  spinner: OraInstance;
}): Promise<void> {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!isJson) {
    spinner.start(chalk.cyan("[1/5] Delegating Task PDA to MagicBlock Delegation Program..."));
    await sleep(280);
    spinner.succeed(chalk.green("[1/5] Account delegated to MagicBlock Delegation Program"));

    spinner.start(chalk.cyan("[2/5] Discovering active Ephemeral Rollup validator via Magic Router..."));
    await sleep(220);
    const validatorName =
      validatorTarget === "confidential-tee"
        ? "devnet-tee.magicblock.app (Intel TDX TEE)"
        : "devnet-router.magicblock.app (Asia Validator)";
    spinner.succeed(chalk.green(`[2/5] Active Ephemeral Rollup validator discovered (${validatorName})`));

    const computeStart = Date.now();
    const tickInterval = Math.max(6, Math.min(20, Math.floor(350 / iterations)));
    const stepSize = Math.max(1, Math.floor(iterations / 10));

    for (let i = 1; i <= iterations; i += stepSize) {
      const elapsed = Date.now() - computeStart;
      const fakeOutput = ((seed * 1664525 + i * 1013904223) >>> 0).toString(16).padStart(8, "0");
      spinner.text = chalk.cyan(
        `[3/5] Executing Ephemeral Micro-VM compute loop: tick ${i}/${iterations} ` +
          chalk.gray(`(${elapsed}ms | state: 0x${fakeOutput})`)
      );
      await sleep(tickInterval);
    }
    spinner.succeed(chalk.green(`[3/5] Ephemeral Micro-VM compute loop completed (${iterations} iterations in sub-10ms ER engine)`));

    spinner.start(chalk.cyan("[4/5] Committing state and undelegating account back to Solana L1..."));
    await sleep(300);
    spinner.succeed(chalk.green("[4/5] Atomic state committed back to Solana L1"));
    spinner.succeed(chalk.bold.greenBright("[5/5] Micro-instance execution settled on Solana L1!"));
  }

  const spinUp = 384;
  const erCompute = Math.max(12, Math.round(iterations * 0.45));
  const teardown = 418;
  const total = spinUp + erCompute + teardown;

  // 64-character base58 signatures conforming to BASE58_SIGNATURE_REGEX
  const delegationTxSignature = "5KtP9mZ1aB3cD4eF5gH6jK7mN8pQ9rS1tU2vW3xY4zA5bC6dE7fG8hJ9kL1mN2pQ3rS4tU5vW6xY7zA8";
  const settlementTxSignature = "3XqR2vL8aB3cD4eF5gH6jK7mN8pQ9rS1tU2vW3xY4zA5bC6dE7fG8hJ9kL1mN2pQ3rS4tU5vW6xY7zA8";

  const rawMetrics = {
    totalDurationMs: total,
    spinUpDurationMs: spinUp,
    erExecutionDurationMs: erCompute,
    teardownDurationMs: teardown,
    iterationsCompleted: iterations,
    l1GasSavedPercent: 99.4,
    estimatedL1CostLamports: Math.round(5000 * iterations * 1.8),
    actualErCostLamports: 0,
    delegationTxSignature,
    settlementTxSignature,
    erEndpointUsed:
      validatorTarget === "confidential-tee"
        ? "https://devnet-tee.magicblock.app"
        : "https://devnet-router.magicblock.app",
  };

  const metrics: TelemetryMetrics = TelemetryMetricsSchema.parse(rawMetrics);

  const telemetryOutput = renderTelemetryView(metrics, {
    json: isJson,
    taskId,
    functionName: functionDef.name,
  });

  console.log(telemetryOutput);
}
