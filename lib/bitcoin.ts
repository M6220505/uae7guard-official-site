import * as bitcoin from 'bitcoinjs-lib';
import { createHash } from 'crypto';

// Bitcoin network configuration
const NETWORKS = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
} as const;

type NetworkType = keyof typeof NETWORKS;

// Blockstream API base URLs
const API_BASE: Record<NetworkType, string> = {
  mainnet: 'https://blockstream.info/api',
  testnet: 'https://blockstream.info/testnet/api',
};

// Validate a Bitcoin address
export function isValidBtcAddress(address: string, network: NetworkType = 'mainnet'): boolean {
  try {
    bitcoin.address.toOutputScript(address, NETWORKS[network]);
    return true;
  } catch {
    return false;
  }
}

// Fetch Bitcoin address info from Blockstream API
export async function getBtcAddressInfo(address: string, network: NetworkType = 'mainnet') {
  const res = await fetch(`${API_BASE[network]}/address/${address}`);
  if (!res.ok) throw new Error(`Blockstream API error: ${res.status}`);

  const data = await res.json();
  return {
    address: data.address,
    totalReceived: data.chain_stats.funded_txo_sum,
    totalSent: data.chain_stats.spent_txo_sum,
    balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
    txCount: data.chain_stats.tx_count,
    unconfirmedBalance:
      data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum,
    unconfirmedTxCount: data.mempool_stats.tx_count,
  };
}

// Fetch recent transactions for a Bitcoin address
export async function getBtcTransactions(
  address: string,
  network: NetworkType = 'mainnet',
): Promise<
  {
    txid: string;
    status: { confirmed: boolean; block_height?: number; block_time?: number };
    fee: number;
  }[]
> {
  const res = await fetch(`${API_BASE[network]}/address/${address}/txs`);
  if (!res.ok) throw new Error(`Blockstream API error: ${res.status}`);

  const txs = await res.json();
  return txs.map((tx: { txid: string; status: { confirmed: boolean; block_height?: number; block_time?: number }; fee: number }) => ({
    txid: tx.txid,
    status: tx.status,
    fee: tx.fee,
  }));
}

// Analyze Bitcoin address risk (heuristic-based)
export async function analyzeBtcAddress(
  address: string,
  network: NetworkType = 'mainnet',
): Promise<{
  address: string;
  riskScore: number;
  riskLevel: string;
  flags: string[];
  stats: { balance: number; txCount: number; totalReceived: number };
}> {
  const info = await getBtcAddressInfo(address, network);
  const flags: string[] = [];
  let riskScore = 0;

  // New address with no history
  if (info.txCount === 0) {
    flags.push('No transaction history');
    riskScore += 30;
  }

  // Very new address (few transactions)
  if (info.txCount > 0 && info.txCount < 3) {
    flags.push('Very few transactions');
    riskScore += 15;
  }

  // Large balance with few transactions (potential dust attack target)
  if (info.balance > 10_000_000 && info.txCount < 5) {
    flags.push('High balance with low activity');
    riskScore += 20;
  }

  // Many unconfirmed transactions
  if (info.unconfirmedTxCount > 5) {
    flags.push('Unusually high unconfirmed transactions');
    riskScore += 25;
  }

  // Balance is zero but had activity (drained)
  if (info.balance === 0 && info.totalReceived > 0) {
    flags.push('Address fully drained');
    riskScore += 10;
  }

  riskScore = Math.min(riskScore, 100);

  const riskLevel =
    riskScore >= 70 ? 'critical' :
    riskScore >= 50 ? 'high' :
    riskScore >= 25 ? 'moderate' : 'low';

  return {
    address,
    riskScore,
    riskLevel,
    flags,
    stats: {
      balance: info.balance,
      txCount: info.txCount,
      totalReceived: info.totalReceived,
    },
  };
}

// Convert satoshis to BTC
export function satsToBtc(sats: number): string {
  return (sats / 1e8).toFixed(8);
}

// Hash utility for audit/verification (SHA-256)
export function hashData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}
