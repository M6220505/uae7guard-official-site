import { NextResponse } from 'next/server';

// Import the risk engine
const { analyzeWeb3Wallet } = require('@/lib/optimized_risk_engine');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, balance, chainId, historicalAddresses = [] } = body;

    // Validate required parameters
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Prepare Web3 wallet data
    const web3WalletData = {
      address,
      balance: balance || '0',
      chainId: chainId || 1, // Default to Ethereum mainnet
      historicalAddresses,
      contractData: {}, // Can be populated with contract bytecode if analyzing a contract
    };

    // Analyze the wallet using the Web3-enabled risk engine
    const riskAssessment = await analyzeWeb3Wallet(web3WalletData);

    return NextResponse.json(riskAssessment);
  } catch (error) {
    console.error('Web3 wallet analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
