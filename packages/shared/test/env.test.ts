import { describe, it, expect } from "vitest";
import {
  cliEnvSchema,
  appEnvSchema,
  validateEnv,
  DEVNET_BASE_RPC_URL,
  MAGICBLOCK_DEVNET_ROUTER_URL,
} from "../src/index.js";

describe("Environment Validators", () => {
  describe("cliEnvSchema", () => {
    it("applies default RPC and router URLs", () => {
      const parsed = validateEnv(cliEnvSchema, {});
      expect(parsed.SOLANA_RPC_URL).toBe(DEVNET_BASE_RPC_URL);
      expect(parsed.MAGICBLOCK_ROUTER_URL).toBe(MAGICBLOCK_DEVNET_ROUTER_URL);
      expect(parsed.KEYPAIR_PATH).toBeUndefined();
    });

    it("parses valid custom configurations", () => {
      const custom = {
        SOLANA_RPC_URL: "https://api.devnet.solana.com",
        KEYPAIR_PATH: "/home/user/.config/solana/id.json",
        MAGICBLOCK_ROUTER_URL: "https://devnet-router.magicblock.app",
      };
      const parsed = validateEnv(cliEnvSchema, custom);
      expect(parsed.SOLANA_RPC_URL).toBe("https://api.devnet.solana.com");
      expect(parsed.KEYPAIR_PATH).toBe("/home/user/.config/solana/id.json");
    });

    it("throws a descriptive error when URL is malformed", () => {
      expect(() =>
        validateEnv(cliEnvSchema, {
          SOLANA_RPC_URL: "not-a-url",
        })
      ).toThrow(/SOLANA_RPC_URL: SOLANA_RPC_URL must be a valid URL/);
    });
  });

  describe("appEnvSchema", () => {
    it("applies defaults for Next.js public variables", () => {
      const parsed = validateEnv(appEnvSchema, {});
      expect(parsed.NEXT_PUBLIC_SOLANA_RPC_URL).toBe(DEVNET_BASE_RPC_URL);
      expect(parsed.NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL).toBe(MAGICBLOCK_DEVNET_ROUTER_URL);
    });

    it("throws a descriptive error when NEXT_PUBLIC URL is invalid", () => {
      expect(() =>
        validateEnv(appEnvSchema, {
          NEXT_PUBLIC_SOLANA_RPC_URL: "invalid_protocol",
        })
      ).toThrow(/NEXT_PUBLIC_SOLANA_RPC_URL: NEXT_PUBLIC_SOLANA_RPC_URL must be a valid URL/);
    });
  });
});
