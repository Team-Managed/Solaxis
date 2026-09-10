#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { DEVNET_BASE_RPC_URL } from "@solaxis/shared";
import { registerNewCommand } from "../commands/new.js";
import { registerInitCommand } from "../commands/init.js";
import { registerStatusCommand } from "../commands/status.js";
import { registerInvokeCommand } from "../commands/invoke.js";
import { registerDeployCommand } from "../commands/deploy.js";
import { registerVmCommand } from "../commands/vm.js";
import { registerDaemonCommand } from "../commands/daemon.js";

const program = new Command();

program
  .name("solaxis")
  .description("Serverless Web3 Micro-Instance Engine on Solana & MagicBlock Ephemeral Rollups")
  .version("0.1.0")
  .option(
    "--rpc <url>",
    "Override Solana RPC endpoint (defaults to Solana Devnet)",
    DEVNET_BASE_RPC_URL
  )
  .option(
    "-k, --keypair <path>",
    "Filesystem path to Solana payer keypair (defaults to ~/.config/solana/id.json)"
  )
  .option("--json", "Output raw JSON telemetry and results", false)
  .option("-v, --verbose", "Enable verbose diagnostic logs", false);

// Register subcommands
registerNewCommand(program);
registerInitCommand(program);
registerStatusCommand(program);
registerInvokeCommand(program);
registerDeployCommand(program);
registerVmCommand(program);
registerDaemonCommand(program);

program.on("command:*", (operands) => {
  console.error(chalk.red(`\n✖ Unknown command: "${operands[0]}"`));
  console.log(
    chalk.gray(
      `Run ${chalk.cyan("solaxis --help")} to see all available commands and options.\n`
    )
  );
  process.exit(2);
});

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red(`\nFatal error: ${err.message}`));
  process.exit(1);
});
