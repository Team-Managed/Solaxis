"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StageTimerProps {
  isActive: boolean;
  completedDurationMs?: number | null;
  className?: string;
}

export function StageTimer({
  isActive,
  completedDurationMs,
  className,
}: StageTimerProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = performance.now();
      const updateTimer = () => {
        if (startTimeRef.current !== null) {
          setElapsedMs(performance.now() - startTimeRef.current);
          animFrameRef.current = requestAnimationFrame(updateTimer);
        }
      };
      animFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      startTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive]);

  const displayDuration =
    completedDurationMs !== undefined && completedDurationMs !== null
      ? completedDurationMs
      : isActive
      ? elapsedMs
      : null;

  if (displayDuration === null) {
    return (
      <span className={cn("font-mono text-[11px] text-zinc-600", className)}>
        -- ms
      </span>
    );
  }

  const isSub10ms = displayDuration > 0 && displayDuration < 15;
  const isFast = displayDuration >= 15 && displayDuration < 200;

  return (
    <span
      className={cn(
        "font-mono text-[11px] tabular-nums font-semibold transition-colors duration-150",
        isSub10ms && "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]",
        isFast && "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]",
        !isSub10ms && !isFast && "text-zinc-300",
        className
      )}
    >
      {displayDuration < 1
        ? displayDuration.toFixed(1)
        : Math.round(displayDuration).toLocaleString()}
      ms
    </span>
  );
}
