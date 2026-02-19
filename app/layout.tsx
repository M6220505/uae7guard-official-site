import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Web3Provider } from "@/lib/web3-provider";
import { LanguageProvider } from "@/lib/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
