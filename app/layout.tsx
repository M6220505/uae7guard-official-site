import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Web3Provider } from "@/lib/web3-provider";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "UAE7Guard - Enterprise Web3 Security Platform",
  description: "AI-powered blockchain security with 24/7 wallet monitoring, multi-chain support, secure escrow, and NFT risk analysis. Sub-100ms threat detection for Ethereum, Solana, Polygon, and BNB Chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <LanguageProvider>
          <Web3Provider>
            <Navigation />
            {children}
          </Web3Provider>
        </LanguageProvider>
      </body>
    </html>
  );
}
