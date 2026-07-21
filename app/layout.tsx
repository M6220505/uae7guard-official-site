import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Web3Provider } from "@/lib/web3-provider";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "UAE7Guard - Enterprise Web3 Security Platform",
  description: "AI-assisted blockchain risk intelligence with wallet monitoring, multi-chain context, pre-sign warnings, and transparent scoring for MENA users and businesses.",
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
