Read `00-product-map.md` before starting.
Also read `02-design-system-and-tokens.md`, `04-delegation-and-lifecycle-controller.md`, and `06-web-console-app-shell.md`.

Build the Decentralized CloudWatch Stream component in `packages/app`. Provide a real-time streaming JSON-RPC log terminal with monospace typography, log-level filtering, search capabilities, auto-scroll pinning, and export affordances. Leave benchmark analytics to unit 09.

## Implementation

1. Create the terminal container in `packages/app/components/terminal/cloudwatch-terminal.tsx`.
   - Style with deep obsidian background, subtle terminal window chrome (three colored window dots, title "solaxis-cloudwatch-stream: ~"), and glass border.
   - Apply monospace font family (`font-mono`) with clean tabular line spacing.
   - Include a header toolbar featuring: active log count indicator, log-level filter toggles, text search input, auto-scroll lock toggle, and export buttons.
2. Implement structured log message data types and formatting in `packages/app/components/terminal/terminal-line.tsx`.
   - Support log levels: `INFO` (slate blue), `RPC` (purple), `COMPUTE` (neon emerald), `SUCCESS` (green), `WARN` (solar amber), and `ERROR` (cyber crimson).
   - Render each line with: UTC timestamp (`HH:mm:ss.SSS`), colored level badge, source tag (e.g. `[L1:Base]`, `[Router]`, `[ER:Validator]`), and formatted message text.
   - Highlight JSON payloads, transaction signatures, and numeric values with syntax coloring.
3. Implement the log buffer and streaming hook in `packages/app/hooks/use-terminal-stream.ts`.
   - Maintain an in-memory ring buffer holding up to 1,000 log entries to prevent browser memory leaks during high-frequency execution.
   - Provide an `appendLog(level, source, message, data?)` method.
   - Connect the stream directly to the `LifecycleController` log events so every RPC call, delegation status check, and compute iteration logs immediately.
4. Implement smart auto-scroll management in `packages/app/components/terminal/terminal-scroll.tsx`.
   - By default, automatically scroll the terminal viewport to the bottom as new lines arrive.
   - If the user manually scrolls up to inspect previous logs, disengage auto-scroll and display a floating "Scroll to bottom" pill with a new message counter.
   - Clicking the pill or scrolling back to the bottom re-engages sticky auto-scroll.
5. Implement terminal controls and toolbar actions:
   - **Level Filter**: Toggle pills to show/hide specific log levels (`INFO`, `RPC`, `COMPUTE`, `WARN`, `ERROR`).
   - **Search Input**: Live text input filtering log messages by keyword or transaction signature.
   - **Clear Console**: Action button resetting the visible log buffer.
   - **Copy to Clipboard**: Action button copying all currently visible logs as formatted plain text.
   - **Export JSON**: Action button downloading the raw log stream as a structured JSON file.
6. Create empty and idle states:
   - When no task has run, display an idle prompt with simulated terminal cursor blinking: "System ready. Awaiting micro-instance invocation...".
   - When filters match zero logs, display a helpful "No logs match current filter" message with a reset filters action.

## Scope Limits

- Do not implement external cloud logging integrations (e.g. AWS CloudWatch API) in this unit; this is a decentralized, browser-side stream capturing on-chain and RPC logs directly.
- Do not let the log buffer grow unbounded without ring-buffer eviction.
- Do not block or slow down the execution loop if terminal rendering is queued.

## Notes

- Keep rendering performant: use virtualized lists or memoized rows if log volume exceeds hundreds of lines.
- Ensure log timestamps reflect true monotonic arrival times.
- Depends on: 00, 02, 04, 06. Required before: 09.

## Check When Done

- The terminal renders dark styling with monospace typography and terminal header chrome.
- Triggering an invocation streams real-time log entries with timestamp, level badge, source tag, and formatted message.
- Toggling log-level filters and typing in the search bar filters visible lines instantly.
- Auto-scroll keeps the newest logs in view during execution and disengages gracefully when scrolling up.
- One-click copy copies the terminal contents to the clipboard accurately.
