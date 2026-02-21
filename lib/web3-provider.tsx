'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  sepolia,
} from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// Configure chains and providers
export const config = getDefaultConfig({
  appName: 'UAE7Guard',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc, sepolia],
  ssr: true,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  // QueryClient in state ensures per-instance isolation (no shared SSR cache)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#10b981',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
