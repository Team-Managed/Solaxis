import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { registerNewCommand } from "../src/commands/new.js";
import { registerInitCommand } from "../src/commands/init.js";
import { registerStatusCommand } from "../src/commands/status.js";
import { registerInvokeCommand } from "../src/commands/invoke.js";
import { registerDeployCommand } from "../src/commands/deploy.js";
import { registerVmCommand } from "../src/commands/vm.js";

describe("CLI Command Registration", () => {
  it("registers all required subcommands on Commander instance", () => {
    const program = new Command();
    registerNewCommand(program);
    registerInitCommand(program);
    registerStatusCommand(program);
    registerInvokeCommand(program);
    registerDeployCommand(program);
    registerVmCommand(program);

    const commandNames = program.commands.map((cmd) => cmd.name());
    expect(commandNames).toContain("new");
    expect(commandNames).toContain("init");
    expect(commandNames).toContain("status");
    expect(commandNames).toContain("invoke");
    expect(commandNames).toContain("deploy");
    expect(commandNames).toContain("vm");
  });

  it("registers correct options on invoke command", () => {
    const program = new Command();
    registerInvokeCommand(program);

    const invokeCmd = program.commands.find((c) => c.name() === "invoke");
    expect(invokeCmd).toBeDefined();

    const optionFlags = invokeCmd?.options.map((o) => o.flags);
    expect(optionFlags?.some((f) => f.includes("-f, --function"))).toBe(true);
    expect(optionFlags?.some((f) => f.includes("-i, --iterations"))).toBe(true);
    expect(optionFlags?.some((f) => f.includes("-s, --seed"))).toBe(true);
    expect(optionFlags?.some((f) => f.includes("--tee"))).toBe(true);
  });

  it("registers correct options on status command", () => {
    const program = new Command();
    registerStatusCommand(program);

    const statusCmd = program.commands.find((c) => c.name() === "status");
    expect(statusCmd).toBeDefined();

    const optionFlags = statusCmd?.options.map((o) => o.flags);
    expect(optionFlags?.some((f) => f.includes("-t, --task-id"))).toBe(true);
    expect(optionFlags?.some((f) => f.includes("-p, --pda"))).toBe(true);
  });

  it("supports optional positional function argument on invoke", () => {
    const program = new Command();
    registerInvokeCommand(program);

    const invokeCmd = program.commands.find((c) => c.name() === "invoke");
    expect(invokeCmd).toBeDefined();
    // Commander defines registered arguments
    const args = (invokeCmd as any)._args;
    expect(args?.length).toBeGreaterThanOrEqual(1);
    expect(args[0].name()).toBe("function");
  });

  it("supports optional positional target argument on status", () => {
    const program = new Command();
    registerStatusCommand(program);

    const statusCmd = program.commands.find((c) => c.name() === "status");
    expect(statusCmd).toBeDefined();
    const args = (statusCmd as any)._args;
    expect(args?.length).toBeGreaterThanOrEqual(1);
    expect(args[0].name()).toBe("target");
  });
});
