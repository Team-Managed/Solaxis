import { appEnvSchema, validateEnv, DEVNET_BASE_RPC_URL } from "@solaxis/shared";

export function getAppConfig() {
  const env = validateEnv(appEnvSchema, {
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEVNET_BASE_RPC_URL,
    NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL: process.env.NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL,
  });
  return env;
}
