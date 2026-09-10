"use client";

import React, { FC, ReactNode, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { DEVNET_BASE_RPC_URL } from "@solaxis/shared";

// Dynamic import with ssr: false prevents hydration mismatches and eval warnings on server
export const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface Props {
  children: ReactNode;
  endpoint?: string;
}

export const SolanaWalletProvider: FC<Props> = ({
  children,
  endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEVNET_BASE_RPC_URL,
}) => {
  // Using an empty array leverages the modern Solana Wallet Standard (Phantom, Solflare, Backpack)
  // and eliminates legacy adapter evaluation errors
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
