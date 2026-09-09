import { describe, it, expect } from "vitest";
import { Keypair, Connection } from "@solana/web3.js";
import {
  loadKeypair,
  verifyPayerBalance,
  formatInsufficientFundsAdvice,
} from "../src/utils/keypair.js";

describe("CLI Keypair Utility", () => {
  it("generates an ephemeral keypair when default keypair file does not exist", async () => {
    const result = await loadKeypair();
    expect(result.keypair).toBeDefined();
    expect(result.keypair.publicKey).toBeDefined();
  });

  it("throws descriptive error when a non-existent custom keypair path is provided", async () => {
    await expect(
      loadKeypair("/tmp/definitely-non-existent-keypair-12345.json")
    ).rejects.toThrow(/Failed to load keypair from specified path/);
  });

  it("verifies simulated balance check for localhost or mock RPC", async () => {
    const connection = new Connection("http://localhost:8899");
    const payer = Keypair.generate();
    const balance = await verifyPayerBalance(connection, payer, 0.05);

    expect(balance.isSufficient).toBe(true);
    expect(balance.balanceSol).toBeGreaterThanOrEqual(0.05);
  });

  it("formats actionable insufficient funds advice", () => {
    const payer = Keypair.generate();
    const advice = formatInsufficientFundsAdvice(payer.publicKey.toBase58(), 0.01, 0.05);

    expect(advice).toContain(payer.publicKey.toBase58());
    expect(advice).toContain("solana airdrop");
    expect(advice).toContain("faucet.solana.com");
  });
});
