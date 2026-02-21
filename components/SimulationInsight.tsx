'use client';

import {useTranslations} from 'next-intl';

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

type SimulationInsightProps = {
  simulation?: SimulationExecution;
};

function statusClass(status: SimulationExecution['status']) {
  if (status === 'ok') return 'border-emerald-600/60 bg-emerald-900/20 text-emerald-200';
  if (status === 'error') return 'border-rose-600/60 bg-rose-900/20 text-rose-200';
  return 'border-zinc-600/60 bg-zinc-800/40 text-zinc-200';
}

function sourceClass(source: SimulationExecution['source']) {
  if (source === 'server') return 'border-cyan-600/60 bg-cyan-900/20 text-cyan-200';
  if (source === 'client') return 'border-amber-600/60 bg-amber-900/20 text-amber-200';
  return 'border-zinc-600/60 bg-zinc-800/40 text-zinc-200';
}

export default function SimulationInsight({simulation}: SimulationInsightProps) {
  const t = useTranslations('simulation');

  if (!simulation) return null;

  const summary = simulation.summary;
  const summaryItems = [
    {label: t('reverted'), value: summary?.reverted},
    {label: t('delegateCallDetected'), value: summary?.delegateCallDetected},
    {label: t('selfDestructDetected'), value: summary?.selfDestructDetected},
    {label: t('createdContract'), value: summary?.createdContract},
    {label: t('unlimitedApprovalDetected'), value: summary?.unlimitedApprovalDetected}
  ];

  function statusLabel(status: SimulationExecution['status']) {
    if (status === 'ok') return t('statusOk');
    if (status === 'error') return t('statusError');
    return t('statusSkipped');
  }

  function sourceLabel(source: SimulationExecution['source']) {
    if (source === 'server') return t('sourceServer');
    if (source === 'client') return t('sourceClient');
    return t('sourceNone');
  }

  return (
    <section className="mt-4 rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">{t('title')}</h3>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full border px-3 py-1 ${statusClass(simulation.status)}`}>
          {t('status')}: {statusLabel(simulation.status)}
        </span>
        <span className={`rounded-full border px-3 py-1 ${sourceClass(simulation.source)}`}>
          {t('source')}: {sourceLabel(simulation.source)}
        </span>
        {simulation.usedChainId ? (
          <span className="rounded-full border border-zinc-600/60 bg-zinc-800/40 px-3 py-1 text-zinc-200">
            {t('usedChain')}: {simulation.usedChainId}
          </span>
        ) : null}
      </div>

      {simulation.reason ? (
        <p className="mt-3 text-xs text-zinc-400">
          {t('reason')}: {simulation.reason}
        </p>
      ) : null}

      {summary ? (
        <div className="mt-3 grid gap-2 text-xs text-zinc-200 sm:grid-cols-2">
          {summaryItems.map((item) => (
            <p key={item.label}>
              <span className="text-zinc-400">{item.label}:</span>{' '}
              {item.value === true ? t('trueValue') : item.value === false ? t('falseValue') : '-'}
            </p>
          ))}
          <p>
            <span className="text-zinc-400">{t('touchedUnknownContracts')}:</span>{' '}
            {summary.touchedUnknownContracts ?? 0}
          </p>
        </div>
      ) : null}

      {simulation.errors?.length ? (
        <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/20 p-3 text-xs text-amber-200">
          <p className="font-semibold">{t('errors')}</p>
          <ul className="mt-1 list-disc space-y-1 ps-4">
            {simulation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
