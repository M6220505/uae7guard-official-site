import assert from 'node:assert/strict';
import { analyzeScamContent } from '../lib/scam-detection';
import engine from '../lib/optimized_risk_engine.js';

async function main() {
  const { calculateOptimizedRisk, ContractSafetyAnalyzer } = engine;

  const highRisk = await calculateOptimizedRisk({
    walletAddress: '0x000000000000000000000000000000000000dEaD',
    walletAgeDays: 0,
    transactionCount: 0,
    balanceEth: 0,
    threatScore: 100,
    blacklistAssociations: 5,
    isDirectlyBlacklisted: true,
    isSmartContract: false,
    historicalAddresses: [],
    contractData: {},
    externalThreatAPIConfig: { enabled: false },
  });

  assert.equal(highRisk.riskLevel, 'critical');
  assert.ok(highRisk.riskScore >= 90);

  const contract = ContractSafetyAnalyzer.analyzeContract({
    bytecode: '0x6000f4ff',
    sourceCode: 'contract Bad { function x() public { msg.sender.call{value: 1}(""); } }',
    isVerified: false,
  });

  assert.ok(contract.overallRisk >= 90);

  const scam = analyzeScamContent({
    text: 'Urgent claim: verify wallet and seed phrase in our Telegram before the airdrop expires',
    url: 'https://wallet-airdrop-verify.example',
  });

  assert.ok(scam.score >= 40);
  assert.ok(scam.findings.length >= 2);

  console.log('risk engine tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
