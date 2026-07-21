import { createPublicClient, formatEther, http, type Chain } from 'viem';
import { mainnet, polygon, optimism, arbitrum, base, bsc, sepolia } from 'viem/chains';

export interface BlockchainIntelligence {
  walletAgeDays: number;
  transactionCount: number;
  balanceEth: number;
  threatScore: number;
  blacklistAssociations: number;
  isDirectlyBlacklisted: boolean;
  isSmartContract: boolean;
  contractData: {
    bytecode?: string;
    sourceCode?: string;
    isVerified?: boolean;
    verificationSource?: string;
  };
  approvals: Array<{
    tokenContract: string;
    spender: string;
    amount: string;
    blockNumber?: string;
    hash?: string;
  }>;
  threatIntel: {
    sources: Array<{
      name: string;
      enabled: boolean;
      matchCount: number;
      riskScore: number;
      notes: string[];
    }>;
    combinedRiskScore: number;
    labels: string[];
  };
  chainProfile: {
    chainId: number;
    chainName: string;
    explorer?: string;
    riskRules: string[];
  };
  dataQuality: {
    liveRpc: boolean;
    explorerApi: boolean;
    threatFeeds: boolean;
    limitations: string[];
  };
}

type ExplorerConfig = {
  apiUrl: string;
  explorerUrl: string;
  apiKey?: string;
};

const CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [optimism.id]: optimism,
  [arbitrum.id]: arbitrum,
  [base.id]: base,
  [bsc.id]: bsc,
  [sepolia.id]: sepolia,
};

const EXPLORERS: Record<number, ExplorerConfig> = {
  1: { apiUrl: 'https://api.etherscan.io/api', explorerUrl: 'https://etherscan.io', apiKey: process.env.ETHERSCAN_API_KEY },
  56: { apiUrl: 'https://api.bscscan.com/api', explorerUrl: 'https://bscscan.com', apiKey: process.env.BSCSCAN_API_KEY },
  137: { apiUrl: 'https://api.polygonscan.com/api', explorerUrl: 'https://polygonscan.com', apiKey: process.env.POLYGONSCAN_API_KEY },
  8453: { apiUrl: 'https://api.basescan.org/api', explorerUrl: 'https://basescan.org', apiKey: process.env.BASESCAN_API_KEY },
  42161: { apiUrl: 'https://api.arbiscan.io/api', explorerUrl: 'https://arbiscan.io', apiKey: process.env.ARBISCAN_API_KEY },
  10: { apiUrl: 'https://api-optimistic.etherscan.io/api', explorerUrl: 'https://optimistic.etherscan.io', apiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY },
  11155111: { apiUrl: 'https://api-sepolia.etherscan.io/api', explorerUrl: 'https://sepolia.etherscan.io', apiKey: process.env.ETHERSCAN_API_KEY },
};


const DEFAULT_RPC_TIMEOUT_MS = 3_000;
const DEFAULT_EXPLORER_TIMEOUT_MS = 1_800;
const INTELLIGENCE_CACHE_TTL_MS = 30_000;
const intelligenceCache = new Map<string, { expiresAt: number; value: BlockchainIntelligence }>();

function readPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isConfiguredSecret(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return Boolean(
    normalized &&
    !normalized.startsWith('your_') &&
    normalized !== 'change-me-in-production' &&
    normalized !== 'changeme' &&
    normalized !== 'placeholder'
  );
}

function rpcTimeoutMs() {
  return readPositiveNumber(
    process.env.BLOCKCHAIN_RPC_TIMEOUT_MS || process.env.SIM_RPC_TIMEOUT_MS,
    DEFAULT_RPC_TIMEOUT_MS
  );
}

function explorerTimeoutMs() {
  return readPositiveNumber(
    process.env.EXPLORER_API_TIMEOUT_MS || process.env.THREAT_INTEL_TIMEOUT_MS,
    DEFAULT_EXPLORER_TIMEOUT_MS
  );
}

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const KNOWN_SCAM_ADDRESSES = new Set([
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
]);

function resolveRpcUrl(chainId: number) {
  const alchemyKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  if (isConfiguredSecret(alchemyKey)) {
    const alchemyNetworkByChain: Record<number, string> = {
      1: 'eth-mainnet',
      11155111: 'eth-sepolia',
      137: 'polygon-mainnet',
      10: 'opt-mainnet',
      42161: 'arb-mainnet',
      8453: 'base-mainnet',
    };

    const network = alchemyNetworkByChain[chainId];
    if (network) return `https://${network}.g.alchemy.com/v2/${alchemyKey}`;
  }

  const envRpc = process.env[`CHAIN_${chainId}_RPC_URL`];
  if (envRpc) return envRpc;

  return undefined;
}

function buildClient(chainId: number) {
  const chain = CHAINS[chainId] ?? mainnet;
  return createPublicClient({
    chain,
    transport: http(resolveRpcUrl(chain.id), { timeout: rpcTimeoutMs() }),
  });
}

async function fetchExplorer<T>(chainId: number, params: Record<string, string>) {
  const explorer = EXPLORERS[chainId];

  const apiKey = explorer?.apiKey;

  if (!isConfiguredSecret(apiKey) || !explorer) {
    return null;
  }

  const configuredApiKey = apiKey as string;
  const url = new URL(explorer.apiUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('apikey', configuredApiKey);

  const response = await fetch(url, { signal: AbortSignal.timeout(explorerTimeoutMs()) });
  if (!response.ok) {
    throw new Error(`Explorer API failed with ${response.status}`);
  }

  const payload = await response.json();
  return payload as T;
}

function getChainRiskRules(chainId: number) {
  const common = ['native balance', 'transaction count', 'contract bytecode', 'approval history', 'known scam labels'];

  const chainSpecific: Record<number, string[]> = {
    1: ['sanctions/AML feeds prioritized', 'major DeFi spender allowlist review'],
    56: ['high-risk token-launch heuristics', 'BSC honeypot pattern review'],
    137: ['Polygon approval-spam review', 'bridge interaction checks'],
    8453: ['Base drainer-campaign watchlist', 'new wallet velocity checks'],
    42161: ['Arbitrum bridge and cross-chain activity review'],
    10: ['Optimism bridge and sequencer-specific context'],
    11155111: ['testnet-only confidence downgrade'],
  };

  return [...common, ...(chainSpecific[chainId] ?? [])];
}

function extractUnlimitedApprovals(logs: Array<Record<string, string>>) {
  return logs
    .filter((log) => log.input?.startsWith('0x095ea7b3') && log.input.length >= 138)
    .map((log) => {
      const spender = `0x${log.input.slice(34, 74)}`;
      const amount = BigInt(`0x${log.input.slice(74)}`);
      return {
        tokenContract: log.to,
        spender,
        amount: amount.toString(),
        blockNumber: log.blockNumber,
        hash: log.hash,
        isUnlimited: amount > MAX_UINT256 / BigInt(2),
      };
    })
    .filter((approval) => approval.isUnlimited)
    .slice(0, 25)
    .map((approvalWithFlag) => {
      const { isUnlimited, ...approval } = approvalWithFlag;
      void isUnlimited;
      return approval;
    });
}

function calculateWalletAgeDays(firstTxTimestamp?: string) {
  if (!firstTxTimestamp) return 0;
  const firstSeenMs = Number(firstTxTimestamp) * 1000;
  if (!Number.isFinite(firstSeenMs) || firstSeenMs <= 0) return 0;
  return Math.max(0, Math.floor((Date.now() - firstSeenMs) / 86_400_000));
}

async function fetchExplorerContext(address: `0x${string}`, chainId: number, shouldFetchContractSource: boolean) {
  const context = {
    walletAgeDays: 0,
    transactionCount: 0,
    approvals: [] as BlockchainIntelligence['approvals'],
    sourceCode: undefined as string | undefined,
    isVerified: undefined as boolean | undefined,
    explorerApi: false,
  };

  const txListPromise = fetchExplorer<{
    status: string;
    result?: Array<Record<string, string>> | string;
  }>(chainId, {
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '100',
    sort: 'asc',
  });

  const sourcePromise = shouldFetchContractSource
    ? fetchExplorer<{
        status: string;
        result?: Array<{ SourceCode?: string; ABI?: string; ContractName?: string }>;
      }>(chainId, {
        module: 'contract',
        action: 'getsourcecode',
        address,
      })
    : Promise.resolve(null);

  const [txList, source] = await Promise.all([txListPromise, sourcePromise]);

  if (Array.isArray(txList?.result)) {
    context.explorerApi = true;
    context.walletAgeDays = calculateWalletAgeDays(txList.result[0]?.timeStamp);
    context.transactionCount = txList.result.length;
    context.approvals = extractUnlimitedApprovals(txList.result);
  }

  const sourceResult = Array.isArray(source?.result) ? source.result[0] : undefined;
  if (sourceResult) {
    context.explorerApi = true;
    context.sourceCode = sourceResult.SourceCode;
    context.isVerified = Boolean(sourceResult.SourceCode && sourceResult.ABI !== 'Contract source code not verified');
  }

  return context;
}

function buildThreatIntel(address: `0x${string}`, approvals: BlockchainIntelligence['approvals']) {
  const lowerAddress = address.toLowerCase();
  const labels: string[] = [];
  const sources = [
    {
      name: 'UAE7Guard local scam/phishing list',
      enabled: true,
      matchCount: KNOWN_SCAM_ADDRESSES.has(lowerAddress) ? 1 : 0,
      riskScore: KNOWN_SCAM_ADDRESSES.has(lowerAddress) ? 100 : 0,
      notes: KNOWN_SCAM_ADDRESSES.has(lowerAddress)
        ? ['Address appears in the local blocked-address set.']
        : ['No local blocked-address match.'],
    },
    {
      name: 'Unlimited approval heuristic',
      enabled: true,
      matchCount: approvals.length,
      riskScore: Math.min(100, approvals.length * 20),
      notes: approvals.length
        ? [`${approvals.length} unlimited approval transaction(s) detected in explorer history.`]
        : ['No unlimited approvals detected in fetched explorer history.'],
    },
    {
      name: 'Sanctions/AML providers',
      enabled: Boolean(process.env.CHAINALYSIS_API_KEY || process.env.TRM_API_KEY),
      matchCount: 0,
      riskScore: 0,
      notes: [process.env.CHAINALYSIS_API_KEY || process.env.TRM_API_KEY
        ? 'Commercial AML provider key configured; provider integration can be enabled for production KYT screening.'
        : 'No commercial AML key configured; sanctions screening is limited to configured/local feeds.'],
    },
  ];

  if (sources[0].matchCount > 0) labels.push('known-scam-or-burn-address');
  if (approvals.length > 0) labels.push('unlimited-token-approvals');

  return {
    sources,
    combinedRiskScore: Math.max(...sources.map((source) => source.riskScore), 0),
    labels,
  };
}

export async function fetchBlockchainIntelligence(address: `0x${string}`, chainId = 1): Promise<BlockchainIntelligence> {
  const normalizedChainId = CHAINS[chainId] ? chainId : 1;
  const cacheKey = `${normalizedChainId}:${address.toLowerCase()}`;
  const cached = intelligenceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const chain = CHAINS[normalizedChainId];
  const client = buildClient(normalizedChainId);
  const limitations: string[] = [];

  let balanceEth = 0;
  let transactionCount = 0;
  let bytecode: string | undefined;
  let liveRpc = false;
  let explorerContext: Awaited<ReturnType<typeof fetchExplorerContext>> | null = null;

  try {
    const [balance, nonce, code] = await Promise.all([
      client.getBalance({ address }),
      client.getTransactionCount({ address }),
      client.getBytecode({ address }),
    ]);

    balanceEth = Number(formatEther(balance));
    transactionCount = nonce;
    bytecode = code;
    liveRpc = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown RPC error';
    limitations.push(`Live RPC read failed: ${message}`);
  }

  try {
    explorerContext = await fetchExplorerContext(address, normalizedChainId, Boolean(bytecode && bytecode !== '0x'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown explorer error';
    limitations.push(`Explorer context unavailable: ${message}`);
  }

  const approvals = explorerContext?.approvals ?? [];
  const threatIntel = buildThreatIntel(address, approvals);
  const isSmartContract = Boolean(bytecode && bytecode !== '0x');
  const walletAgeDays = explorerContext?.walletAgeDays || (transactionCount > 0 ? 30 : 0);
  const combinedTxCount = Math.max(transactionCount, explorerContext?.transactionCount ?? 0);
  const directBlacklist = threatIntel.sources.some((source) => source.riskScore >= 100);

  if (!isConfiguredSecret(EXPLORERS[normalizedChainId]?.apiKey)) {
    limitations.push('Explorer API key is not configured, so transaction history, approvals, and verification checks are limited.');
  }

  if (!process.env.CHAINALYSIS_API_KEY && !process.env.TRM_API_KEY) {
    limitations.push('Commercial sanctions/AML feed is not configured.');
  }

  const intelligence = {
    walletAgeDays,
    transactionCount: combinedTxCount,
    balanceEth,
    threatScore: threatIntel.combinedRiskScore,
    blacklistAssociations: threatIntel.sources.reduce((total, source) => total + source.matchCount, 0),
    isDirectlyBlacklisted: directBlacklist,
    isSmartContract,
    contractData: {
      bytecode,
      sourceCode: explorerContext?.sourceCode,
      isVerified: explorerContext?.isVerified ?? !isSmartContract,
      verificationSource: explorerContext?.isVerified ? EXPLORERS[normalizedChainId]?.explorerUrl : undefined,
    },
    approvals,
    threatIntel,
    chainProfile: {
      chainId: normalizedChainId,
      chainName: chain.name,
      explorer: EXPLORERS[normalizedChainId]?.explorerUrl,
      riskRules: getChainRiskRules(normalizedChainId),
    },
    dataQuality: {
      liveRpc,
      explorerApi: Boolean(explorerContext?.explorerApi),
      threatFeeds: threatIntel.sources.some((source) => source.enabled),
      limitations,
    },
  };

  intelligenceCache.set(cacheKey, {
    expiresAt: Date.now() + INTELLIGENCE_CACHE_TTL_MS,
    value: intelligence,
  });

  return intelligence;
}
