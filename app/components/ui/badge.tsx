import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
        variant === "default" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]",
        variant === "secondary" &&
          "border-white/10 bg-graphite-800 text-muted-foreground",
        variant === "success" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]",
        variant === "warning" &&
          "border-amber-400/40 bg-amber-400/15 text-amber-200",
        variant === "destructive" &&
          "border-red-500/30 bg-red-500/10 text-red-400",
        variant === "outline" &&
          "border-white/20 text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
