"use client";

import React, { useMemo, useState } from "react";
import {
  Terminal as TerminalIcon,
  Search,
  Copy,
  Download,
  Trash2,
  Lock,
  Unlock,
  Check,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useExecution } from "@/components/providers/execution-provider";
import { TerminalLine } from "@/components/terminal/terminal-line";
import { TerminalScroll } from "@/components/terminal/terminal-scroll";
import {
  useTerminalStream,
  type LogLevel,
  type TerminalLogEntry,
} from "@/hooks/use-terminal-stream";
import { cn } from "@/lib/utils";

export function CloudwatchTerminal() {
  const { logs: executionLogs, status } = useExecution();
  const [copied, setCopied] = useState<boolean>(false);

  // Map execution logs into structured terminal log entries
  const streamLogs = useMemo<TerminalLogEntry[]>(() => {
    return executionLogs.map((l) => {
      // Parse level into LogLevel
      let lvl: LogLevel = "INFO";
      if (l.level === "ERROR") lvl = "ERROR";
      else if (l.level === "WARN") lvl = "WARN";
      else if (l.level === "ER-EXEC") lvl = "COMPUTE";
      else if (l.level === "SETTLE") lvl = "SUCCESS";
      else if (l.message.includes("RPC") || l.message.includes("Signature") || l.message.includes("Delegating"))
        lvl = "RPC";

      // Parse source
      let src = "[System]";
      if (l.message.includes("[SPINUP]") || l.message.includes("Delegat"))
        src = "[L1:Base]";
      else if (l.message.includes("Router") || l.message.includes("status"))
        src = "[Router]";
      else if (l.message.includes("[ER-EXEC]") || l.message.includes("iteration") || l.message.includes("hash"))
        src = "[ER:Validator]";
      else if (l.message.includes("[SETTLE]") || l.message.includes("Commit"))
        src = "[L1:Settlement]";

      return {
        id: l.id,
        timestamp: l.timestamp.replace(/[\[\]]/g, ""),
        level: lvl,
        source: src,
        message: l.message,
        data: l.meta,
      };
    });
  }, [executionLogs]);

  const {
    filteredLogs,
    searchQuery,
    setSearchQuery,
    activeFilters,
    toggleLevelFilter,
    selectAllFilters,
    autoScrollLocked,
    setAutoScrollLocked,
    clearLogs,
    copyVisibleLogs,
    exportJson,
  } = useTerminalStream(streamLogs);

  // Synchronize when streamLogs updates
  const effectiveLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return streamLogs.filter((log) => {
      if (!activeFilters.has(log.level)) return false;
      if (!query) return true;
      return (
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        log.timestamp.includes(query)
      );
    });
  }, [streamLogs, activeFilters, searchQuery]);

  const handleCopy = () => {
    const text = effectiveLogs
      .map((l) => `${l.timestamp} ${l.source} [${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levels: LogLevel[] = ["INFO", "RPC", "COMPUTE", "SUCCESS", "WARN", "ERROR"];

  return (
    <div className="flex flex-col h-96 rounded-xl border border-white/10 bg-graphite-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Top Terminal Chrome (Mac-style controls & Title) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-obsidian-950/90 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Mac window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          </div>

          <span className="text-xs font-mono font-medium text-zinc-300 ml-2">
            solaxis-cloudwatch-stream: ~
          </span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            {effectiveLogs.length} / {streamLogs.length} events
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-3 w-3 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs..."
              className="h-7 w-32 sm:w-44 rounded-md border border-white/10 bg-obsidian-900 pl-6 pr-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScrollLocked((prev) => !prev)}
            title={autoScrollLocked ? "Auto-scroll enabled" : "Auto-scroll paused"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
              autoScrollLocked
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/5 text-zinc-500 hover:text-white"
            )}
          >
            {autoScrollLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy visible logs"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={exportJson}
            title="Export JSON"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Sub-bar with Log Level Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 bg-obsidian-900/60 border-b border-white/5 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-zinc-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Levels:
          </span>
          {levels.map((lvl) => {
            const isSelected = activeFilters.has(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleLevelFilter(lvl)}
                className={cn(
                  "rounded px-1.5 py-0.5 transition-colors uppercase text-[10px]",
                  isSelected
                    ? "bg-white/15 text-white font-semibold"
                    : "bg-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {activeFilters.size < levels.length && (
          <button
            onClick={selectAllFilters}
            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Reset filters
          </button>
        )}
      </div>

      {/* Terminal Viewport */}
      <TerminalScroll
        itemCount={effectiveLogs.length}
        autoScrollLocked={autoScrollLocked}
        onAutoScrollChange={setAutoScrollLocked}
      >
        {streamLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 select-none py-12">
            <TerminalIcon className="h-7 w-7 text-zinc-600 stroke-[1.5]" />
            <div className="flex items-center gap-1 font-mono text-xs text-zinc-400">
              <span>System ready. Awaiting micro-instance invocation</span>
              <span className="inline-block w-1.5 h-3 bg-amber-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-600 max-w-sm text-center">
              Trigger a task from the control panel to stream real-time JSON-RPC
              transactions and sub-10ms iteration telemetry.
            </p>
          </div>
        ) : effectiveLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 py-10">
            <span>No logs match current search or level filters.</span>
            <button
              onClick={() => {
                setSearchQuery("");
                selectAllFilters();
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          effectiveLogs.map((entry) => (
            <TerminalLine key={entry.id} entry={entry} />
          ))
        )}
      </TerminalScroll>
    </div>
  );
}
