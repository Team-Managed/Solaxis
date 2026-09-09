import { Command } from "commander";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  deriveTaskPda,
  DEFAULT_PROGRAM_ID,
  DEVNET_BASE_RPC_URL,
  MAGICBLOCK_DEVNET_ROUTER_URL,
  ConnectionMagicRouter,
  type TaskStatus,
} from "@solaxis/shared";
import Table from "cli-table3";
import chalk from "chalk";
import ora from "ora";
import { loadKeypair } from "../utils/keypair.js";

const STATUS_MAP: Record<number, TaskStatus> = {
  0: "IDLE",
  1: "PROVISIONING",
  2: "RUNNING",
  3: "SETTLED",
  4: "FAILED",
};

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Inspect on-chain state and delegation status of a Solaxis Task PDA")
    .option("-t, --task-id <id>", "Task ID (string or number)")
    .option("-p, --pda <pubkey>", "Task PDA public key")
    .action(async (options, cmd) => {
      const globalOptions = cmd.optsWithGlobals();
      const rpcUrl = globalOptions.rpc || DEVNET_BASE_RPC_URL;
      const keypairPath = globalOptions.keypair;

      if (!options.taskId && !options.pda) {
        console.error(chalk.red("Error: Must provide either --task-id <id> or --pda <pubkey>."));
        process.exit(2);
      }

      const spinner = ora("Querying Solana L1 and MagicBlock Router...").start();

      try {
        const connection = new Connection(rpcUrl, "confirmed");
        let taskPda: PublicKey;

        if (options.pda) {
          taskPda = new PublicKey(options.pda);
        } else {
          const { keypair } = await loadKeypair(keypairPath);
          const derived = deriveTaskPda(DEFAULT_PROGRAM_ID, keypair.publicKey, String(options.taskId));
          taskPda = derived.pda;
        }

        const accountInfo = await connection.getAccountInfo(taskPda);

        if (!accountInfo) {
          spinner.fail(chalk.yellow(`Task PDA ${taskPda.toBase58()} not found on ${rpcUrl}.`));
          console.log(chalk.gray("\nThe task has not been initialized yet. Run 'solaxis init' first.\n"));
          process.exit(1);
        }

        // Parse account data
        // 8-byte discriminator + 32 authority + 8 task_id + 1 status + 4 iterations + 8 compute_output
        const data = accountInfo.data;
        let authority = "Unknown";
        let taskIdStr = options.taskId || "Unknown";
        let statusName: TaskStatus = "IDLE";
        let iterations = 0;
        let computeOutput = "0";

        if (data.length >= 8 + 32 + 8 + 1 + 4 + 8) {
          const authorityBytes = data.subarray(8, 40);
          authority = new PublicKey(authorityBytes).toBase58();
          const statusCode = data.readUInt8(48);
          statusName = STATUS_MAP[statusCode] || "IDLE";
          iterations = data.readUInt32LE(49);
          const outputVal = data.readBigUInt64LE(53);
          computeOutput = `0x${outputVal.toString(16)}`;
        }

        // Query Magic Router for delegation status
        let delegatedValidator = "Not Delegated (Base L1)";
        try {
          const router = new ConnectionMagicRouter(MAGICBLOCK_DEVNET_ROUTER_URL);
          const delegation = await router.getDelegationStatus(taskPda);
          if (delegation && delegation.isDelegated) {
            delegatedValidator = (delegation as { fqdn?: string; validatorFqdn?: string }).fqdn ||
              (delegation as { fqdn?: string; validatorFqdn?: string }).validatorFqdn ||
              "Delegated to MagicBlock ER";
          }
        } catch {
          // If router query fails or offline, keep default
        }

        spinner.stop();

        const table = new Table({
          head: [chalk.bold.hex("#F59E0B")("Property"), chalk.bold.hex("#10B981")("Value")],
          wordWrap: true,
        });

        table.push(
          [chalk.white("Task PDA"), chalk.bold.cyan(taskPda.toBase58())],
          [chalk.white("Task ID"), chalk.white(taskIdStr)],
          [chalk.white("Authority"), chalk.white(authority)],
          [chalk.white("Lifecycle Status"), formatStatusBadge(statusName)],
          [chalk.white("Total Iterations"), chalk.greenBright(iterations.toString())],
          [chalk.white("Compute Output"), chalk.yellow(computeOutput)],
          [chalk.white("Delegated Validator"), chalk.magenta(delegatedValidator)],
          [
            chalk.white("Solana Explorer"),
            chalk.underline.blue(`https://explorer.solana.com/address/${taskPda.toBase58()}?cluster=devnet`),
          ]
        );

        console.log(chalk.bold.hex("#F59E0B")("\n⚡ Solaxis Task Status Summary:\n"));
        console.log(table.toString() + "\n");
        process.exit(0);
      } catch (err) {
        spinner.fail(chalk.red(`Error querying status: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}

function formatStatusBadge(status: TaskStatus): string {
  switch (status) {
    case "SETTLED":
      return chalk.bgGreen.black(` SETTLED `);
    case "RUNNING":
      return chalk.bgCyan.black(` RUNNING `);
    case "PROVISIONING":
      return chalk.bgYellow.black(` PROVISIONING `);
    case "FAILED":
      return chalk.bgRed.black(` FAILED `);
    default:
      return chalk.bgGray.white(` ${status} `);
  }
}
