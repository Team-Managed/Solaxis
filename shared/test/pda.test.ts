import { describe, it, expect } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { deriveTaskPda, deriveTaskAccountPda, TASK_PDA_SEED_PREFIX, MAX_SEED_LENGTH } from "../src/index.js";

describe("deriveTaskPda", () => {
  const dummyProgramId = new PublicKey("11111111111111111111111111111111");
  const dummyAuthority = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");

  it("derives a valid PDA and bump seed deterministically", () => {
    const res1 = deriveTaskPda(dummyProgramId, dummyAuthority, "task-test-01");
    const res2 = deriveTaskPda(dummyProgramId, dummyAuthority, "task-test-01");

    expect(res1.pda.toBase58()).toBe(res2.pda.toBase58());
    expect(res1.bump).toBe(res2.bump);
    expect(res1.bump).toBeGreaterThanOrEqual(0);
    expect(res1.bump).toBeLessThanOrEqual(255);
  });

  it("accepts string representations for programId and authority", () => {
    const res = deriveTaskPda(
      dummyProgramId.toBase58(),
      dummyAuthority.toBase58(),
      "task-test-02"
    );
    expect(res.pda).toBeInstanceOf(PublicKey);
  });

  it("fails if taskId seed length exceeds 32 bytes", () => {
    const longTaskId = "a".repeat(MAX_SEED_LENGTH + 1);
    expect(() => deriveTaskPda(dummyProgramId, dummyAuthority, longTaskId)).toThrow(
      /exceeds Solana maximum seed length limit/
    );
  });

  it("fails if taskId is empty", () => {
    expect(() => deriveTaskPda(dummyProgramId, dummyAuthority, "")).toThrow(
      /taskId must be a non-empty string/
    );
  });

  it("generates different addresses for different taskIds", () => {
    const resA = deriveTaskPda(dummyProgramId, dummyAuthority, "task-A");
    const resB = deriveTaskPda(dummyProgramId, dummyAuthority, "task-B");

    expect(resA.pda.toBase58()).not.toBe(resB.pda.toBase58());
  });

  it("matches the Anchor-compatible u64 PDA derivation used by the controller", () => {
    const shared = deriveTaskPda(dummyProgramId, dummyAuthority, "task-test-01");
    const controller = deriveTaskAccountPda(dummyProgramId, dummyAuthority, "task-test-01");
    expect(shared.pda.toBase58()).toBe(controller[0].toBase58());
    expect(shared.bump).toBe(controller[1]);
  });
});
