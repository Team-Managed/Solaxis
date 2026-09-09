import type {
  ProgressEvent,
  TaskStatus,
  TelemetryMetrics,
} from "@solaxis/shared";

/**
 * Event signatures emitted by SolaxisClient across the invocation lifecycle.
 */
export interface SolaxisClientEvents {
  /** Emitted when micro-instance lifecycle state transitions */
  statusChange: (status: TaskStatus, previousStatus: TaskStatus) => void;
  /** Emitted on each discrete compute iteration inside the Ephemeral Rollup */
  progress: (event: ProgressEvent) => void;
  /** Emitted on operational log occurrences with diagnostic metadata */
  log: (
    level: "DEBUG" | "INFO" | "WARN" | "ERROR",
    message: string,
    meta?: Record<string, unknown>
  ) => void;
  /** Emitted when micro-instance state atomically seals onto Solana L1 */
  settled: (metrics: TelemetryMetrics) => void;
  /** Emitted when an unrecoverable failure or timeout occurs */
  error: (error: Error) => void;
}
