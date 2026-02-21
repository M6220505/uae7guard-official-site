'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useAccount} from 'wagmi';

type WalletResult = {
  riskScore: number;
  riskLevel: string;
  decision: string;
  confidence: number;
  threatType: string;
};

export default function Web3WalletAnalyzer() {
  const t = useTranslations('wallet');
  const {address, isConnected} = useAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);

  async function analyzeConnectedWallet() {
    if (!address) return;
    setLoading(true);

    try {
      const response = await fetch('/api/wallet-analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({address})
      });

      const payload = (await response.json()) as WalletResult;
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
      <p className="mt-2 text-zinc-300">{t('desc')}</p>

      {isConnected && address ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg border border-zinc-700/70 bg-zinc-900/70 p-3 text-sm text-zinc-300">
            {address}
          </p>
          <button
            type="button"
            className="cta-btn"
            onClick={analyzeConnectedWallet}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : t('analyze')}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">{t('connectFirst')}</p>
      )}

      {result ? (
        <div className="mt-4 rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4 text-sm text-zinc-200">
          <p>Risk Score: {result.riskScore}</p>
          <p>Risk Level: {result.riskLevel}</p>
          <p>Decision: {result.decision}</p>
          <p>Confidence: {result.confidence}%</p>
          <p>Threat Type: {result.threatType}</p>
        </div>
      ) : null}
    </section>
  );
}
