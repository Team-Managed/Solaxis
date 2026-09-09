import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-graphite-800 px-2.5 py-1 text-xs text-white shadow-xl border border-white/10 pointer-events-none transition-all duration-150 animate-in fade-in-0 zoom-in-95",
            side === "top" && "-top-8 left-1/2 -translate-x-1/2",
            side === "bottom" && "-bottom-8 left-1/2 -translate-x-1/2",
            side === "left" && "top-1/2 -left-2 -translate-x-full -translate-y-1/2",
            side === "right" && "top-1/2 -right-2 translate-x-full -translate-y-1/2",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
