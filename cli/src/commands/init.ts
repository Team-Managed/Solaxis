import { Command } from "commander";
import { Connection } from "@solana/web3.js";
import { LifecycleController, DEVNET_BASE_RPC_URL, deriveTaskPda, DEFAULT_PROGRAM_ID } from "@solaxis/shared";
import ora from "ora";
import chalk from "chalk";
import { loadKeypair, verifyPayerBalance, formatInsufficientFundsAdvice } from "../utils/keypair.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init [task-id]")
    .description("Initialize a new Task PDA on Solana Devnet L1")
    .option("-t, --task-id <id>", "Unique Task ID (numeric or string, defaults to current millisecond timestamp)")
    .action(async (taskIdArg, options, cmd) => {
      const globalOptions = cmd.optsWithGlobals();
      const rpcUrl = globalOptions.rpc || DEVNET_BASE_RPC_URL;
      const keypairPath = globalOptions.keypair;

      const spinner = ora();

      try {
        const { keypair, isEphemeral } = await loadKeypair(keypairPath);
        if (isEphemeral) {
          console.warn(
            chalk.yellow(
              "⚠ Warning: No Solana keypair found. Using an ephemeral generated keypair. Fund it on Devnet to sign."
            )
          );
        }

        const connection = new Connection(rpcUrl, "confirmed");

        // Verify balance
        const { balanceSol, isSufficient } = await verifyPayerBalance(connection, keypair, 0.05);
        if (!isSufficient && !rpcUrl.includes("localhost") && !rpcUrl.includes("mock")) {
          console.error(formatInsufficientFundsAdvice(keypair.publicKey.toBase58(), balanceSol, 0.05));
          process.exit(1);
        }

        const taskId = (typeof taskIdArg === "string" && taskIdArg) || options.taskId || `task-${Date.now()}`;

        spinner.start(
          chalk.cyan(`Initializing Task PDA (Task ID: ${taskId}) on Solana Devnet...`)
        );

        const controller = new LifecycleController({
          baseConnection: connection,
          wallet: keypair,
        });

        try {
          const { taskPda, signature, alreadyInitialized } = await controller.initializeTask(taskId);

          if (alreadyInitialized) {
            spinner.info(chalk.yellow(`Task PDA already initialized on L1.`));
          } else {
            spinner.succeed(chalk.green(`Task PDA successfully initialized on L1!`));
          }

          console.log(chalk.bold.hex("#F59E0B")("\nTask Details:"));
          console.log(`  ${chalk.gray("Task ID:       ")} ${chalk.white(taskId)}`);
          console.log(`  ${chalk.gray("Task PDA:      ")} ${chalk.bold.cyan(taskPda.toBase58())}`);
          console.log(`  ${chalk.gray("Authority:     ")} ${chalk.white(keypair.publicKey.toBase58())}`);
          if (signature) {
            console.log(
              `  ${chalk.gray("Transaction:   ")} ${chalk.underline.green(
                `https://explorer.solana.com/tx/${signature}?cluster=devnet`
              )}`
            );
          }
          console.log();
          process.exit(0);
        } catch (initErr: unknown) {
          const errMsg = String((initErr as Error)?.message || "");
          if (errMsg.includes("Attempt to load a program that does not exist") || errMsg.includes("does not exist")) {
            const derived = deriveTaskPda(DEFAULT_PROGRAM_ID, keypair.publicKey, taskId);
            spinner.warn(chalk.yellow("Devnet Engine Program is not yet deployed on Solana L1."));
            console.log(chalk.bold.hex("#F59E0B")("\nDeterministic Task PDA Details:"));
            console.log(`  ${chalk.gray("Task ID:       ")} ${chalk.white(taskId)}`);
            console.log(`  ${chalk.gray("Task PDA:      ")} ${chalk.bold.cyan(derived.pda.toBase58())}`);
            console.log(`  ${chalk.gray("Authority:     ")} ${chalk.white(keypair.publicKey.toBase58())}`);
            console.log(
              chalk.gray(
                `\n💡 To deploy the on-chain engine to Devnet, run:\n` +
                  `   ${chalk.cyan("solaxis deploy --program-path <path/to/engine.so>")}\n` +
                  `Or test the micro-instance pipeline directly:\n` +
                  `   ${chalk.cyan("solaxis invoke price-feed --iterations 50")}\n`
              )
            );
            process.exit(0);
          }
          throw initErr;
        }
      } catch (err) {
        spinner.fail(chalk.red(`Failed to initialize Task PDA: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
