# Solaxis — Demo Video Script & Storyboard

> **Theme:** DePIN High-Frequency Telemetry & Anti-Spoofing Epoch Compression Engine  
> **Duration:** ~2 minutes 30 seconds  
> **Key Technologies:** Solana Devnet, MagicBlock Ephemeral Rollups (ER), Intel TDX TEE Enclave (PER), `@solaxis/cli`, `@solaxis/sdk`, Next.js 15 Web Developer Console  

---

## 📋 Pre-Recording Setup Checklist

Before pressing Record, prepare your dual-screen or split-screen workspace:

1. **Terminal Pane (Left Side):**
   - High-contrast dark theme, font size ~15–16pt.
   - Payer keypair funded with at least `0.1 SOL` on Solana Devnet.
   - Working directory: Repository root (`/home/tyra/solana/Solaxis`).

2. **Browser Window (Right Side):**
   - Open at `http://localhost:3000`.
   - Browser wallet (Phantom or Solflare) connected to **Solana Devnet**.
   - Dev server running: `pnpm --filter @solaxis/app dev`.

3. **Background Services:**
   - Ensure local port `8080` is free for the persistent micro-instance daemon.

---

## 🎬 Storyboard & Word-for-Word Script

### ACT 1: The DePIN Bottleneck & The Hook (0:00 – 0:25)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **0:00 – 0:10** | **Visual:** Open with a split graphic or slide: An IoT weather station / smart meter on the left; Solana transaction queue / high gas costs on the right. | *"Solana is the undisputed home of DePIN. But imagine a physical network of 10,000 smart sensors or weather stations streaming telemetry every second."* |
| **0:10 – 0:25** | **Visual:** Show a calculation or terminal showing 100 individual transaction fees adding up, then an AWS cloud logo crossed out. | *"Writing each sensor ping to Solana L1 costs thousands in gas fees and clogs the chain. But routing that data through centralized cloud servers like AWS destroys Web3 trust and allows bad actors to spoof data. What if sensors could run sovereign, zero-gas micro-instances natively on Solana?"* |

---

### ACT 2: Introducing Solaxis (0:25 – 0:45)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **0:25 – 0:35** | **Visual:** Cut to the **Solaxis Web Developer Console** (`http://localhost:3000`). Highlight the dark obsidian theme, solar amber glow, and connected Devnet cluster badge. | *"Meet Solaxis: the Sovereign Serverless Micro-Instance Engine for Solana. Think AWS Lambda, but decentralized and native to Solana."* |
| **0:35 – 0:45** | **Visual:** Zoom in on the 4-stage visualizer header and function catalog. | *"Powered by MagicBlock Ephemeral Rollups and confidential Intel TDX TEE enclaves, Solaxis turns any Solana state account into an on-demand micro-instance with sub-10ms latency, zero gas fees, and atomic L1 settlement."* |

---

### ACT 3: The Edge Daemon in Action (0:45 – 1:15)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **0:45 – 0:55** | **Visual:** Switch to the terminal. Launch the edge sensor daemon:<br>`pnpm --filter @solaxis/cli solaxis daemon depin-sensor --tee --interval 500 --port 8080` | *"Let's look at the edge device workflow. Here, an IoT sensor gateway runs the Solaxis CLI daemon locally, connecting directly into an Intel TDX confidential enclave."* |
| **0:55 – 1:05** | **Visual:** Point out the terminal output banner: `Persistent Micro-Instance Server is ONLINE!`, live block ticks incrementing. Open a secondary terminal pane and run:<br>`curl -s http://localhost:8080/metrics \| jq .` | *"It processes high-frequency sensor ticks every 500 milliseconds. Because it executes inside an Intel TDX hardware enclave, the sensor's telemetry is cryptographically isolated from node operators, completely preventing data spoofing."* |
| **1:05 – 1:15** | **Visual:** Run `solaxis vm` in terminal to inspect TEE memory state, live tick rates (~8ms), and the ~65x speedup multiplier. | *"With `solaxis vm`, we can verify the hardware TEE state: memory is cached in TEE RAM, running at an 8-millisecond tick rate—over 60 times faster than Solana L1 block slots."* |

---

### ACT 4: The Web Console & 4-Stage Visualizer (1:15 – 1:55)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **1:15 – 1:25** | **Visual:** Switch back to the **Web Developer Console**. In the Function Catalog, select **"Confidential State Hasher"** (or **"Batch Risk Simulator"**). Set the slider to **50 iterations**. | *"Now let's watch an epoch batch settle in the Web Developer Console. We trigger an epoch batch of 50 sensor pings."* |
| **1:25 – 1:40** | **Visual:** Click **"Launch Micro-Instance"**. Follow the **4-Stage Visualizer**:<br>• Stage 1 pulses Amber (L1 Delegation)<br>• Stage 2 pulses Emerald (Sub-10ms ticks streaming fast)<br>• Stage 3 shimmers Cyan (Teardown & Commit)<br>• Stage 4 lights up Emerald with checkmark. | *"Watch the pipeline: in Stage 1, the Task PDA is delegated from L1 to the rollup. In Stage 2, 50 telemetry ticks stream through the micro-instance in under 350 milliseconds with zero gas. In Stage 3, MagicIntentBundleBuilder compresses and seals the entire batch into a cryptographic root hash, and Stage 4 settles the final state back to Solana L1."* |
| **1:40 – 1:55** | **Visual:** Pan down to the **Decentralized CloudWatch Terminal**. Click on the `COMPUTE` and `RPC` filter pills, highlight the live JSON-RPC log entries and timestamps. | *"In the Decentralized CloudWatch terminal below, developers get real-time observability—streaming JSON-RPC logs, intermediate hashes, and millisecond timestamps directly from the rollup."* |

---

### ACT 5: Verifiable Proof & Cost Savings (1:55 – 2:25)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **1:55 – 2:10** | **Visual:** Scroll to the **Benchmark & Proof Cards**: highlight the **~65x Faster** and **99.4% Gas Saved** cards. | *"Look at the benchmark: 50 individual L1 transactions would have taken over 25 seconds and cost 250,000 lamports. Solaxis completed the entire batch in 340 milliseconds—a 99.4% gas reduction."* |
| **2:10 – 2:25** | **Visual:** Click the **Solana Explorer Devnet link** under "L1 Settlement Transaction". The browser opens `explorer.solana.com/?cluster=devnet`. Highlight the confirmed transaction. | *"Best of all, this isn't a mock. Clicking the Explorer link opens Solana Devnet, showing the genuine on-chain transaction that committed the compressed epoch hash and reverted account ownership to L1."* |

---

### ACT 6: Outro & Call to Action (2:25 – 2:35)

| Time | Visual / On-Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **2:25 – 2:35** | **Visual:** Cut to the Solaxis GitHub repository / README screen with the Solaxis logo and command quickstart. | *"Serverless without AWS. Confidential compute on the edge. High-speed settlement on Solana. This is Solaxis. Check out the open-source code on GitHub and build your first micro-instance today."* |

---

## ⌨️ Exact Commands to Run During the Demo

### 1. Launch Web Console (Terminal 1)
```bash
pnpm --filter @solaxis/app dev
```
*Accessible at `http://localhost:3000`.*

### 2. Run Edge Sensor Daemon (Terminal 2)
```bash
pnpm --filter @solaxis/cli solaxis daemon depin-sensor --tee --interval 500 --port 8080
```

### 3. Query Edge REST API (Terminal 3)
```bash
curl -s http://localhost:8080/metrics | jq .
curl -s http://localhost:8080/state | jq .
```

### 4. Inspect Hardware TEE & Ephemeral VM (Terminal 3)
```bash
pnpm --filter @solaxis/cli solaxis vm
```

### 5. Standalone Terminal Invocation (Optional B-Roll)
```bash
pnpm --filter @solaxis/cli solaxis invoke confidential-state-hasher --iterations 50 --tee
```

---

## 📊 Key Metric Callouts for Narration

* **Latency:** `< 10ms` per tick (vs. `400ms – 800ms` Solana L1 slot confirmation).
* **Speedup Multiplier:** `~65x Faster` than baseline L1 execution.
* **Gas Consumption:** `0 Lamports` consumed per execution tick inside the rollup.
* **Cost Reduction:** `> 99.4% Gas Saved` vs. discrete L1 transactions.
* **Confidentiality:** Hardware-isolated memory execution inside **Intel TDX TEE** enclaves with remote attestation.
* **Settlement:** Atomic state commitment and PDA ownership reversion via `MagicIntentBundleBuilder`.
