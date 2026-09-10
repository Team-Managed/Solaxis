"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import {
  LifecycleController,
  MAGICBLOCK_DEVNET_ROUTER_URL,
  type TaskStatus,
  type ProgressEvent,
  type TelemetryMetrics,
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

export interface DaemonStatus {
  connected: boolean;
  status?: string;
  task?: string;
  taskPda?: string;
  function?: string;
  environment?: string;
  uptimeSeconds?: number;
  ticksCompleted?: number;
  lastOutput?: string;
  latencyMs?: number;
  gasSaved?: string;
  rollupEndpoint?: string;
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
  daemon: DaemonStatus;
  tickLatencies: number[];
}

export function useSolaxisExecution() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [selectedFunction, setSelectedFunction] = useState<FunctionName>("batch-risk-simulator");
  const [status, setStatus] = useState<TaskStatus>("IDLE");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState<number>(0);
  const [totalIterations, setTotalIterations] = useState<number>(50);
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [telemetry, setTelemetry] = useState<TelemetryMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [daemon, setDaemon] = useState<DaemonStatus>({ connected: false });
  const [tickLatencies, setTickLatencies] = useState<number[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastDaemonTicksRef = useRef<number>(0);
  const lastIterTimeRef = useRef<number>(0);

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

  // Background poller for local CLI daemon at http://localhost:8080
  useEffect(() => {
    let isCancelled = false;

    const checkDaemon = async () => {
      try {
        const res = await fetch("http://localhost:8080/", {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(1500),
        });

        if (res.ok) {
          const data = await res.json();
          if (isCancelled) return;

          setDaemon({
            connected: true,
            status: data.status,
            task: data.task,
            taskPda: data.taskPda,
            function: data.function,
            environment: data.environment,
            uptimeSeconds: data.uptimeSeconds,
            ticksCompleted: data.ticksCompleted,
            lastOutput: data.lastOutput,
            latencyMs: data.latencyMs,
            gasSaved: data.gasSaved,
            rollupEndpoint: data.rollupEndpoint,
          });

          // If daemon is active and ticks incremented, stream into logs
          if (data.ticksCompleted && data.ticksCompleted > lastDaemonTicksRef.current) {
            lastDaemonTicksRef.current = data.ticksCompleted;
            setStatus("RUNNING");
            if (data.taskPda) setActiveTaskId(data.taskPda);
            setCurrentIteration(data.ticksCompleted);
            if (data.latencyMs) {
              setTickLatencies((prev) => [...prev.slice(-49), data.latencyMs!]);
            }
            addLog(
              "ER-EXEC",
              `[DAEMON:TICK #${data.ticksCompleted}] In-memory SVM execute_batch tick in ${data.latencyMs ?? 12}ms (0 L1 gas)`
            );
          }
        } else {
          if (!isCancelled) setDaemon({ connected: false });
        }
      } catch {
        if (!isCancelled) setDaemon({ connected: false });
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkDaemon, 2000);
    checkDaemon();

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [addLog]);

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
    setTickLatencies([]);
    setError(null);
    setIsExecuting(false);
    addLog("INFO", "Execution state reset to IDLE.");
  }, [addLog]);

  // Direct trigger for testing or simulating CLI invocation without form inputs
  const launch = useCallback(
    async (fnName?: FunctionName, defaultIters: number = 50) => {
      const targetFn = fnName ?? selectedFunction;
      const targetValidator: TargetValidator =
        targetFn === "confidential-state-hasher" ? "confidential-tee" : "standard-er";

      setError(null);
      setIsExecuting(true);
      setStatus("PROVISIONING");
      setCurrentIteration(0);
      setTotalIterations(defaultIters);
      setTelemetry(null);
      setTickLatencies([]);
      lastIterTimeRef.current = performance.now();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      addLog(
        "SPINUP",
        `[CLI:INVOKE] Triggering serverless micro-instance '${targetFn}' (${defaultIters} ticks, ${targetValidator})...`
      );

      try {
        let activeSigner: SolaxisWallet | Keypair;
        if (wallet.connected && wallet.publicKey && wallet.signTransaction) {
          activeSigner = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction.bind(wallet),
            signAllTransactions: wallet.signAllTransactions?.bind(wallet),
          };
          addLog("INFO", `Signer: connected wallet ${wallet.publicKey.toBase58().slice(0, 8)}...`);
        } else {
          activeSigner = Keypair.generate();
          addLog("INFO", `Signer: ephemeral session ${activeSigner.publicKey.toBase58().slice(0, 8)}...`);
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
          const now = performance.now();
          const delta = lastIterTimeRef.current > 0 ? Math.max(1, now - lastIterTimeRef.current) : 10;
          lastIterTimeRef.current = now;
          setTickLatencies((prev) => [...prev.slice(-49), Number(delta.toFixed(1))]);
          setCurrentIteration(event.currentIteration);
          setCurrentOutput(event.currentOutput);
          if (
            event.currentIteration === 1 ||
            event.currentIteration % 10 === 0 ||
            event.currentIteration === defaultIters
          ) {
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
          iterations: defaultIters,
          seed: 42,
          targetValidator,
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
        if (!abortController.signal.aborted) {
          const errMsg = err instanceof Error ? err.message : "Execution failed";
          setError(errMsg);
          setStatus("FAILED");
          setIsExecuting(false);
          addLog("ERROR", `[ERROR] Invocation error: ${errMsg}`);
        }
      }
    },
    [connection, wallet, selectedFunction, addLog]
  );

  return {
    selectedFunction,
    setSelectedFunction,
    iterations: totalIterations,
    status,
    activeTaskId,
    currentIteration,
    totalIterations,
    currentOutput,
    telemetry,
    logs,
    error,
    isExecuting,
    launch,
    reset,
    daemon,
    tickLatencies,
  };
}

export type SolaxisExecution = ReturnType<typeof useSolaxisExecution>;
