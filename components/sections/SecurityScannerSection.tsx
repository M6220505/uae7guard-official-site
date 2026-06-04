'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import SimulationInsight from '@/components/SimulationInsight';

type ExternalSignal = {
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  id?: string;
  note?: string;
};

type SimulationSummary = {
  reverted?: boolean;
  delegateCallDetected?: boolean;
  selfDestructDetected?: boolean;
  createdContract?: boolean;
  unlimitedApprovalDetected?: boolean;
  touchedUnknownContracts?: number;
};

type SimulationExecution = {
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  source: 'server' | 'client' | 'none';
  usedChainId?: number;
  summary?: SimulationSummary;
  errors?: string[];
};

type ScanResult = {
  riskScore: number;
  riskLevel: string;
  decision: string;
  confidence: number;
  threatType: string;
  explanation?: string;
  latencyMs: number;
  breakdown: Record<string, number>;
  simulation?: SimulationExecution;
  requestId?: string;
  policyVersion?: string;
};

export default function SecurityScannerSection() {
  const t = useTranslations('scanner');
  const [address, setAddress] = useState('');
  const [from, setFrom] = useState('');
  const [chainId, setChainId] = useState('1');
  const [data, setData] = useState('');
  const [transactionValue, setTransactionValue] = useState('1');
  const [history, setHistory] = useState('');
  const [externalSignalsText, setExternalSignalsText] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function parseExternalSignals(value: string): ExternalSignal[] {
    const output: ExternalSignal[] = [];
    for (const rawLine of value.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;

      const [sourceRaw, severityRaw = 'medium', idRaw, noteRaw] = line
        .split('|')
        .map((segment) => segment.trim());
      if (!sourceRaw) continue;

      const normalizedSeverity = severityRaw.toLowerCase();
      const severity: ExternalSignal['severity'] =
        normalizedSeverity === 'low' ||
        normalizedSeverity === 'medium' ||
        normalizedSeverity === 'high' ||
        normalizedSeverity === 'critical'
          ? normalizedSeverity
          : 'medium';

      output.push({
        source: sourceRaw,
        severity,
        id: idRaw || undefined,
        note: noteRaw || undefined
      });
    }
    return output;
  }

  async function onScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          address,
          from: from.trim() || undefined,
          chainId: chainId.trim() ? Number(chainId) : undefined,
          data: data.trim() || undefined,
          transactionValue: Number(transactionValue),
          historicalAddresses: history
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
          externalSignals: parseExternalSignals(externalSignalsText)
        })
      });

      const payload = (await response.json()) as ScanResult & {error?: string};

      if (!response.ok) {
        throw new Error(payload.error ?? 'Scan failed');
      }

      setResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unknown error');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="scanner" className="glass-panel p-6 md:p-7">
      <h2 className="section-title">{t('title')}</h2>
      <p className="mt-2 max-w-2xl text-zinc-300">{t('description')}</p>

      <form onSubmit={onScan} className="mt-6 grid gap-4">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('inputLabel')}</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={t('inputPlaceholder')}
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('fromLabel')}</span>
            <input
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="0x1111111111111111111111111111111111111111"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('chainIdLabel')}</span>
            <input
              value={chainId}
              onChange={(event) => setChainId(event.target.value)}
              type="number"
              min="1"
              step="1"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('valueLabel')}</span>
            <input
              value={transactionValue}
              onChange={(event) => setTransactionValue(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('historyLabel')}</span>
            <input
              value={history}
              onChange={(event) => setHistory(event.target.value)}
              placeholder="0xabc...,0xdef..."
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('dataLabel')}</span>
          <textarea
            value={data}
            onChange={(event) => setData(event.target.value)}
            rows={3}
            placeholder={t('dataPlaceholder')}
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('externalSignalsLabel')}</span>
          <textarea
            value={externalSignalsText}
            onChange={(event) => setExternalSignalsText(event.target.value)}
            rows={3}
            placeholder={t('externalSignalsPlaceholder')}
          />
          <p className="text-xs text-zinc-500">{t('externalSignalsHelp')}</p>
        </label>

        <button type="submit" className="cta-btn w-fit" disabled={loading}>
          {loading ? t('analyzing') : t('submit')}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {result ? (
        <article className="mt-6 rounded-xl border border-zinc-700/80 bg-zinc-950/75 p-4">
          {result.explanation ? (
            <p className="mb-3 text-sm text-zinc-300">{result.explanation}</p>
          ) : null}
          <div className="grid gap-2 text-sm text-zinc-200 md:grid-cols-3">
            <p>
              <span className="text-zinc-400">Risk Score:</span> {result.riskScore}
            </p>
            <p>
              <span className="text-zinc-400">Risk Level:</span> {result.riskLevel}
            </p>
            <p>
              <span className="text-zinc-400">Decision:</span> {result.decision}
            </p>
            <p>
              <span className="text-zinc-400">Confidence:</span> {result.confidence}%
            </p>
            <p>
              <span className="text-zinc-400">Threat Type:</span> {result.threatType}
            </p>
            <p>
              <span className="text-zinc-400">Latency:</span> {result.latencyMs}ms
            </p>
          </div>

          <div className="mt-4 grid gap-2 text-xs text-zinc-300 md:grid-cols-3">
            {Object.entries(result.breakdown).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-zinc-700/70 bg-zinc-900/60 p-2">
                <p className="uppercase tracking-wide text-zinc-400">{key}</p>
                <p className="mt-1 text-sm text-cyan-200">{value}</p>
              </div>
            ))}
          </div>

          <SimulationInsight simulation={result.simulation} />

          <div className="mt-3 text-xs text-zinc-500">
            {result.policyVersion ? (
              <p>
                Policy: {result.policyVersion}
                {result.requestId ? ` | Request: ${result.requestId}` : ''}
              </p>
            ) : null}
          </div>
        </article>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{t('idleHint')}</p>
      )}
    </section>
  );
}
