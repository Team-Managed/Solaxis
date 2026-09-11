import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Keypair } from "@solana/web3.js";
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
  const programDir = path.join(resolvedDir, "programs", options.name.replace(/-/g, "_"));
  await fs.mkdir(path.join(programDir, "src"), { recursive: true });

  const description = options.description ?? `Solaxis micro-instance compute function: ${options.name}`;
  const targetValidator = options.targetValidator ?? "confidential-tee";
  const defaultIterations = options.defaultIterations ?? 50;
  const programKeypair = Keypair.generate();
  const programId = programKeypair.publicKey.toBase58();

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
      "@solaxis/sdk": "workspace:*",
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
  programId: "${programId}",
  inputSchema: z.object({
    seed: z.number().default(42),
    iterations: z.number().default(${defaultIterations}),
  }),
});
`;

  // 3. index.ts runner
  const indexTs = `import fs from "node:fs";
import { Keypair } from "@solana/web3.js";
import { SolaxisClient } from "@solaxis/sdk";
import taskConfig from "./solaxis.config.js";

async function main() {
  console.log("Initializing Solaxis client on Devnet...");
  const keypairPath = process.env.SOLAXIS_KEYPAIR_PATH;
  if (!keypairPath) throw new Error("Set SOLAXIS_KEYPAIR_PATH to a funded Solana keypair");
  const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8"))));
  const client = new SolaxisClient({ cluster: "devnet", wallet: payer });

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
  const programName = options.name.replace(/-/g, "_");
  const cargoToml = `[workspace]\nmembers = ["programs/${programName}"]\nresolver = "2"\n\n[profile.release]\noverflow-checks = true\n`;
  const programCargoToml = `[package]\nname = "${programName}"\nversion = "0.1.0"\nedition = "2021"\n\n[lib]\ncrate-type = ["cdylib", "lib"]\n\n[dependencies]\nanchor-lang = "0.32.1"\nephemeral-rollups-sdk = { version = "0.16.2", features = ["anchor-compat"] }\n\n[features]\nidl-build = ["anchor-lang/idl-build"]\n`;

  const anchorToml = `[toolchain]\nanchor_version = "0.32.1"\n\n[programs.devnet]\n${options.name.replace(/-/g, "_")} = "${programId}"\n\n[provider]\ncluster = "devnet"\nwallet = "~/.config/solana/id.json"\n`;

  const rustKernel = `use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::{anchor::{commit, delegate, ephemeral}, cpi::DelegateConfig, ephem::MagicIntentBundleBuilder};

declare_id!("${programId}");
const LEN: usize = 79;

#[account]
pub struct TaskAccount { pub task_id: u64, pub authority: Pubkey, pub status: u8, pub iterations_run: u32, pub compute_output: u64, pub started_at: i64, pub completed_at: Option<i64>, pub bump: u8 }

#[error_code]
pub enum FunctionError { #[msg("Invalid lifecycle state")] InvalidState, #[msg("Unauthorized authority")] Unauthorized, #[msg("Too many iterations")] TooManyIterations }

#[ephemeral]
#[program]
pub mod ${options.name.replace(/-/g, "_")} {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, task_id: u64) -> Result<()> {
        let task = &mut ctx.accounts.task_pda;
        task.task_id = task_id; task.authority = ctx.accounts.authority.key(); task.status = 0;
        task.iterations_run = 0; task.compute_output = 0; task.started_at = Clock::get()?.unix_timestamp;
        task.completed_at = None; task.bump = ctx.bumps.task_pda; Ok(())
    }

    pub fn delegate(ctx: Context<Delegate>, task_id: u64, validator: Option<Pubkey>) -> Result<()> {
        {
            let mut data = ctx.accounts.task_pda.try_borrow_mut_data()?;
            let mut task = TaskAccount::try_deserialize(&mut &data[..])?;
            require_keys_eq!(task.authority, ctx.accounts.payer.key(), FunctionError::Unauthorized);
            task.status = 1;
            task.try_serialize(&mut &mut data[..])?;
        }
        let task_id_bytes = task_id.to_le_bytes();
        let seeds: &[&[u8]] = &[b"solaxis_task", ctx.accounts.payer.key.as_ref(), task_id_bytes.as_ref()];
        ctx.accounts.delegate_task_pda(&ctx.accounts.payer, seeds, DelegateConfig { validator, ..Default::default() })?;
        Ok(())
    }

    pub fn execute_batch(ctx: Context<ExecuteBatch>, iterations: u32, seed: u64) -> Result<()> {
        require!(iterations > 0 && iterations <= 200, FunctionError::TooManyIterations);
        let task = &mut ctx.accounts.task_pda;
        require_keys_eq!(task.authority, ctx.accounts.authority.key(), FunctionError::Unauthorized);
        require!(task.status == 1 || task.status == 2, FunctionError::InvalidState);
        task.status = 2;
        for i in 0..iterations { task.compute_output = task.compute_output.wrapping_add(seed).wrapping_add(i as u64); }
        task.iterations_run = task.iterations_run.checked_add(iterations).ok_or(FunctionError::TooManyIterations)?;
        Ok(())
    }

    pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
        let task_info = ctx.accounts.task_pda.to_account_info();
        let data = task_info.try_borrow_data()?;
        let task = TaskAccount::try_deserialize(&mut &data[..])?;
        require_keys_eq!(task.authority, ctx.accounts.payer.key(), FunctionError::Unauthorized);
        drop(data);
        MagicIntentBundleBuilder::new(ctx.accounts.payer.to_account_info(), ctx.accounts.magic_context.to_account_info(), ctx.accounts.magic_program.to_account_info()).commit_and_undelegate(&[task_info]).build_and_invoke()?; Ok(())
    }
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct Initialize<'info> { #[account(mut)] pub authority: Signer<'info>, #[account(init, payer = authority, space = LEN, seeds = [b"solaxis_task", authority.key().as_ref(), &task_id.to_le_bytes()], bump)] pub task_pda: Account<'info, TaskAccount>, pub system_program: Program<'info, System> }
#[delegate]
#[derive(Accounts)]
pub struct Delegate<'info> { #[account(mut)] pub payer: Signer<'info>, /// CHECK: Delegated TaskAccount PDA validated by the program before delegation.
 #[account(mut, del)] pub task_pda: AccountInfo<'info> }
#[derive(Accounts)]
pub struct ExecuteBatch<'info> { pub authority: Signer<'info>, #[account(mut)] pub task_pda: Account<'info, TaskAccount> }
#[commit]
#[derive(Accounts)]
pub struct Undelegate<'info> { #[account(mut)] pub payer: Signer<'info>, /// CHECK: TaskAccount is explicitly validated and serialized before ownership-changing settlement.
 #[account(mut)] pub task_pda: UncheckedAccount<'info> }
`;

  const files = [
    { path: path.join(resolvedDir, "package.json"), content: JSON.stringify(packageJson, null, 2) + "\n" },
    { path: path.join(resolvedDir, "Anchor.toml"), content: anchorToml },
    { path: path.join(resolvedDir, "Cargo.toml"), content: cargoToml },
    { path: path.join(programDir, "Cargo.toml"), content: programCargoToml },
    { path: path.join(resolvedDir, "program-keypair.json"), content: JSON.stringify(Array.from(programKeypair.secretKey)) + "\n" },
    { path: path.join(resolvedDir, "solaxis.config.ts"), content: solaxisConfig },
    { path: path.join(resolvedDir, "index.ts"), content: indexTs },
    { path: path.join(programDir, "src", "lib.rs"), content: rustKernel },
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
