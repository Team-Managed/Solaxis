import type {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import type { TaskStatus } from "../contracts/task.js";
import type { ProgressEvent, TargetValidator } from "../contracts/invocation.js";
import type { TelemetryMetrics } from "../contracts/telemetry.js";

/**
 * Common wallet interface that accommodates both Node.js Keypair and browser Wallet Adapters.
 */
export interface SolaxisWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions?<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
  payer?: Keypair;
}

/**
 * Configuration options for the LifecycleController.
 */
export interface LifecycleConfig {
  /** Solana L1 Base Layer connection */
  baseConnection: Connection;
  /** MagicBlock Router URL */
  routerUrl?: string;
  /** Signing wallet adapter or Keypair */
  wallet: SolaxisWallet | Keypair;
  /** Solaxis Engine Anchor Program ID */
  programId?: PublicKey | string;
  /** Target validator public key for delegation */
  defaultValidator?: PublicKey | string;
  /** Transaction commitment level */
  commitment?: Commitment;
  /** Router polling interval in ms (default: 500ms) */
  routerPollIntervalMs?: number;
  /** Router polling timeout in ms (default: 15000ms) */
  routerTimeoutMs?: number;
}

/**
 * Lifecycle event callback signatures.
 */
export type StateChangeCallback = (state: TaskStatus, previousState: TaskStatus) => void;
export type LogCallback = (
  level: "DEBUG" | "INFO" | "WARN" | "ERROR",
  message: string,
  meta?: Record<string, unknown>
) => void;
export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * Bundle of event listeners that can be subscribed to simultaneously.
 */
export interface LifecycleSubscriptions {
  onStateChange?: StateChangeCallback;
  onLog?: LogCallback;
  onProgress?: ProgressCallback;
}

/**
 * Execution invocation options.
 */
export interface LifecycleInvocationOptions {
  /** Optional task identifier; auto-generated if omitted */
  taskId?: string | number | bigint;
  /** Number of compute iterations (1 to 200) */
  iterations?: number;
  /** Numeric seed for deterministic hash chain compute */
  seed?: number;
  /** Target validator enclave (confidential-tee or standard-er) */
  targetValidator?: TargetValidator;
  /** Abort signal to cancel running execution */
  signal?: AbortSignal;
}

/**
 * Complete result returned after successful lifecycle invocation.
 */
export interface LifecycleResult {
  taskId: string;
  taskPda: PublicKey;
  status: TaskStatus;
  metrics: TelemetryMetrics;
  computeOutput: string;
  delegationTxSignature: string;
  settlementTxSignature: string;
  erEndpoint: string;
}
