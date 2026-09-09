import { describe, it, expect } from "vitest";
import { Connection, Keypair } from "@solana/web3.js";
import { Buffer } from "node:buffer";
import { deployProgram } from "../src/deploy.js";

describe("deployProgram", () => {
  it("throws error when neither programBuffer nor programPath is provided", async () => {
    const connection = new Connection("https://api.devnet.solana.com");
    const payer = Keypair.generate();

    await expect(
      deployProgram({
        connection,
        payer,
      })
    ).rejects.toThrow("deployProgram requires either programPath or programBuffer.");
  });

  it("handles programmatic buffer deployment in simulated/mock mode", async () => {
    const connection = new Connection("http://localhost:8899");
    const payer = Keypair.generate();
    const programKeypair = Keypair.generate();
    const fakeBytecode = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]);

    const result = await deployProgram({
      connection,
      payer,
      programKeypair,
      programBuffer: fakeBytecode,
    });

    expect(result.programId.toBase58()).toBe(programKeypair.publicKey.toBase58());
    expect(result.bytesDeployed).toBe(fakeBytecode.length);
    expect(result.deploymentSignature).toBeDefined();
    expect(result.deployedAt).toBeGreaterThan(0);
  });
});
