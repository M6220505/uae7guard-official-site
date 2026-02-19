import { Alchemy, Network } from 'alchemy-sdk';

const CHAIN_TO_NETWORK: Record<number, Network> = {
  1: Network.ETH_MAINNET,
  137: Network.MATIC_MAINNET,
  10: Network.OPT_MAINNET,
  42161: Network.ARB_MAINNET,
  8453: Network.BASE_MAINNET,
  11155111: Network.ETH_SEPOLIA,
};

export function getAlchemy(chainId: number = 1): Alchemy {
  const apiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_ID;
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is not configured');
  }

  return new Alchemy({
    apiKey,
    network: CHAIN_TO_NETWORK[chainId] ?? Network.ETH_MAINNET,
  });
}

// Fetch wallet metadata from Alchemy (balance, tx count, token balances)
export async function getWalletMetadata(address: string, chainId: number = 1) {
  const alchemy = getAlchemy(chainId);

  const [balance, txCount, tokenBalances] = await Promise.all([
    alchemy.core.getBalance(address),
    alchemy.core.getTransactionCount(address),
    alchemy.core.getTokenBalances(address),
  ]);

  return {
    balance: balance.toString(),
    transactionCount: txCount,
    tokenBalances: tokenBalances.tokenBalances.map((tb) => ({
      contractAddress: tb.contractAddress,
      balance: tb.tokenBalance,
    })),
  };
}

// Check if an address is a smart contract
export async function isContract(address: string, chainId: number = 1): Promise<boolean> {
  const alchemy = getAlchemy(chainId);
  const code = await alchemy.core.getCode(address);
  return code !== '0x';
}
