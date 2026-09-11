import { describe, it, expect, afterAll } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { scaffoldFunctionProject } from "../src/scaffold.js";

describe("scaffoldFunctionProject", () => {
  const tempDir = path.join(os.tmpdir(), `solaxis-scaffold-test-${Date.now()}`);

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("scaffolds a turnkey micro-instance project directory", async () => {
    const targetDir = path.join(tempDir, "my-test-task");
    const result = await scaffoldFunctionProject(targetDir, {
      name: "orderbook-sorter",
      description: "High-frequency limit orderbook sorter in TEE",
      targetValidator: "confidential-tee",
      defaultIterations: 100,
    });

    expect(result.projectDir).toBe(targetDir);
    expect(result.filesCreated.length).toBe(8);

    // Verify package.json
    const packageJsonRaw = await fs.readFile(path.join(targetDir, "package.json"), "utf-8");
    const packageJson = JSON.parse(packageJsonRaw);
    expect(packageJson.name).toBe("orderbook-sorter");
    expect(packageJson.dependencies["@solaxis/sdk"]).toBeDefined();

    // Verify solaxis.config.ts
    const configRaw = await fs.readFile(path.join(targetDir, "solaxis.config.ts"), "utf-8");
    expect(configRaw).toContain('name: "orderbook-sorter"');
    expect(configRaw).toContain('targetValidator: "confidential-tee"');
    expect(configRaw).toContain("defaultIterations: 100");

    // Verify index.ts
    const indexRaw = await fs.readFile(path.join(targetDir, "index.ts"), "utf-8");
    expect(indexRaw).toContain('import { SolaxisClient } from "@solaxis/sdk"');

    // Verify Rust program skeleton
    const rustRaw = await fs.readFile(path.join(targetDir, "programs", "orderbook_sorter", "src", "lib.rs"), "utf-8");
    expect(rustRaw).toContain("#[ephemeral]");
    expect(rustRaw).toContain("pub fn execute_batch");
    expect(await fs.stat(path.join(targetDir, "Cargo.toml"))).toBeDefined();
    expect(await fs.stat(path.join(targetDir, "programs", "orderbook_sorter", "Cargo.toml"))).toBeDefined();
    expect(await fs.stat(path.join(targetDir, "Anchor.toml"))).toBeDefined();
    expect(await fs.stat(path.join(targetDir, "program-keypair.json"))).toBeDefined();
  });

  it("fails if function name contains invalid characters", async () => {
    const targetDir = path.join(tempDir, "invalid-task");
    await expect(
      scaffoldFunctionProject(targetDir, {
        name: "Invalid_CamelCase",
      })
    ).rejects.toThrow(/Invalid project name/);
  });
});
