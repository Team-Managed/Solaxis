"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TerminalLogEntry, LogLevel } from "@/hooks/use-terminal-stream";

interface TerminalLineProps {
  entry: TerminalLogEntry;
}

export function TerminalLine({ entry }: TerminalLineProps) {
  const { timestamp, level, source, message, data } = entry;

  const levelStyles: Record<LogLevel, { text: string; bg: string; border: string }> = {
    INFO: {
      text: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    RPC: {
      text: "text-purple-400 font-medium",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    COMPUTE: {
      text: "text-emerald-400 font-semibold",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    SUCCESS: {
      text: "text-emerald-300 font-bold",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
    },
    WARN: {
      text: "text-amber-400 font-medium",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    ERROR: {
      text: "text-red-400 font-bold",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
    },
  };

  const currentLevelStyle = levelStyles[level] || levelStyles.INFO;

  // Format message text with subtle highlight for signatures or numbers
  const renderFormattedMessage = (text: string) => {
    // Regex matching base58 hashes or signatures (32+ chars)
    const parts = text.split(/([1-9A-HJ-NP-Za-km-z]{32,88}|\d+(?:\.\d+)?ms|\d+ ticks)/g);

    return parts.map((part, i) => {
      if (/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(part)) {
        return (
          <span key={i} className="text-amber-300/90 underline decoration-amber-500/30 underline-offset-2">
            {part}
          </span>
        );
      }
      if (/^\d+(?:\.\d+)?ms$/.test(part)) {
        return (
          <span key={i} className="text-emerald-400 font-semibold">
            {part}
          </span>
        );
      }
      if (/^\d+ ticks$/.test(part)) {
        return (
          <span key={i} className="text-cyan-300 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex items-start gap-2 text-[11px] font-mono leading-relaxed py-0.5 hover:bg-white/[0.02] rounded px-1 transition-colors">
      {/* UTC Timestamp */}
      <span className="text-zinc-500 shrink-0 select-none">{timestamp}</span>

      {/* Source Tag */}
      <span className="text-zinc-400 shrink-0 font-medium select-none">{source}</span>

      {/* Level Badge */}
      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0 text-[10px] uppercase border select-none",
          currentLevelStyle.text,
          currentLevelStyle.bg,
          currentLevelStyle.border
        )}
      >
        {level}
      </span>

      {/* Main Formatted Message */}
      <span className="text-zinc-300 break-all flex-1">
        {renderFormattedMessage(message)}
      </span>

      {/* Optional Data Payload */}
      {data !== undefined && data !== null && (
        <span className="text-zinc-500 text-[10px] shrink-0 font-mono">
          {typeof data === "object" ? JSON.stringify(data) : String(data)}
        </span>
      )}
    </div>
  );
}
