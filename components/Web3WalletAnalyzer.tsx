'use client';

import { useAccount, useBalance } from 'wagmi';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function Web3WalletAnalyzer() {
  const t = useTranslations('scanner');
  const { address, isConnected, chain } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeConnectedWallet = async () => {
    if (!address) return;

    setIsAnalyzing(true);
    try {
      // Call the analyze API with Web3 wallet data
      const response = await fetch('/api/analyze-web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          balance: balanceData?.formatted || '0',
          chainId: chain?.id,
        }),
      });

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-dark-elevated border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Connected Wallet Analysis</h3>
            <p className="text-sm text-zinc-400">Real-time risk assessment of your connected wallet</p>
          </div>
        </div>
        <p className="text-zinc-400 text-center py-8">
          Connect your wallet to analyze its security status in real-time
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-elevated border border-emerald-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Connected Wallet Analysis</h3>
            <p className="text-sm text-zinc-400">
              {address?.slice(0, 6)}...{address?.slice(-4)} on {chain?.name}
            </p>
          </div>
        </div>
        <motion.button
          onClick={analyzeConnectedWallet}
          disabled={isAnalyzing}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAnalyzing ? t('analyzing') : t('analyze')}
        </motion.button>
      </div>

      {balanceData && (
        <div className="mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Balance</span>
            <span className="text-white font-mono font-semibold">
              {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
            </span>
          </div>
        </div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className={`p-4 rounded-lg border-2 ${
            analysis.riskLevel === 'low' ? 'bg-emerald-500/10 border-emerald-500/50' :
            analysis.riskLevel === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/50' :
            analysis.riskLevel === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
            'bg-red-500/10 border-red-500/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400">{t('risk')}</span>
              <span className={`text-2xl font-bold ${
                analysis.riskLevel === 'low' ? 'text-emerald-500' :
                analysis.riskLevel === 'moderate' ? 'text-yellow-500' :
                analysis.riskLevel === 'high' ? 'text-orange-500' :
                'text-red-500'
              }`}>
                {analysis.riskScore}/100
              </span>
            </div>
            <div className="text-sm text-zinc-300 mb-2">{analysis.recommendation}</div>
            <div className="text-xs text-zinc-500">
              Confidence: {analysis.confidence}% | Threat Type: {analysis.threatType}
            </div>
          </div>

          {analysis.web3Metadata && (
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">Web3 Metadata</h4>
              <div className="space-y-1 text-xs text-zinc-500">
                <div>Chain ID: {analysis.web3Metadata.chainId}</div>
                <div>Analyzed: {new Date(analysis.web3Metadata.timestamp).toLocaleString()}</div>
                <div>Status: ✓ Connected Wallet Analysis</div>
              </div>
            </div>
          )}

          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-400 mb-3">{t('riskBreakdown')}</h4>
            <div className="space-y-2">
              {Object.entries(analysis.breakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 capitalize">{key.replace('Component', '')}</span>
                  <span className="text-white font-mono">{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
