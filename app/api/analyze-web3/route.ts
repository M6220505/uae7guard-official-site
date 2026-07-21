import { NextRequest, NextResponse } from 'next/server';
import { analyzeWeb3Wallet } from '@/lib/optimized_risk_engine.js';
import { enforceApiAuthentication, enforceRateLimit, isEvmAddress } from '@/lib/api-security';
import { fetchBlockchainIntelligence } from '@/lib/blockchain-intelligence';

export async function POST(request: NextRequest) {
  const authError = enforceApiAuthentication(request);
  if (authError) return authError;

  const rateLimitError = enforceRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const { address, balance, chainId, historicalAddresses = [] } = body;

    if (!isEvmAddress(address)) {
      return NextResponse.json(
        { error: 'A valid EVM address is required' },
        { status: 400 }
      );
    }

    const normalizedChainId = Number.isFinite(Number(chainId)) ? Number(chainId) : 1;
    const liveIntelligence = await fetchBlockchainIntelligence(address, normalizedChainId);

    const riskAssessment = await analyzeWeb3Wallet({
      address,
      balance: balance || String(liveIntelligence.balanceEth),
      chainId: normalizedChainId,
      historicalAddresses,
      contractData: liveIntelligence.contractData,
      blockchainData: liveIntelligence,
    });

    return NextResponse.json(riskAssessment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Web3 wallet analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: message },
      { status: 500 }
    );
  }
}
