import * as React from "react";
import { AlertCircle, Wallet, RefreshCw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DisconnectedStateProps {
  onConnectClick?: () => void;
  className?: string;
}

export function DisconnectedWalletState({
  onConnectClick,
  className,
}: DisconnectedStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-white/15 bg-graphite-900/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
        <Wallet className="h-6 w-6 text-amber-400" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1">Wallet Not Connected</h4>
      <p className="text-xs text-muted-foreground max-w-sm mb-5">
        Connect a Solana Devnet wallet (Phantom or Solflare) to initialize state accounts, execute ephemeral rollups, and settle transactions.
      </p>
      {onConnectClick && (
        <Button onClick={onConnectClick} size="sm" variant="default">
          Connect Devnet Wallet
        </Button>
      )}
    </div>
  );
}

interface LowBalanceStateProps {
  balanceSol: number;
  onAirdropClick?: () => void;
  className?: string;
}

export function LowBalanceWarning({
  balanceSol,
  onAirdropClick,
  className,
}: LowBalanceStateProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-semibold text-amber-300">Low Devnet Balance:</span>{" "}
        Your current balance is <span className="font-mono font-bold">{balanceSol.toFixed(3)} SOL</span>. 
        Minimum recommended is 0.05 SOL to fund Task PDA rent and transaction fees.
      </div>
      {onAirdropClick && (
        <Button
          onClick={onAirdropClick}
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-2.5 shrink-0 bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-200"
        >
          Request Airdrop
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ConsoleErrorState({
  title = "Execution Interrupted",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300",
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
      <h4 className="text-sm font-semibold text-red-200 mb-1">{title}</h4>
      <p className="text-xs text-red-400/90 font-mono max-w-md break-all mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="destructive"
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Operation
        </Button>
      )}
    </div>
  );
}

export function DashboardPanelSkeleton() {
  return (
    <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-graphite-900/90">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-52" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-md mt-2" />
    </div>
  );
}
