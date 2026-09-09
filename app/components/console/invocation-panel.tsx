"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Play, Dices, Shield, Zap, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TargetValidator } from "@solaxis/shared";

interface InvocationPanelProps {
  iterations: number;
  onIterationsChange: (value: number) => void;
  seed: number;
  onSeedChange: (value: number) => void;
  targetValidator: TargetValidator;
  onTargetValidatorChange: (val: TargetValidator) => void;
  onLaunch: () => void;
  isExecuting: boolean;
}

const PRESET_TICKS = [25, 50, 100, 200];

export function InvocationPanel({
  iterations,
  onIterationsChange,
  seed,
  onSeedChange,
  targetValidator,
  onTargetValidatorChange,
  onLaunch,
  isExecuting,
}: InvocationPanelProps) {
  const { connected } = useWallet();

  const handleRandomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 90000) + 10000;
    onSeedChange(randomSeed);
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-graphite-900/90 p-4 backdrop-blur-md">
      {/* Header with Step Indicator */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
            2
          </span>
          Parameters & Execution
        </label>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Zero-Gas SVM
        </span>
      </div>

      {/* Iteration Slider with Quick Preset Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Compute Ticks</label>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-amber-400">
              {iterations}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">iterations</span>
          </div>
        </div>

        <Slider
          value={iterations}
          min={1}
          max={200}
          step={1}
          onChange={onIterationsChange}
          disabled={isExecuting}
        />

        {/* Quick preset buttons */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-zinc-500">Quick presets:</span>
          <div className="flex items-center gap-1">
            {PRESET_TICKS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onIterationsChange(preset)}
                disabled={isExecuting}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-mono font-medium transition-colors",
                  iterations === preset
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entropy Seed */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Entropy Seed</label>
          <button
            type="button"
            onClick={handleRandomizeSeed}
            disabled={isExecuting}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
          >
            <Dices className="h-3 w-3" />
            Randomize
          </button>
        </div>
        <Input
          type="number"
          value={seed}
          onChange={(e) => onSeedChange(Number(e.target.value))}
          disabled={isExecuting}
          className="font-mono text-xs bg-obsidian-900 border-white/10 text-amber-200 h-8"
        />
      </div>

      {/* Environment Toggle (compact 2-button pill) */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Enclave Target</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTargetValidatorChange("confidential-tee")}
            disabled={isExecuting}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all",
              targetValidator === "confidential-tee"
                ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_12px_-2px_rgba(6,182,212,0.3)]"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-white",
              isExecuting && "pointer-events-none opacity-50"
            )}
          >
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Intel TDX TEE</span>
          </button>

          <button
            type="button"
            onClick={() => onTargetValidatorChange("standard-er")}
            disabled={isExecuting}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all",
              targetValidator === "standard-er"
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-white",
              isExecuting && "pointer-events-none opacity-50"
            )}
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Standard ER</span>
          </button>
        </div>
      </div>

      {/* Primary Launch Action Button */}
      <div className="pt-1">
        <Button
          onClick={onLaunch}
          disabled={isExecuting}
          size="lg"
          className="w-full font-bold tracking-wide transition-all duration-200 shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] hover:shadow-[0_0_28px_2px_rgba(245,158,11,0.6)]"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-obsidian-950" />
              Executing Micro-Instance...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4 fill-current" />
              Launch Micro-Instance
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
