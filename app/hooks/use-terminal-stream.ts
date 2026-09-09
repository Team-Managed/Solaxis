"use client";

import { useState, useCallback, useMemo } from "react";

export type LogLevel = "INFO" | "RPC" | "COMPUTE" | "SUCCESS" | "WARN" | "ERROR";

export interface TerminalLogEntry {
  id: string;
  timestamp: string; // HH:mm:ss.SSS
  level: LogLevel;
  source: string; // [L1:Base] | [Router] | [ER:Validator] | [L1:Settlement]
  message: string;
  data?: unknown;
}

const MAX_BUFFER_SIZE = 1000;

export function useTerminalStream(initialLogs: TerminalLogEntry[] = []) {
  const [logs, setLogs] = useState<TerminalLogEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(
    new Set(["INFO", "RPC", "COMPUTE", "SUCCESS", "WARN", "ERROR"])
  );
  const [autoScrollLocked, setAutoScrollLocked] = useState<boolean>(true);

  const appendLog = useCallback(
    (level: LogLevel, source: string, message: string, data?: unknown) => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      const ms = String(now.getUTCMilliseconds()).padStart(3, "0");
      const timestamp = `${hours}:${minutes}:${seconds}.${ms}`;

      const entry: TerminalLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp,
        level,
        source: source.startsWith("[") ? source : `[${source}]`,
        message,
        data,
      };

      setLogs((prev) => {
        const next = [...prev, entry];
        if (next.length > MAX_BUFFER_SIZE) {
          return next.slice(next.length - MAX_BUFFER_SIZE);
        }
        return next;
      });
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleLevelFilter = useCallback((level: LogLevel) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) {
          next.delete(level);
        }
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  const selectAllFilters = useCallback(() => {
    setActiveFilters(new Set(["INFO", "RPC", "COMPUTE", "SUCCESS", "WARN", "ERROR"]));
  }, []);

  // Filtered log subset
  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      if (!activeFilters.has(log.level)) return false;
      if (!query) return true;
      return (
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        log.timestamp.includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
      );
    });
  }, [logs, activeFilters, searchQuery]);

  // Copy visible logs to clipboard
  const copyVisibleLogs = useCallback(() => {
    const text = filteredLogs
      .map((l) => `${l.timestamp} ${l.source} [${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  }, [filteredLogs]);

  // Export logs as structured JSON file
  const exportJson = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `solaxis-cloudwatch-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [filteredLogs]);

  return {
    logs,
    filteredLogs,
    searchQuery,
    setSearchQuery,
    activeFilters,
    toggleLevelFilter,
    selectAllFilters,
    autoScrollLocked,
    setAutoScrollLocked,
    appendLog,
    clearLogs,
    copyVisibleLogs,
    exportJson,
  };
}
