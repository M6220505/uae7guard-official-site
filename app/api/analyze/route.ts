import { NextRequest, NextResponse } from 'next/server';
import { calculateOptimizedRisk } from '@/lib/optimized_risk_engine.js';
import { enforceApiAuthentication, enforceRateLimit, isEvmAddress } from '@/lib/api-security';
import { fetchBlockchainIntelligence } from '@/lib/blockchain-intelligence';

export async function POST(request: NextRequest) {
  const authError = enforceApiAuthentication(request);
  if (authError) return authError;

  const rateLimitError = enforceRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const { address, transactionValue, historicalAddresses, chainId = 1 } = body;

    if (!isEvmAddress(address)) {
      return NextResponse.json(
        { error: 'A valid EVM address is required' },
        { status: 400 }
      );
    }

    const normalizedChainId = Number.isFinite(Number(chainId)) ? Number(chainId) : 1;
    const liveIntelligence = await fetchBlockchainIntelligence(address, normalizedChainId);

    const riskAssessment = await calculateOptimizedRisk({
      walletAddress: address,
      walletAgeDays: liveIntelligence.walletAgeDays,
      transactionCount: liveIntelligence.transactionCount,
      balanceEth: liveIntelligence.balanceEth,
      threatScore: liveIntelligence.threatScore,
      blacklistAssociations: liveIntelligence.blacklistAssociations,
      isDirectlyBlacklisted: liveIntelligence.isDirectlyBlacklisted,
      isSmartContract: liveIntelligence.isSmartContract,
      transactionValue: Number(transactionValue) || 0,
      historicalAddresses: historicalAddresses || [],
      contractData: liveIntelligence.contractData,
      externalThreatAPIConfig: {
        enabled: Boolean(process.env.FORTA_API_KEY || process.env.CHAINALYSIS_API_KEY || process.env.ETHERSCAN_API_KEY),
      },
    });

    return NextResponse.json({
      ...riskAssessment,
      liveIntelligence,
      dataQuality: liveIntelligence.dataQuality,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: message },
      { status: 500 }
    );
  }
}
