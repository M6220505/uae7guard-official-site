'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {WagmiProvider} from 'wagmi';
import type {Locale} from '@/i18n';
import {wagmiConfig} from '@/lib/wagmi';

type Web3ProviderProps = {
  children: React.ReactNode;
  locale: Locale;
};

export function Web3Provider({children, locale}: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  void locale;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
