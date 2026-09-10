import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { ExecutionProvider } from "@/components/providers/execution-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solaxis | Serverless Web3 Micro-Instance Engine",
  description:
    "Serverless Web3 micro-instances on Solana, powered by MagicBlock Ephemeral Rollups and Intel TDX TEE enclaves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans sunset-mesh-bg contour-lines-overlay min-h-screen text-slate-900 antialiased selection:bg-rose-500/25 selection:text-rose-950`}
      >
        <SolanaWalletProvider>
          <ExecutionProvider>{children}</ExecutionProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
