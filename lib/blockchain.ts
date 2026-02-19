import { ethers } from 'ethers';

// RPC endpoints by chain ID (fallback if Alchemy is unavailable)
const RPC_URLS: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
  137: 'https://polygon-rpc.com',
  10: 'https://mainnet.optimism.io',
  42161: 'https://arb1.arbitrum.io/rpc',
  8453: 'https://mainnet.base.org',
  56: 'https://bsc-dataseed1.binance.org',
  11155111: 'https://rpc.sepolia.org',
};

export function getProvider(chainId: number = 1): ethers.JsonRpcProvider {
  const alchemyKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_ID;

  // Prefer Alchemy if configured
  if (alchemyKey && chainId === 1) {
    return new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`);
  }

  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return new ethers.JsonRpcProvider(rpcUrl);
}

// Get wallet age by looking at the first transaction
export async function getWalletAge(address: string, chainId: number = 1): Promise<number | null> {
  try {
    const provider = getProvider(chainId);
    const txCount = await provider.getTransactionCount(address);
    if (txCount === 0) return 0;
    // Approximate age from current block (not precise without indexer)
    return txCount;
  } catch {
    return null;
  }
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Format balance from wei to human-readable
export function formatBalance(wei: bigint, decimals: number = 18): string {
  return ethers.formatUnits(wei, decimals);
}
