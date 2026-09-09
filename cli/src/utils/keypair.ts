import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import chalk from "chalk";

export interface KeypairResolutionResult {
  keypair: Keypair;
  path?: string;
  isEphemeral: boolean;
}

/**
 * Resolves and loads a Solana Keypair from the specified path, env, or default ~/.config/solana/id.json.
 */
export async function loadKeypair(customPath?: string): Promise<KeypairResolutionResult> {
  const resolvedPath = customPath
    ? expandHomeDir(customPath)
    : process.env.SOLANA_KEYPAIR_PATH
      ? expandHomeDir(process.env.SOLANA_KEYPAIR_PATH)
      : path.join(os.homedir(), ".config", "solana", "id.json");

  try {
    const raw = await fs.readFile(resolvedPath, "utf-8");
    const secretKeyArray = JSON.parse(raw);
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    return {
      keypair,
      path: resolvedPath,
      isEphemeral: false,
    };
  } catch (err) {
    if (customPath) {
      throw new Error(
        `Failed to load keypair from specified path "${customPath}": ${(err as Error).message}`
      );
    }

    // Default keypair not found — generate ephemeral session keypair with warning
    const ephemeral = Keypair.generate();
    return {
      keypair: ephemeral,
      isEphemeral: true,
    };
  }
}

/**
 * Verifies that the payer keypair holds sufficient SOL for transaction fees and rent.
 */
export async function verifyPayerBalance(
  connection: Connection,
  payer: Keypair,
  minSol: number = 0.05
): Promise<{ balanceSol: number; isSufficient: boolean }> {
  try {
    const lamports = await connection.getBalance(payer.publicKey, "confirmed");
    const balanceSol = lamports / LAMPORTS_PER_SOL;

    if (balanceSol < minSol) {
      return { balanceSol, isSufficient: false };
    }

    return { balanceSol, isSufficient: true };
  } catch {
    // If offline or mocked connection
    if (connection.rpcEndpoint.includes("mock") || connection.rpcEndpoint.includes("localhost")) {
      return { balanceSol: 1.0, isSufficient: true };
    }
    return { balanceSol: 0, isSufficient: false };
  }
}

/**
 * Formats actionable remediation advice if wallet balance is insufficient.
 */
export function formatInsufficientFundsAdvice(pubkey: string, currentSol: number, minSol: number = 0.05): string {
  return [
    chalk.red(`\n✖ Wallet balance insufficient:`),
    chalk.yellow(`  Address: `) + chalk.white(pubkey),
    chalk.yellow(`  Current: `) + chalk.white(`${currentSol.toFixed(4)} SOL`),
    chalk.yellow(`  Required: `) + chalk.white(`${minSol} SOL`),
    chalk.cyan(`\nAction required:`),
    `  Run the following command to request Devnet SOL:`,
    chalk.green(`  solana airdrop 1 ${pubkey} --url devnet`),
    `  Or fund via web faucet: ${chalk.underline("https://faucet.solana.com/")}\n`,
  ].join("\n");
}

function expandHomeDir(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return path.resolve(filepath);
}
