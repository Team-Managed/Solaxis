import * as fs from "node:fs/promises";
import * as path from "node:path";
import { FUNCTION_NAME_REGEX } from "@solaxis/shared";

export interface ScaffoldOptions {
  /** Function project name (lowercase alphanumeric and hyphens) */
  name: string;
  /** Short summary of function's purpose */
  description?: string;
  /** Target execution validator (standard-er or confidential-tee) */
  targetValidator?: "standard-er" | "confidential-tee";
  /** Default iteration count (1 to 200) */
  defaultIterations?: number;
}

/**
 * Scaffolds a turnkey Solaxis micro-instance function project.
 */
export async function scaffoldFunctionProject(
  targetDir: string,
  options: ScaffoldOptions
): Promise<{ projectDir: string; filesCreated: string[] }> {
  if (!options.name || !FUNCTION_NAME_REGEX.test(options.name)) {
    throw new Error(
      `Invalid project name "${options.name}". Name must contain only lowercase alphanumeric characters and hyphens.`
    );
  }

  const resolvedDir = path.resolve(targetDir);
  await fs.mkdir(resolvedDir, { recursive: true });
  await fs.mkdir(path.join(resolvedDir, "program", "src"), { recursive: true });

  const description = options.description ?? `Solaxis micro-instance compute function: ${options.name}`;
  const targetValidator = options.targetValidator ?? "confidential-tee";
  const defaultIterations = options.defaultIterations ?? 50;

  // 1. package.json
  const packageJson = {
    name: options.name,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      invoke: "tsx index.ts",
    },
    dependencies: {
      "@solaxis/sdk": "^0.1.0",
      "@solana/web3.js": "^1.98.0",
      zod: "^3.24.2",
    },
    devDependencies: {
      tsx: "^4.19.0",
      typescript: "^5.7.3",
    },
  };

  // 2. solaxis.config.ts
  const solaxisConfig = `import { defineFunction } from "@solaxis/sdk";
import { z } from "zod";

export default defineFunction({
  name: "${options.name}",
  description: "${description}",
  defaultIterations: ${defaultIterations},
  targetValidator: "${targetValidator}",
  inputSchema: z.object({
    seed: z.number().default(42),
    iterations: z.number().default(${defaultIterations}),
  }),
});
`;

  // 3. index.ts runner
  const indexTs = `import { SolaxisClient } from "@solaxis/sdk";
import taskConfig from "./solaxis.config.js";

async function main() {
  console.log("Initializing Solaxis client on Devnet...");
  const client = new SolaxisClient({ cluster: "devnet" });

  client.on("statusChange", (status) => console.log("[State]", status));
  client.on("progress", (event) => {
    console.log(\`[Tick \${event.currentIteration}/\${event.totalIterations}] State: \${event.currentOutput}\`);
  });

  console.log(\`Invoking \${taskConfig.name} on \${taskConfig.targetValidator}...\`);
  const result = await client.invoke(taskConfig);

  console.log("\\n=== Invocation Settled ===");
  console.log(\`Total Duration: \${result.metrics.totalDurationMs}ms\`);
  console.log(\`Gas Saved: \${result.metrics.l1GasSavedPercent}%\`);
  console.log(\`Settlement Tx: \${result.settlementTxSignature}\`);
}

main().catch(console.error);
`;

  // 4. Rust program skeleton
  const rustKernel = `use anchor_lang::prelude::*;
use solaxis_engine_sdk::prelude::*;

#[derive(Default, Debug)]
pub struct ${toPascalCase(options.name)}Kernel;

impl SolaxisComputeHandler for ${toPascalCase(options.name)}Kernel {
    fn compute_step(state: &mut u64, iteration: u32, seed: u64) -> Result<u64> {
        let input = (iteration as u64) ^ seed;
        *state = (*state ^ input).wrapping_mul(FNV_PRIME_64);
        Ok(*state)
    }
}
`;

  const files = [
    { path: path.join(resolvedDir, "package.json"), content: JSON.stringify(packageJson, null, 2) + "\n" },
    { path: path.join(resolvedDir, "solaxis.config.ts"), content: solaxisConfig },
    { path: path.join(resolvedDir, "index.ts"), content: indexTs },
    { path: path.join(resolvedDir, "program", "src", "lib.rs"), content: rustKernel },
  ];

  const filesCreated: string[] = [];
  for (const file of files) {
    await fs.writeFile(file.path, file.content, "utf-8");
    filesCreated.push(file.path);
  }

  return { projectDir: resolvedDir, filesCreated };
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
