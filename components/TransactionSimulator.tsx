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

type AnalysisResponse = {
  riskScore: number;
  riskLevel: string;
  decision: string;
  confidence: number;
  threatType: string;
  explanation: string;
  latencyMs: number;
  simulation?: SimulationExecution;
  requestId?: string;
  policyVersion?: string;
};

export default function TransactionSimulator() {
  const t = useTranslations('simulator');
  const [address, setAddress] = useState('');
  const [from, setFrom] = useState('');
  const [chainId, setChainId] = useState('1');
  const [data, setData] = useState('');
  const [value, setValue] = useState('1.5');
  const [history, setHistory] = useState('');
  const [externalSignalsText, setExternalSignalsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
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

  async function onSimulate(event: React.FormEvent<HTMLFormElement>) {
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
          transactionValue: Number(value),
          historicalAddresses: history
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          externalSignals: parseExternalSignals(externalSignalsText)
        })
      });

      const payload = (await response.json()) as AnalysisResponse & {error?: string};

      if (!response.ok) {
        throw new Error(payload.error ?? 'Simulation failed');
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
    <section className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
      <form onSubmit={onSimulate} className="mt-4 grid gap-4">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('address')}</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="0x..."
            required
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('value')}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('from')}</span>
            <input
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="0x1111111111111111111111111111111111111111"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            <span>{t('chainId')}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={chainId}
              onChange={(event) => setChainId(event.target.value)}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('data')}</span>
          <textarea
            value={data}
            onChange={(event) => setData(event.target.value)}
            rows={3}
            placeholder="0x095ea7b3..."
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('history')}</span>
          <textarea
            value={history}
            onChange={(event) => setHistory(event.target.value)}
            rows={3}
            placeholder="0xabc...,0xdef..."
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('externalSignals')}</span>
          <textarea
            value={externalSignalsText}
            onChange={(event) => setExternalSignalsText(event.target.value)}
            rows={3}
            placeholder={t('externalSignalsPlaceholder')}
          />
          <p className="text-xs text-zinc-500">{t('externalSignalsHelp')}</p>
        </label>

        <button type="submit" className="cta-btn w-fit" disabled={loading}>
          {loading ? t('simulating') : t('simulate')}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {result ? (
        <article className="mt-4 rounded-xl border border-cyan-800/70 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-300">{result.explanation}</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
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

          <SimulationInsight simulation={result.simulation} />

          {result.policyVersion ? (
            <p className="mt-3 text-xs text-zinc-500">
              Policy: {result.policyVersion}
              {result.requestId ? ` | Request: ${result.requestId}` : ''}
            </p>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
