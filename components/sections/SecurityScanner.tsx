'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

export default function SecurityScanner() {
  const { address: walletAddress, isConnected } = useAccount();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Pre-fill with connected wallet address
  useEffect(() => {
    if (isConnected && walletAddress) {
      setAddress(walletAddress);
    }
  }, [isConnected, walletAddress]);

  const analyzeAddress = async () => {
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      alert('Please enter a valid Ethereum address (0x followed by 40 hex characters)');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <section id="scanner" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Security Scanner Portal
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Real-time risk assessment powered by our optimized detection engine
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Scanner input */}
          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
            {isConnected && walletAddress && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                ✓ Wallet connected: Using your address
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Ethereum address (0x...)"
                className="flex-1 px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={analyzeAddress}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Analyzing...' : 'Analyze Address'}
              </button>
            </div>

            {/* Example addresses */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-zinc-500">Try examples:</span>
              <button
                onClick={() => setAddress('0x0000000000000000000000000000000000000000')}
                className="text-sm px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 transition-colors"
              >
                Zero Address
              </button>
              <button
                onClick={() => setAddress('0x1234567890123456789012345678901234567890')}
                className="text-sm px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 transition-colors"
              >
                New Wallet
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              {/* Risk Score */}
              <div className="text-center mb-8">
                <div className={`text-7xl font-bold mb-2 ${getRiskColor(result.riskLevel)}`}>
                  {result.riskScore}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full ${getRiskBg(result.riskLevel)} border`}>
                  <span className={`font-semibold uppercase ${getRiskColor(result.riskLevel)}`}>
                    {result.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Decision */}
              <div className="mb-8 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-lg font-semibold text-white mb-2">
                  {result.decision}
                </div>
                <div className="text-zinc-400">
                  {result.recommendation}
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(result.breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-zinc-400 capitalize">
                          {key.replace('Component', '')}
                        </span>
                        <span className="text-white font-mono">
                          {value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Analysis Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Threat Type</span>
                      <span className="text-white font-mono text-sm">
                        {result.threatType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Confidence</span>
                      <span className="text-white font-mono">
                        {result.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection Modules */}
              {result.detectionModules && (
                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Detection Modules</h3>

                  {result.detectionModules.addressPoisoning && (
                    <div className="mb-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="text-sm font-semibold text-emerald-400 mb-2">
                        Address Poisoning Analysis
                      </div>
                      <div className="text-sm text-zinc-400">
                        Similarity: {(result.detectionModules.addressPoisoning.similarity * 100).toFixed(1)}%
                        {result.detectionModules.addressPoisoning.isPoisoningAttempt && (
                          <span className="ml-2 text-red-400 font-semibold">⚠️ Poisoning Detected</span>
                        )}
                      </div>
                    </div>
                  )}

                  {result.detectionModules.contractSafety && (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="text-sm font-semibold text-cyan-400 mb-2">
                        Smart Contract Safety
                      </div>
                      <div className="text-sm text-zinc-400">
                        Overall Risk: {result.detectionModules.contractSafety.overallRisk}%
                        {result.detectionModules.contractSafety.isSafe ? (
                          <span className="ml-2 text-emerald-400">✓ Safe</span>
                        ) : (
                          <span className="ml-2 text-red-400">⚠️ Unsafe</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
