"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EnergyTrackProps {
  status: "idle" | "active" | "completed" | "error";
  color?: "amber" | "emerald" | "cyan";
  className?: string;
}

export function EnergyTrack({
  status,
  color = "amber",
  className,
}: EnergyTrackProps) {
  const isFlowing = status === "active";
  const isCompleted = status === "completed";

  const colorGradients = {
    amber: {
      stop1: "#f59e0b",
      stop2: "#fbbf24",
      glow: "rgba(245, 158, 11, 0.7)",
    },
    emerald: {
      stop1: "#10b981",
      stop2: "#34d399",
      glow: "rgba(16, 185, 129, 0.7)",
    },
    cyan: {
      stop1: "#06b6d4",
      stop2: "#22d3ee",
      glow: "rgba(6, 182, 212, 0.7)",
    },
  };

  const currentGrad = colorGradients[color];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-8 flex-1 min-w-[32px] overflow-visible",
        className
      )}
    >
      <svg
        className="w-full h-8 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 24"
      >
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={currentGrad.stop1} stopOpacity="0.8" />
            <stop offset="100%" stopColor={currentGrad.stop2} stopOpacity="1" />
          </linearGradient>

          <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Channel Track */}
        <line
          x1="0"
          y1="12"
          x2="100"
          y2="12"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />

        {/* Completed Solid State Beam */}
        {isCompleted && (
          <line
            x1="0"
            y1="12"
            x2="100"
            y2="12"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            filter={`url(#glow-emerald)`}
          />
        )}

        {/* Active Flowing Energy Beam */}
        {isFlowing && (
          <>
            <line
              x1="0"
              y1="12"
              x2="100"
              y2="12"
              stroke={`url(#grad-${color})`}
              strokeWidth="2.5"
              filter={`url(#glow-${color})`}
            />
            {/* Pulsing Energy Packet */}
            <circle cx="50" cy="12" r="3.5" fill="#ffffff" filter={`url(#glow-${color})`}>
              <animate
                attributeName="cx"
                from="0"
                to="100"
                dur="0.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}
