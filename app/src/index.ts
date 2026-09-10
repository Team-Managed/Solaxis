import { appEnvSchema, validateEnv, DEVNET_BASE_RPC_URL } from "@solaxis/shared";

export function getAppConfig() {
  const env = validateEnv(appEnvSchema, {
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEVNET_BASE_RPC_URL,
    NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL: process.env.NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL,
  });
  return env;
}

// UI Primitives
export * from "../components/ui/button";
export * from "../components/ui/card";
export * from "../components/ui/badge";
export * from "../components/ui/input";
export * from "../components/ui/slider";
export * from "../components/ui/skeleton";
export * from "../components/ui/sheet";
export * from "../components/ui/tooltip";

// Solaxis Telemetry & Indicators
export * from "../components/solaxis/status-badge";
export * from "../components/solaxis/pulse-indicator";
export * from "../components/solaxis/latency-counter";
export * from "../components/solaxis/console-state";

// Console Components & Shell
export * from "../components/navigation/top-nav";
export * from "../components/console/console-layout";

// Lifecycle Visualizer (Unit 08)
export * from "../components/visualizer/lifecycle-visualizer";
export * from "../components/visualizer/stage-node";
export * from "../components/visualizer/energy-track";
export * from "../components/visualizer/stage-drawer";
export * from "../components/visualizer/stage-timer";

// Decentralized CloudWatch Terminal (Unit 09)
export * from "../components/terminal/cloudwatch-terminal";
export * from "../components/terminal/terminal-line";
export * from "../components/terminal/terminal-scroll";
export * from "../hooks/use-terminal-stream";

// Benchmark & Explorer Verification (Unit 10)
export * from "../components/benchmark/benchmark-card";
export * from "../components/benchmark/comparison-grid";
export * from "../components/benchmark/explorer-panel";
export * from "../components/benchmark/summary-drawer";

// Providers & Hooks
export * from "../components/providers/wallet-provider";
export * from "../components/providers/execution-provider";
export * from "../hooks/use-solaxis-execution";
export * from "../lib/utils";
