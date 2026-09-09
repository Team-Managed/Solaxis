import { Command } from "commander";
import { scaffoldFunctionProject } from "@solaxis/sdk";
import chalk from "chalk";
import * as path from "node:path";

export function registerNewCommand(program: Command): void {
  program
    .command("new <name>")
    .description("Scaffold a new Solaxis serverless micro-instance function project")
    .option("-d, --description <desc>", "Short summary of the function's purpose")
    .option("--tee", "Target confidential TEE micro-instance", false)
    .option("-i, --iterations <count>", "Default compute iterations", "50")
    .option("--dir <path>", "Target output directory (defaults to ./<name>)")
    .action(async (name: string, options) => {
      try {
        const targetDir = options.dir ? path.resolve(options.dir) : path.resolve(process.cwd(), name);
        const iterations = parseInt(options.iterations, 10);

        if (isNaN(iterations) || iterations < 1 || iterations > 200) {
          console.error(chalk.red("Error: --iterations must be an integer between 1 and 200."));
          process.exit(2);
        }

        console.log(chalk.bold.hex("#F59E0B")(`\n⚡ Scaffolding Solaxis function project: `) + chalk.white(name));

        const result = await scaffoldFunctionProject(targetDir, {
          name,
          description: options.description,
          targetValidator: options.tee ? "confidential-tee" : "standard-er",
          defaultIterations: iterations,
        });

        console.log(chalk.green(`\n✔ Project successfully created at ${result.projectDir}\n`));
        console.log(chalk.bold.cyan("Generated Files:"));
        for (const file of result.filesCreated) {
          const relative = path.relative(process.cwd(), file);
          console.log(`  ${chalk.gray("├──")} ${chalk.white(relative)}`);
        }

        console.log(chalk.bold.hex("#10B981")("\nNext Steps:"));
        console.log(chalk.white(`  cd ${name}`));
        console.log(chalk.white("  pnpm install"));
        console.log(chalk.white("  pnpm invoke\n"));
        process.exit(0);
      } catch (err) {
        console.error(chalk.red(`\n✖ Scaffolding failed: ${(err as Error).message}\n`));
        process.exit(2);
      }
    });
}
