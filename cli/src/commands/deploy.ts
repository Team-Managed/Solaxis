import { Command } from "commander";
import { Connection, Keypair } from "@solana/web3.js";
import { deployProgram } from "@solaxis/sdk";
import { DEVNET_BASE_RPC_URL } from "@solaxis/shared";
import ora from "ora";
import chalk from "chalk";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { loadKeypair, verifyPayerBalance, formatInsufficientFundsAdvice } from "../utils/keypair.js";

export function registerDeployCommand(program: Command): void {
  program
    .command("deploy")
    .description("Deploy a compiled custom SBF/Anchor program binary to Solana Devnet")
    .requiredOption("-p, --program-path <path>", "Path to the compiled .so SBF binary")
    .option("-k, --program-keypair <path>", "Path to the program keypair file")
    .action(async (options, cmd) => {
      const globalOptions = cmd.optsWithGlobals();
      const rpcUrl = globalOptions.rpc || DEVNET_BASE_RPC_URL;
      const keypairPath = globalOptions.keypair;

      const spinner = ora();

      try {
        const resolvedProgramPath = path.resolve(options.programPath);
        try {
          await fs.access(resolvedProgramPath);
        } catch {
          console.error(chalk.red(`Error: Program binary not found at "${resolvedProgramPath}".`));
          console.log(chalk.gray("Did you run 'cargo build-sbf' or 'anchor build' first?\n"));
          process.exit(2);
        }

        const { keypair: payer } = await loadKeypair(keypairPath);
        const connection = new Connection(rpcUrl, "confirmed");

        // Verify balance (deployments require rent exemption for program data)
        const { balanceSol, isSufficient } = await verifyPayerBalance(connection, payer, 0.5);
        if (!isSufficient && !rpcUrl.includes("localhost") && !rpcUrl.includes("mock")) {
          console.error(formatInsufficientFundsAdvice(payer.publicKey.toBase58(), balanceSol, 0.5));
          process.exit(1);
        }

        let programKeypair: Keypair | undefined;
        if (options.programKeypair) {
          const raw = await fs.readFile(path.resolve(options.programKeypair), "utf-8");
          programKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
        }

        spinner.start(
          chalk.cyan(`Deploying program "${path.basename(resolvedProgramPath)}" to Solana Devnet...`)
        );

        const result = await deployProgram({
          connection,
          payer,
          programKeypair,
          programPath: resolvedProgramPath,
          clusterUrl: rpcUrl,
        });

        spinner.succeed(chalk.green("Program successfully deployed to Solana!"));

        console.log(chalk.bold.hex("#F59E0B")("\nDeployment Details:"));
        console.log(`  ${chalk.gray("Program ID:     ")} ${chalk.bold.cyan(result.programId.toBase58())}`);
        console.log(`  ${chalk.gray("Bytes Deployed: ")} ${chalk.white(`${(result.bytesDeployed / 1024).toFixed(1)} KB`)}`);
        if (result.deploymentSignature) {
          console.log(`  ${chalk.gray("Signature:      ")} ${chalk.white(result.deploymentSignature)}`);
        }
        console.log(
          `  ${chalk.gray("Solana Explorer: ")} ${chalk.underline.blue(
            `https://explorer.solana.com/address/${result.programId.toBase58()}?cluster=devnet`
          )}\n`
        );

        process.exit(0);
      } catch (err) {
        spinner.fail(chalk.red(`Program deployment failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
