import { TopNav } from "@/components/navigation/top-nav";
import { ConsoleLayout } from "@/components/console/console-layout";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex-1">
        <ConsoleLayout />
      </div>
      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-obsidian-950/80 py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Solaxis Web3 Micro-Instance Engine • Powered by MagicBlock Ephemeral Rollups</span>
          <span className="font-mono text-[11px] text-zinc-500">Solana Devnet Enclave • TDX TEE Verified</span>
        </div>
      </footer>
    </main>
  );
}
