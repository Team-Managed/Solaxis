import fs from "node:fs";
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
    console.log(`[Tick ${event.currentIteration}/${event.totalIterations}] State: ${event.currentOutput}`);
  });

  console.log(`Invoking ${taskConfig.name} on ${taskConfig.targetValidator}...`);
  const result = await client.invoke(taskConfig);

  console.log("\n=== Invocation Settled ===");
  console.log(`Total Duration: ${result.metrics.totalDurationMs}ms`);
  console.log(`Gas Saved: ${result.metrics.l1GasSavedPercent}%`);
  console.log(`Settlement Tx: ${result.settlementTxSignature}`);
}

main().catch(console.error);
