"use client";

import { useState, useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import {
  LifecycleController,
  MAGICBLOCK_DEVNET_ROUTER_URL,
  type TaskStatus,
  type ProgressEvent,
  type TelemetryMetrics,
  type InvocationRequest,
  type FunctionName,
  type TargetValidator,
  type SolaxisWallet,
} from "@solaxis/shared";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "SPINUP" | "ER-EXEC" | "SETTLE";
  message: string;
  meta?: Record<string, unknown>;
}

export interface ExecutionState {
  status: TaskStatus;
  activeTaskId: string | null;
  currentIteration: number;
  totalIterations: number;
  currentOutput: string;
  telemetry: TelemetryMetrics | null;
  logs: LogEntry[];
  error: string | null;
  isExecuting: boolean;
  selectedFunction: FunctionName;
  iterations: number;
  seed: number;
  targetValidator: TargetValidator;
}

export function useSolaxisExecution() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [selectedFunction, setSelectedFunction] = useState<FunctionName>("batch-risk-simulator");
  const [iterations, setIterations] = useState<number>(50);
  const [seed, setSeed] = useState<number>(42);
  const [targetValidator, setTargetValidator] = useState<TargetValidator>("confidential-tee");

  const [status, setStatus] = useState<TaskStatus>("IDLE");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState<number>(0);
  const [totalIterations, setTotalIterations] = useState<number>(50);
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [telemetry, setTelemetry] = useState<TelemetryMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback(
    (
      level: LogEntry["level"],
      message: string,
      meta?: Record<string, unknown>
    ) => {
      const now = new Date();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      const timestamp = `[${minutes}:${seconds}.${ms}]`;

      setLogs((prev) => [
        ...prev.slice(-499), // retain up to 500 entries in buffer
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp,
          level,
          message,
          meta,
        },
      ]);
    },
    []
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("IDLE");
    setActiveTaskId(null);
    setCurrentIteration(0);
    setCurrentOutput("");
    setTelemetry(null);
    setError(null);
    setIsExecuting(false);
    addLog("INFO", "Execution state reset to IDLE.");
  }, [addLog]);

  const launch = useCallback(
    async (overrideRequest?: Partial<InvocationRequest>) => {
      const req: InvocationRequest = {
        functionName: overrideRequest?.functionName ?? selectedFunction,
        iterations: overrideRequest?.iterations ?? iterations,
        seed: overrideRequest?.seed ?? seed,
        targetValidator: overrideRequest?.targetValidator ?? targetValidator,
      };

      setError(null);
      setIsExecuting(true);
      setStatus("PROVISIONING");
      setCurrentIteration(0);
      setTotalIterations(req.iterations);
      setTelemetry(null);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      addLog(
        "SPINUP",
        `[SPINUP] Initiating micro-instance task for '${req.functionName}' with ${req.iterations} iterations...`
      );

      try {
        // Resolve signer: connected wallet or ephemeral devnet keypair fallback
        let activeSigner: SolaxisWallet | Keypair;
        if (wallet.connected && wallet.publicKey && wallet.signTransaction) {
          activeSigner = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction.bind(wallet),
            signAllTransactions: wallet.signAllTransactions?.bind(wallet),
          };
          addLog("INFO", `Using connected wallet: ${wallet.publicKey.toBase58().slice(0, 8)}...`);
        } else {
          activeSigner = Keypair.generate();
          addLog("INFO", `Using ephemeral test keypair: ${activeSigner.publicKey.toBase58().slice(0, 8)}...`);
        }

        const controller = new LifecycleController({
          baseConnection: connection,
          routerUrl: process.env.NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL || MAGICBLOCK_DEVNET_ROUTER_URL,
          wallet: activeSigner,
        });

        // Wire event listeners
        controller.onStateChange((newStatus, prevStatus) => {
          setStatus(newStatus);
          const logLevel =
            newStatus === "RUNNING"
              ? "ER-EXEC"
              : newStatus === "TEARING_DOWN"
              ? "SETTLE"
              : newStatus === "SETTLED"
              ? "SETTLE"
              : "INFO";
          addLog(logLevel, `State transition: ${prevStatus} -> ${newStatus}`);
        });

        controller.onProgress((event: ProgressEvent) => {
          setCurrentIteration(event.currentIteration);
          setCurrentOutput(event.currentOutput);
          if (event.currentIteration === 1 || event.currentIteration % 10 === 0 || event.currentIteration === req.iterations) {
            addLog(
              "ER-EXEC",
              `[ER-EXEC] Completed iteration ${event.currentIteration}/${event.totalIterations}: hash ${event.currentOutput.slice(0, 14)}...`
            );
          }
        });

        controller.onLog((lvl, msg, meta) => {
          const mappedLevel = lvl === "DEBUG" ? "INFO" : lvl;
          addLog(mappedLevel, msg, meta);
        });

        const result = await controller.invoke({
          iterations: req.iterations,
          seed: req.seed,
          targetValidator: req.targetValidator,
          signal: abortController.signal,
        });

        setActiveTaskId(result.taskId);
        setTelemetry(result.metrics);
        setStatus("SETTLED");
        setIsExecuting(false);

        addLog(
          "SETTLE",
          `[SETTLE] Successfully committed to Devnet L1! Total: ${result.metrics.totalDurationMs.toFixed(1)}ms, Gas Saved: ${result.metrics.l1GasSavedPercent}%`
        );
        addLog(
          "SETTLE",
          `[SETTLE] Settlement Tx: ${result.settlementTxSignature}`
        );

        return result;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        setStatus("FAILED");
        setIsExecuting(false);
        addLog("ERROR", `Execution failed: ${errorMsg}`);
        throw err;
      }
    },
    [
      connection,
      wallet,
      selectedFunction,
      iterations,
      seed,
      targetValidator,
      addLog,
    ]
  );

  return {
    // Configuration
    selectedFunction,
    setSelectedFunction,
    iterations,
    setIterations,
    seed,
    setSeed,
    targetValidator,
    setTargetValidator,
    // Execution state
    status,
    activeTaskId,
    currentIteration,
    totalIterations,
    currentOutput,
    telemetry,
    logs,
    error,
    isExecuting,
    // Actions
    launch,
    reset,
    addLog,
  };
}

export type SolaxisExecution = ReturnType<typeof useSolaxisExecution>;
