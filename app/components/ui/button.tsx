import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 select-none",
          // Variant mappings
          variant === "default" &&
            "bg-amber-500 text-obsidian-950 font-semibold hover:bg-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_0_rgba(245,158,11,0.5)] active:scale-[0.98]",
          variant === "secondary" &&
            "bg-graphite-800 text-foreground border border-white/10 hover:bg-graphite-700 hover:border-amber-500/40 active:scale-[0.98]",
          variant === "outline" &&
            "border border-white/15 bg-transparent hover:bg-white/5 text-foreground active:scale-[0.98]",
          variant === "ghost" &&
            "hover:bg-white/5 text-muted-foreground hover:text-foreground active:scale-[0.98]",
          variant === "destructive" &&
            "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-[0.98]",
          // Size mappings
          size === "default" && "h-10 px-4 py-2 text-sm",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-12 rounded-lg px-8 text-base",
          size === "icon" && "h-10 w-10 p-0",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
