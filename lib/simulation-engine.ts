import {parseEther, toHex} from 'viem';
import type {AnalyzePayload, SimulationSummary} from '@/lib/analyze-types';

type RpcRequest = {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
};

type RpcSuccess<T> = {
  jsonrpc: '2.0';
  id: number;
  result: T;
};

type RpcFailure = {
  jsonrpc: '2.0';
  id: number;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

type CallTraceNode = {
  type?: string;
  from?: string;
  to?: string;
  input?: string;
  error?: string;
  calls?: CallTraceNode[];
};

export type SimulationExecution = {
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  source: 'server' | 'client' | 'none';
  usedChainId?: number;
  summary?: SimulationSummary;
  errors?: string[];
};

const APPROVE_SELECTOR = '095ea7b3';
const DEFAULT_RPC_TIMEOUT_MS = Number(process.env.SIM_RPC_TIMEOUT_MS ?? 3000);
const DEFAULT_TRACE_TIMEOUT_SECONDS = Number(process.env.SIM_TRACE_TIMEOUT_SECONDS ?? 2);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function decimalToEthString(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0';
  const normalized = String(value);

  if (normalized.includes('e') || normalized.includes('E')) {
    return value.toFixed(18).replace(/0+$/, '').replace(/\.$/, '') || '0';
  }

  return normalized;
}

function toWeiHex(transactionValue: number) {
  try {
    const wei = parseEther(decimalToEthString(transactionValue));
    return toHex(wei);
  } catch {
    return '0x0';
  }
}

function parseRpcError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Unknown RPC error';
}

function getRpcUrl(chainId?: number) {
  if (chainId) {
    const chainSpecific = process.env[`SIM_RPC_URL_${chainId}`]?.trim();
    if (chainSpecific) {
      return {url: chainSpecific, chainId};
    }
  }

  const defaultUrl = process.env.SIM_RPC_URL?.trim();
  if (defaultUrl) {
    return {url: defaultUrl, chainId};
  }

  return null;
}

function isUnlimitedApprovalData(hexData?: string) {
  if (!hexData || typeof hexData !== 'string') return false;
  const normalized = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
  if (normalized.length < 8 + 64 + 64) return false;
  if (!normalized.startsWith(APPROVE_SELECTOR)) return false;

  const amountWord = normalized.slice(8 + 64, 8 + 64 + 64).toLowerCase();
  return /^f{64}$/.test(amountWord);
}

function walkCallTrace(
  node: unknown,
  touchedContracts: Set<string>,
  summary: Required<SimulationSummary>
) {
  if (!node || typeof node !== 'object') return;

  const typedNode = node as CallTraceNode;
  const type = typeof typedNode.type === 'string' ? typedNode.type.toUpperCase() : '';

  if (type === 'DELEGATECALL') {
    summary.delegateCallDetected = true;
  }

  if (type === 'CREATE' || type === 'CREATE2') {
    summary.createdContract = true;
  }

  if (type === 'SELFDESTRUCT') {
    summary.selfDestructDetected = true;
  }

  if (typeof typedNode.error === 'string' && typedNode.error.toLowerCase().includes('selfdestruct')) {
    summary.selfDestructDetected = true;
  }

  if (typeof typedNode.input === 'string' && isUnlimitedApprovalData(typedNode.input)) {
    summary.unlimitedApprovalDetected = true;
  }

  if (typeof typedNode.to === 'string' && isAddress(typedNode.to)) {
    touchedContracts.add(normalizeAddress(typedNode.to));
  }

  if (Array.isArray(typedNode.calls)) {
    for (const child of typedNode.calls) {
      walkCallTrace(child, touchedContracts, summary);
    }
  }
}

async function callRpc<T>(
  url: string,
  method: string,
  params: unknown[],
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const body: RpcRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`RPC ${method} failed with HTTP ${response.status}`);
    }

    const parsed = (await response.json()) as RpcSuccess<T> | RpcFailure;
    if ('error' in parsed) {
      throw new Error(`RPC ${method} error: ${parsed.error.message}`);
    }

    return parsed.result;
  } finally {
    clearTimeout(timeout);
  }
}

export function getSimulationRuntimeInfo() {
  const chainSpecific = Object.entries(process.env)
    .filter(([key, value]) => key.startsWith('SIM_RPC_URL_') && Boolean(value))
    .map(([key]) => key.replace('SIM_RPC_URL_', ''));

  return {
    enabled: Boolean(process.env.SIM_RPC_URL || chainSpecific.length > 0),
    chainSpecific,
    timeoutMs: clamp(DEFAULT_RPC_TIMEOUT_MS, 500, 10_000),
    traceTimeoutSeconds: clamp(DEFAULT_TRACE_TIMEOUT_SECONDS, 1, 10)
  };
}

export async function runServerSideSimulation(
  payload: AnalyzePayload
): Promise<SimulationExecution> {
  if (!payload.from || !payload.data) {
    return {
      status: 'skipped',
      source: 'none',
      reason: 'missing_from_or_data'
    };
  }

  const rpcConfig = getRpcUrl(payload.chainId);
  if (!rpcConfig) {
    return {
      status: 'skipped',
      source: 'none',
      reason: 'rpc_not_configured'
    };
  }

  const timeoutMs = clamp(DEFAULT_RPC_TIMEOUT_MS, 500, 10_000);
  const traceTimeoutSeconds = clamp(DEFAULT_TRACE_TIMEOUT_SECONDS, 1, 10);

  const callObject = {
    from: payload.from,
    to: payload.address,
    data: payload.data,
    value: toWeiHex(payload.transactionValue)
  };

  const summary: Required<SimulationSummary> = {
    reverted: false,
    delegateCallDetected: false,
    selfDestructDetected: false,
    createdContract: false,
    unlimitedApprovalDetected: isUnlimitedApprovalData(payload.data),
    touchedUnknownContracts: 0
  };

  const errors: string[] = [];
  const touchedContracts = new Set<string>();

  if (isAddress(payload.address)) {
    touchedContracts.add(normalizeAddress(payload.address));
  }

  try {
    await callRpc<string>(rpcConfig.url, 'eth_call', [callObject, 'latest'], timeoutMs);
  } catch (error) {
    summary.reverted = true;
    errors.push(parseRpcError(error));
  }

  try {
    const trace = await callRpc<unknown>(
      rpcConfig.url,
      'debug_traceCall',
      [callObject, 'latest', {tracer: 'callTracer', timeout: `${traceTimeoutSeconds}s`}],
      timeoutMs
    );
    walkCallTrace(trace, touchedContracts, summary);
  } catch (error) {
    errors.push(parseRpcError(error));
  }

  const knownAddresses = new Set([
    normalizeAddress(payload.address),
    normalizeAddress(payload.from),
    ...payload.historicalAddresses
      .filter((value) => isAddress(value))
      .map((value) => normalizeAddress(value))
  ]);

  let unknownTouched = 0;
  for (const contract of touchedContracts) {
    if (!knownAddresses.has(contract)) {
      unknownTouched += 1;
    }
  }

  summary.touchedUnknownContracts = unknownTouched;

  return {
    status: errors.length > 0 ? 'error' : 'ok',
    source: 'server',
    reason: errors.length > 0 ? 'partial_or_failed_rpc' : undefined,
    usedChainId: payload.chainId,
    summary,
    errors: errors.length > 0 ? errors : undefined
  };
}
