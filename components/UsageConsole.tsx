'use client';

import {useEffect, useMemo, useState} from 'react';

const FILTER_STORAGE_KEY = 'uae7guard-usage-console-filters-v1';

type TenantUsageEntry = {
  tenantId: string;
  total: number;
  success: number;
  validationErrors: number;
  authErrors: number;
  rateLimited: number;
  quotaBlocked: number;
  serverErrors: number;
  latencyMs: {
    p50: number;
    p95: number;
  };
  lastRequestAt?: string;
};

type UsageSnapshot = {
  generatedAt: string;
  tenantCount: number;
  tenants: TenantUsageEntry[];
};

type EvaluationSnapshot = {
  total: number;
  classBalance: {
    malicious: number;
    benign: number;
    maliciousRatioPct: number;
  };
  policyMetrics: {
    blockOnly: {
      precision: number;
      recall: number;
      fpr: number;
      f1: number;
    };
    blockOrReview: {
      precision: number;
      recall: number;
      fpr: number;
      f1: number;
    };
  };
};

type UsageConsoleProps = {
  usage: UsageSnapshot;
  evaluation: EvaluationSnapshot | null;
  evaluationError: string | null;
};

function formatIso(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function toCsv(rows: TenantUsageEntry[]) {
  const header = [
    'tenantId',
    'total',
    'success',
    'validationErrors',
    'authErrors',
    'rateLimited',
    'quotaBlocked',
    'serverErrors',
    'latencyP50',
    'latencyP95',
    'lastRequestAt'
  ];

  const lines = [header.join(',')];

  for (const row of rows) {
    const values = [
      row.tenantId,
      String(row.total),
      String(row.success),
      String(row.validationErrors),
      String(row.authErrors),
      String(row.rateLimited),
      String(row.quotaBlocked),
      String(row.serverErrors),
      String(row.latencyMs.p50),
      String(row.latencyMs.p95),
      row.lastRequestAt ?? ''
    ].map((value) => `"${value.replace(/"/g, '""')}"`);

    lines.push(values.join(','));
  }

  return lines.join('\n');
}

export default function UsageConsole({usage, evaluation, evaluationError}: UsageConsoleProps) {
  const [query, setQuery] = useState('');
  const [minTotal, setMinTotal] = useState('0');
  const [hasLoadedFilters, setHasLoadedFilters] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      const nextQuery = 'query' in parsed && typeof parsed.query === 'string' ? parsed.query : '';
      const rawMinTotal =
        'minTotal' in parsed && (typeof parsed.minTotal === 'string' || typeof parsed.minTotal === 'number')
          ? String(parsed.minTotal)
          : '0';

      setQuery(nextQuery);
      setMinTotal(rawMinTotal);
    } catch {
      // Ignore malformed local storage payloads.
    } finally {
      setHasLoadedFilters(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFilters) return;

    try {
      window.localStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({
          query,
          minTotal
        })
      );
    } catch {
      // Ignore storage write failures (private mode/quota).
    }
  }, [query, minTotal, hasLoadedFilters]);

  const filtered = useMemo(() => {
    const threshold = Math.max(0, Number(minTotal) || 0);
    const needle = query.trim().toLowerCase();

    return usage.tenants.filter((tenant) => {
      const matchQuery = needle ? tenant.tenantId.toLowerCase().includes(needle) : true;
      const matchThreshold = tenant.total >= threshold;
      return matchQuery && matchThreshold;
    });
  }, [usage.tenants, query, minTotal]);

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `uae7guard-usage-${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    const payload = {
      generatedAt: usage.generatedAt,
      exportedAt: new Date().toISOString(),
      filters: {
        query: query.trim(),
        minTotal: Math.max(0, Number(minTotal) || 0)
      },
      tenantCount: filtered.length,
      tenants: filtered
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json;charset=utf-8;'});
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `uae7guard-usage-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setQuery('');
    setMinTotal('0');

    try {
      window.localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch {
      // Ignore storage write failures (private mode/quota).
    }
  }

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Usage Console</h2>
          <p className="mt-1 text-sm text-zinc-400">Generated at: {formatIso(usage.generatedAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="cta-btn-secondary" onClick={exportCsv}>
            Export Filtered CSV
          </button>
          <button type="button" className="cta-btn-secondary" onClick={exportJson}>
            Export Filtered JSON
          </button>
          <button type="button" className="cta-btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>Tenant Filter</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="tenant id contains..."
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Min Total Requests</span>
          <input
            value={minTotal}
            onChange={(event) => setMinTotal(event.target.value)}
            type="number"
            min="0"
          />
        </label>

        <article className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-3 text-sm text-zinc-200">
          <p>
            <span className="text-zinc-400">Visible Tenants:</span> {filtered.length}
          </p>
          <p>
            <span className="text-zinc-400">Total Tenants:</span> {usage.tenantCount}
          </p>
        </article>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-700/70 bg-zinc-950/70">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400">
              <th className="px-3 py-3">Tenant</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Success</th>
              <th className="px-3 py-3">Rate Limit</th>
              <th className="px-3 py-3">Quota</th>
              <th className="px-3 py-3">p95</th>
              <th className="px-3 py-3">Last Request</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-zinc-500">
                  No tenant rows match current filters.
                </td>
              </tr>
            ) : (
              filtered.map((tenant) => (
                <tr key={tenant.tenantId} className="border-b border-zinc-900/70 text-zinc-200">
                  <td className="px-3 py-3 font-medium">{tenant.tenantId}</td>
                  <td className="px-3 py-3">{tenant.total}</td>
                  <td className="px-3 py-3">{tenant.success}</td>
                  <td className="px-3 py-3">{tenant.rateLimited}</td>
                  <td className="px-3 py-3">{tenant.quotaBlocked}</td>
                  <td className="px-3 py-3">{tenant.latencyMs.p95}ms</td>
                  <td className="px-3 py-3">{formatIso(tenant.lastRequestAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-4 rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Model Metrics</h3>

        {evaluationError ? (
          <p className="mt-2 text-sm text-rose-300">{evaluationError}</p>
        ) : evaluation ? (
          <div className="mt-3 grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
            <p>
              <span className="text-zinc-400">Samples:</span> {evaluation.total}
            </p>
            <p>
              <span className="text-zinc-400">Malicious Ratio:</span> {evaluation.classBalance.maliciousRatioPct}%
            </p>
            <p>
              <span className="text-zinc-400">Precision (Block):</span> {evaluation.policyMetrics.blockOnly.precision}%
            </p>
            <p>
              <span className="text-zinc-400">Recall (Block):</span> {evaluation.policyMetrics.blockOnly.recall}%
            </p>
            <p>
              <span className="text-zinc-400">FPR (Block):</span> {evaluation.policyMetrics.blockOnly.fpr}%
            </p>
            <p>
              <span className="text-zinc-400">F1 (Block):</span> {evaluation.policyMetrics.blockOnly.f1}%
            </p>
            <p>
              <span className="text-zinc-400">Precision (Block/Review):</span>{' '}
              {evaluation.policyMetrics.blockOrReview.precision}%
            </p>
            <p>
              <span className="text-zinc-400">FPR (Block/Review):</span>{' '}
              {evaluation.policyMetrics.blockOrReview.fpr}%
            </p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
