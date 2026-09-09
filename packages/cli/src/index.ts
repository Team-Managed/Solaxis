import { DEVNET_BASE_RPC_URL, cliEnvSchema, validateEnv } from "@solaxis/shared";

export function main(): void {
  const env = validateEnv(cliEnvSchema, process.env);
  console.log("Solaxis CLI initialized with RPC:", env.SOLANA_RPC_URL || DEVNET_BASE_RPC_URL);
}

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  main();
}
