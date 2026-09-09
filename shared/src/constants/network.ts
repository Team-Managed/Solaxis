/**
 * Canonical network constants for Solana Devnet, Localnet, and MagicBlock infrastructure.
 */

export const DELEGATION_PROGRAM_ID = "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh" as const;

export const DEVNET_BASE_RPC_URL = "https://rpc.magicblock.app/devnet" as const;
export const DEVNET_FALLBACK_RPC_URL = "https://api.devnet.solana.com" as const;

export const MAGIC_PROGRAM_ID = "Magic11111111111111111111111111111111111111" as const;
export const MAGIC_CONTEXT_ID = "MagicContext1111111111111111111111111111111" as const;

export const MAGICBLOCK_DEVNET_ROUTER_URL = "https://devnet-router.magicblock.app" as const;

export const MAGICBLOCK_DEVNET_TEE_VALIDATOR_URL = "https://devnet-tee.magicblock.app" as const;
export const MAGICBLOCK_DEVNET_TEE_VALIDATOR_PUBKEY = "MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo" as const;

export const MAGICBLOCK_DEVNET_ASIA_VALIDATOR_PUBKEY = "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57" as const;

export const LOCALNET_ER_VALIDATOR_URL = "http://localhost:7799" as const;
export const LOCALNET_ER_VALIDATOR_PUBKEY = "mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev" as const;

export const SOLANA_EXPLORER_DEVNET_BASE = "https://explorer.solana.com" as const;

/**
 * Builds a Solana Explorer URL for a transaction signature.
 */
export function getExplorerTxUrl(signature: string, cluster: "devnet" | "custom" = "devnet"): string {
  return `${SOLANA_EXPLORER_DEVNET_BASE}/tx/${encodeURIComponent(signature)}?cluster=${cluster}`;
}

/**
 * Builds a Solana Explorer URL for an account address.
 */
export function getExplorerAccountUrl(address: string, cluster: "devnet" | "custom" = "devnet"): string {
  return `${SOLANA_EXPLORER_DEVNET_BASE}/address/${encodeURIComponent(address)}?cluster=${cluster}`;
}
