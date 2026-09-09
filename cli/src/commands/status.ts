import { Command } from "commander";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  deriveTaskAccountPda,
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
    .command("status [target]")
    .description("Inspect on-chain state and delegation status of a Solaxis Task PDA")
    .option("-t, --task-id <id>", "Task ID (string or number)")
    .option("-p, --pda <pubkey>", "Task PDA public key")
    .action(async (targetArg, options, cmd) => {
      const globalOptions = cmd.optsWithGlobals();
      const rpcUrl = globalOptions.rpc || DEVNET_BASE_RPC_URL;
      const keypairPath = globalOptions.keypair;

      let targetPdaStr = options.pda;
      let targetTaskId = options.taskId;

      if (targetArg && typeof targetArg === "string") {
        if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(targetArg)) {
          targetPdaStr = targetArg;
        } else {
          targetTaskId = targetArg;
        }
      }

      if (!targetTaskId && !targetPdaStr) {
        targetTaskId = "demo-task";
        console.log(chalk.gray(`No task specified. Inspecting default task "${chalk.white(targetTaskId)}"...\n`));
      }

      const spinner = ora("Checking task state...").start();

      try {
        const connection = new Connection(rpcUrl, "confirmed");
        let taskPda: PublicKey;
        let taskIdStr = targetTaskId || "Unknown";

        if (targetPdaStr) {
          taskPda = new PublicKey(targetPdaStr);
          taskIdStr = `pda:${targetPdaStr.slice(0, 6)}...`;
        } else {
          const { keypair } = await loadKeypair(keypairPath);
          const [pda] = deriveTaskAccountPda(DEFAULT_PROGRAM_ID, keypair.publicKey, String(targetTaskId));
          taskPda = pda;
        }

        const accountInfo = await connection.getAccountInfo(taskPda);

        if (!accountInfo) {
          spinner.info(chalk.yellow(`Task PDA ${taskPda.toBase58()} not yet found on L1.`));
          console.log(
            chalk.gray(
              `\n💡 Quick actions:\n` +
                `   • Initialize this task:   ${chalk.cyan(`pnpm solaxis init ${taskIdStr}`)}\n` +
                `   • Run a micro-instance:   ${chalk.cyan(`pnpm solaxis invoke price-feed --iterations 50`)}\n`
            )
          );
          process.exit(0);
        }

        // Parse account data
        // 8-byte discriminator + 8-byte task_id + 32-byte authority + 1-byte status + 4-byte iterations + 8-byte compute_output
        const data = accountInfo.data;
        let authority = "Unknown";
        let statusName: TaskStatus = "IDLE";
        let iterations = 0;
        let computeOutput = "0";

        if (data.length >= 8 + 8 + 32 + 1 + 4 + 8) {
          const authorityBytes = data.subarray(16, 48);
          authority = new PublicKey(authorityBytes).toBase58();
          const statusCode = data.readUInt8(48);
          statusName = STATUS_MAP[statusCode] || "IDLE";
          iterations = data.readUInt32LE(49);
          const outputVal = data.readBigUInt64LE(53);
          computeOutput = `0x${outputVal.toString(16)}`;
        }

        // Query Magic Router for delegation status
        let vmStatusLine = chalk.gray("Not Delegated (Base L1)");
        try {
          const router = new ConnectionMagicRouter(MAGICBLOCK_DEVNET_ROUTER_URL);
          const delegation = await router.getDelegationStatus(taskPda);
          if (delegation && delegation.isDelegated) {
            const rawUrl =
              (delegation as { fqdn?: string; validatorFqdn?: string }).fqdn ||
              (delegation as { fqdn?: string; validatorFqdn?: string }).validatorFqdn ||
              "https://devnet-tee.magicblock.app";
            const cleanUrl = rawUrl.replace(/\/$/, "");

            try {
              const vmConn = new Connection(cleanUrl, "confirmed");
              const vmSlot = await vmConn.getSlot();
              const isTee = cleanUrl.includes("tee");
              const envTag = isTee ? chalk.magenta("Intel TDX TEE") : chalk.cyan("Standard ER");
              vmStatusLine = chalk.greenBright("● ACTIVE ") + chalk.gray(`(${envTag} | Slot: ${vmSlot.toLocaleString()})`);
            } catch {
              vmStatusLine = chalk.greenBright("● ACTIVE");
            }
          }
        } catch {
          // If router query fails or offline, keep default
        }

        spinner.stop();

        const card = new Table({
          head: [
            chalk.bold.hex("#F59E0B")("⚡ Task Status"),
            chalk.bold.cyan(taskIdStr),
          ],
          colWidths: [20, 48],
          style: {
            head: [],
            border: ["gray"],
            "padding-left": 1,
            "padding-right": 1,
          },
        });

        card.push(
          [chalk.white("Lifecycle State"), formatStatusBadge(statusName)],
          [chalk.white("Task PDA"), chalk.cyan(taskPda.toBase58())],
          [chalk.white("Authority"), chalk.white(authority.slice(0, 8) + "..." + authority.slice(-6))],
          [chalk.white("Compute"), chalk.greenBright(`${iterations} iter`) + chalk.gray(` (Output: ${computeOutput})`)],
          [chalk.white("Micro-VM"), vmStatusLine],
          [chalk.white("Explorer Link"), chalk.underline.blue(`https://explorer.solana.com/address/${taskPda.toBase58()}?cluster=devnet`)]
        );

        console.log(`\n${card.toString()}\n`);
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
      return chalk.bgGreen.black(" SETTLED ");
    case "RUNNING":
      return chalk.bgCyan.black(" RUNNING ");
    case "PROVISIONING":
      return chalk.bgYellow.black(" PROVISIONING ");
    case "FAILED":
      return chalk.bgRed.black(" FAILED ");
    default:
      return chalk.bgGray.white(` ${status} `);
  }
}
