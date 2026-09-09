import {
  Connection,
  Keypair,
  PublicKey,
  type Commitment,
} from "@solana/web3.js";
import EventEmitter from "eventemitter3";
import {
  LifecycleController,
  DEVNET_BASE_RPC_URL,
  MAGICBLOCK_DEVNET_ROUTER_URL,
  type LifecycleResult,
  type SolaxisWallet,
  type TelemetryMetrics,
  type TaskStatus,
  type ProgressEvent,
} from "@solaxis/shared";

import type { SolaxisClientEvents } from "./events.js";
import type { FunctionDefinition } from "./function.js";

export interface SolaxisClientOptions {
  /** Target cluster alias ("devnet" | "localnet" | "custom") */
  cluster?: "devnet" | "localnet" | "custom";
  /** Solana L1 Base RPC URL (defaults to MagicBlock Devnet RPC) */
  rpcUrl?: string;
  /** MagicBlock Router URL (defaults to MagicBlock Devnet Router) */
  routerUrl?: string;
  /** Signing Keypair or browser Wallet Adapter */
  wallet?: SolaxisWallet | Keypair;
  /** Solaxis Engine Anchor Program ID */
  programId?: PublicKey | string;
  /** Commitment level */
  commitment?: Commitment;
  /** Router poll interval in ms */
  routerPollIntervalMs?: number;
  /** Router timeout in ms */
  routerTimeoutMs?: number;
}

export interface ClientInvocationOptions {
  taskId?: string | number | bigint;
  iterations?: number;
  seed?: number;
  signal?: AbortSignal;
}

/**
 * High-level TypeScript client for interacting with the Solaxis Web3 Micro-Instance platform.
 */
export class SolaxisClient extends EventEmitter<SolaxisClientEvents> {
  private controller: LifecycleController;
  private connection: Connection;
  private routerUrl: string;

  constructor(config: SolaxisClientOptions = {}) {
    super();

    const rpcUrl = config.rpcUrl ?? DEVNET_BASE_RPC_URL;
    const commitment = config.commitment ?? "confirmed";
    this.connection = new Connection(rpcUrl, commitment);
    this.routerUrl = config.routerUrl ?? MAGICBLOCK_DEVNET_ROUTER_URL;

    // Use provided wallet or generate an ephemeral Keypair
    const wallet = config.wallet ?? Keypair.generate();

    this.controller = new LifecycleController({
      baseConnection: this.connection,
      routerUrl: this.routerUrl,
      wallet,
      programId: config.programId,
      commitment,
      routerPollIntervalMs: config.routerPollIntervalMs,
      routerTimeoutMs: config.routerTimeoutMs,
    });

    // Wire controller callbacks to typed EventEmitter
    this.controller.onStateChange((status: TaskStatus, previousStatus: TaskStatus) => {
      this.emit("statusChange", status, previousStatus);
    });

    this.controller.onProgress((event: ProgressEvent) => {
      this.emit("progress", event);
    });

    this.controller.onLog(
      (
        level: "DEBUG" | "INFO" | "WARN" | "ERROR",
        message: string,
        meta?: Record<string, unknown>
      ) => {
        this.emit("log", level, message, meta);
      }
    );
  }

  /**
   * Returns current micro-instance execution status.
   */
  public getState(): TaskStatus {
    return this.controller.getState();
  }

  /**
   * Returns the client's signing public key.
   */
  public getPublicKey(): PublicKey {
    return this.controller.getPublicKey();
  }

  /**
   * Returns the underlying L1 Solana connection.
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Returns the configured Anchor program ID.
   */
  public getProgramId(): PublicKey {
    return this.controller.getProgramId();
  }

  // =========================================================================
  // Granular Stage Execution
  // =========================================================================

  /**
   * Step 1: Initialize Task PDA on Solana L1.
   */
  public async createTask(
    taskId: string | number | bigint
  ): Promise<{ taskPda: PublicKey; signature?: string; alreadyInitialized: boolean }> {
    return await this.controller.initializeTask(taskId);
  }

  /**
   * Step 2: Delegate Task PDA to MagicBlock Delegation Program.
   */
  public async delegateTask(
    taskPda: PublicKey,
    taskId: string | number | bigint,
    validator?: PublicKey
  ): Promise<string> {
    return await this.controller.delegateTask(taskPda, taskId, validator);
  }

  /**
   * Step 3: Discover assigned Ephemeral Rollup / TEE validator FQDN from Router.
   */
  public async discoverEndpoint(
    taskPda: PublicKey,
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    return await this.controller.discoverRouterEndpoint(taskPda, options);
  }

  /**
   * Step 4: Execute compute loop on Ephemeral Rollup at zero base gas fees.
   */
  public async execute(
    taskPda: PublicKey,
    erUrl: string,
    functionDef: FunctionDefinition,
    inputs?: any,
    options?: { signal?: AbortSignal; iterations?: number; seed?: number }
  ): Promise<{ computeOutput: string; iterationsRun: number }> {
    const validatedInput = functionDef.inputSchema ? functionDef.inputSchema.parse(inputs ?? {}) : inputs;
    const iterations = options?.iterations ?? functionDef.defaultIterations;
    const seed = options?.seed ?? (typeof inputs === "object" && inputs && "seed" in inputs ? Number(inputs.seed) : 42);

    return await this.controller.executeEphemeralLoop(
      erUrl,
      taskPda,
      {
        functionName: functionDef.name as any,
        iterations,
        seed,
        targetValidator: functionDef.targetValidator,
      },
      options
    );
  }

  /**
   * Step 5: Atomically commit state and undelegate PDA back to Solana L1.
   */
  public async settle(
    taskPda: PublicKey,
    erUrl: string,
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    return await this.controller.undelegateAndSettle(erUrl, taskPda, options);
  }

  // =========================================================================
  // High-Level End-to-End Invocation
  // =========================================================================

  /**
   * Runs the complete 5-stage lifecycle end-to-end in a single call.
   */
  public async invoke<TInput = any, TOutput = any>(
    functionDef: FunctionDefinition<TInput, TOutput>,
    inputs?: TInput,
    options: ClientInvocationOptions = {}
  ): Promise<LifecycleResult> {
    const taskId = options.taskId ?? `${functionDef.name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const iterations = options.iterations ?? functionDef.defaultIterations;
    const seed = options.seed ?? 42;

    try {
      const result = await this.controller.invoke({
        taskId,
        iterations,
        seed,
        targetValidator: functionDef.targetValidator,
        signal: options.signal,
      });

      this.emit("settled", result.metrics);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.emit("error", error);
      throw error;
    }
  }
}
