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
} from "@solaxis/shared";
import ora from "ora";
import chalk from "chalk";
import { loadKeypair, verifyPayerBalance, formatInsufficientFundsAdvice } from "../utils/keypair.js";
import { renderTelemetryView } from "../views/telemetry-view.js";

export function registerInvokeCommand(program: Command): void {
  program
    .command("invoke")
    .description("Execute end-to-end 5-step micro-instance serverless function lifecycle")
    .option(
      "-f, --function <name>",
      "Function to execute (batch-risk-simulator, confidential-state-hasher, session-counter)",
      "batch-risk-simulator"
    )
    .option("-i, --iterations <count>", "Iterations to compute (1-200)", "50")
    .option("-s, --seed <number>", "Randomness seed for compute loop", "42")
    .option("--tee", "Route to confidential TEE enclave", false)
    .option("-t, --task-id <id>", "Unique Task ID")
    .action(async (options, cmd) => {
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
      const funcName = options.function.toLowerCase();
      const functionDef = getBuiltinFunction(funcName);

      if (!functionDef) {
        console.error(
          chalk.red(
            `Error: Unknown function "${options.function}". Available: batch-risk-simulator, confidential-state-hasher, session-counter`
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
        if (!isSufficient && !rpcUrl.includes("localhost") && !rpcUrl.includes("mock")) {
          console.error(formatInsufficientFundsAdvice(keypair.publicKey.toBase58(), balanceSol, 0.05));
          process.exit(1);
        }

        const taskId = options.taskId || `task-${Date.now()}`;
        const validatorTarget: TargetValidator = options.tee ? "confidential-tee" : "standard-er";

        if (!isJson) {
          console.log(
            chalk.bold.hex("#F59E0B")("\n⚡ Solaxis Micro-Instance Engine: ") +
              chalk.white(`Invoking "${functionDef.name}" on ${validatorTarget}`)
          );
          console.log(chalk.gray(`Authority: ${keypair.publicKey.toBase58()} | Task ID: ${taskId}\n`));
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
      } catch (err) {
        spinner.fail(chalk.red(`Execution failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
