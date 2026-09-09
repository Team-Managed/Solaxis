"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSolaxisExecution, type SolaxisExecution } from "@/hooks/use-solaxis-execution";

const ExecutionContext = createContext<SolaxisExecution | null>(null);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const execution = useSolaxisExecution();

  return (
    <ExecutionContext.Provider value={execution}>
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecution(): SolaxisExecution {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error("useExecution must be used within an ExecutionProvider");
  }
  return context;
}
