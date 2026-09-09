"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalScrollProps {
  children: React.ReactNode;
  itemCount: number;
  autoScrollLocked: boolean;
  onAutoScrollChange?: (locked: boolean) => void;
  className?: string;
}

export function TerminalScroll({
  children,
  itemCount,
  autoScrollLocked,
  onAutoScrollChange,
  className,
}: TerminalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const prevCountRef = useRef<number>(itemCount);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Threshold of 30px from bottom considered "at bottom"
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setIsAtBottom(atBottom);

    if (atBottom) {
      setUnreadCount(0);
      onAutoScrollChange?.(true);
    } else {
      onAutoScrollChange?.(false);
    }
  }, [onAutoScrollChange]);

  // Handle incoming items
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const newItems = itemCount - prevCountRef.current;
    prevCountRef.current = itemCount;

    if (autoScrollLocked || isAtBottom) {
      el.scrollTop = el.scrollHeight;
      setUnreadCount(0);
    } else if (newItems > 0) {
      setUnreadCount((prev) => prev + newItems);
    }
  }, [itemCount, autoScrollLocked, isAtBottom]);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnreadCount(0);
    setIsAtBottom(true);
    onAutoScrollChange?.(true);
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-3 font-mono text-xs scanline-bg",
          className
        )}
      >
        {children}
      </div>

      {/* Floating "Scroll to bottom" pill */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-graphite-900/95 px-3 py-1 text-xs font-mono font-medium text-amber-300 shadow-xl backdrop-blur-md hover:bg-graphite-800 transition-all hover:scale-105"
        >
          <ArrowDown className="h-3 w-3" />
          <span>Scroll to bottom</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0 text-[10px] font-bold text-obsidian-950">
              +{unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
