import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, bsc, sepolia } from 'wagmi/chains';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  'YOUR_PROJECT_ID';

const alchemyApiKey =
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ||
  process.env.NEXT_PUBLIC_ALCHEMY_ID;

export const supportedChains = [mainnet, polygon, optimism, arbitrum, base, bsc, sepolia] as const;

const alchemyRpcUrls: Partial<Record<(typeof supportedChains)[number]['id'], string>> = alchemyApiKey
  ? {
      [mainnet.id]: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      [polygon.id]: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      [optimism.id]: `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      [arbitrum.id]: `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      [base.id]: `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    }
  : {};

export const wagmiConfig = getDefaultConfig({
  appName: 'UAE7Guard',
  projectId: walletConnectProjectId,
  chains: supportedChains,
  transports: Object.fromEntries(
    supportedChains.map((chain) => [chain.id, http(alchemyRpcUrls[chain.id])])
  ) as Record<(typeof supportedChains)[number]['id'], ReturnType<typeof http>>,
  ssr: true,
});
