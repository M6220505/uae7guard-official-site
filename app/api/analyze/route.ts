import { NextRequest, NextResponse } from 'next/server';
import { calculateOptimizedRisk } from '@/lib/optimized_risk_engine.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, transactionValue, historicalAddresses } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Simulate wallet data (in production, this would fetch from blockchain APIs)
    const mockWalletData = generateMockWalletData(address);

    // Calculate risk using the optimized risk engine
    const riskAssessment = await calculateOptimizedRisk({
      walletAddress: address,
      walletAgeDays: mockWalletData.walletAgeDays,
      transactionCount: mockWalletData.transactionCount,
      balanceEth: mockWalletData.balanceEth,
      threatScore: mockWalletData.threatScore,
      blacklistAssociations: mockWalletData.blacklistAssociations,
      isDirectlyBlacklisted: mockWalletData.isDirectlyBlacklisted,
      isSmartContract: mockWalletData.isSmartContract,
      transactionValue: transactionValue || 0,
      historicalAddresses: historicalAddresses || [],
      contractData: mockWalletData.contractData,
    });

    return NextResponse.json(riskAssessment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: message },
      { status: 500 }
    );
  }
}

// Mock data generator (in production, replace with real blockchain API calls)
function generateMockWalletData(address: string) {
  // Zero address - high risk
  if (address === '0x0000000000000000000000000000000000000000') {
    return {
      walletAgeDays: 0,
      transactionCount: 0,
      balanceEth: 0,
      threatScore: 0.95,
      blacklistAssociations: 0,
      isDirectlyBlacklisted: true,
      isSmartContract: false,
      contractData: {},
    };
  }

  // New wallet pattern (1234...)
  if (address.includes('1234567890')) {
    return {
      walletAgeDays: 2,
      transactionCount: 3,
      balanceEth: 0.05,
      threatScore: 0.4,
      blacklistAssociations: 0,
      isDirectlyBlacklisted: false,
      isSmartContract: false,
      contractData: {},
    };
  }

  // Smart contract pattern (contains repeated chars)
  if (/([a-f0-9])\1{4,}/i.test(address)) {
    return {
      walletAgeDays: 150,
      transactionCount: 1200,
      balanceEth: 50.5,
      threatScore: 0.3,
      blacklistAssociations: 0,
      isDirectlyBlacklisted: false,
      isSmartContract: true,
      contractData: {
        bytecode: '0x608060405260043610f4',
        sourceCode: 'contract Token { function transfer(address to, uint256 amount) public returns (bool) { /* ... */ } }',
        isVerified: true,
      },
    };
  }

  // Default: established wallet
  return {
    walletAgeDays: 450,
    transactionCount: 850,
    balanceEth: 3.2,
    threatScore: 0.15,
    blacklistAssociations: 0,
    isDirectlyBlacklisted: false,
    isSmartContract: false,
    contractData: {},
  };
}
