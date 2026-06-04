import {http, createConfig} from 'wagmi';
import {arbitrum, base, mainnet, sepolia} from 'wagmi/chains';
import {injected} from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, base],
  connectors: [injected()],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http()
  }
});
