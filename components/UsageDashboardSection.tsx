import {evaluateDefaultDataset} from '@/lib/label-evaluator.mjs';
import {getAnalyzeTelemetrySnapshot} from '@/lib/telemetry';
import {getTenantRuntimeInfo} from '@/lib/tenant-auth';
import {getUsageSnapshot} from '@/lib/usage-metrics';

export default function UsageDashboardSection() {
  const usage = getUsageSnapshot();
  const telemetry = getAnalyzeTelemetrySnapshot();
  const tenants = getTenantRuntimeInfo();

  let evaluation: ReturnType<typeof evaluateDefaultDataset> | null = null;
  let evaluationError: string | null = null;

  try {
    evaluation = evaluateDefaultDataset();
  } catch (error) {
    evaluationError = error instanceof Error ? error.message : 'Evaluation unavailable';
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">Usage Dashboard</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Live tenant-level request metrics and automatic dataset evaluation.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Tenants</p>
          <p className="mt-2 text-2xl font-semibold text-white">{usage.tenantCount}</p>
        </article>
        <article className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Requests</p>
          <p className="mt-2 text-2xl font-semibold text-white">{telemetry.totalRequests}</p>
        </article>
        <article className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">p95 Latency</p>
          <p className="mt-2 text-2xl font-semibold text-white">{telemetry.latencyMs.p95}ms</p>
        </article>
        <article className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Mode</p>
          <p className="mt-2 text-lg font-semibold text-white">{tenants.mode}</p>
        </article>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-700/70 bg-zinc-950/70">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400">
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Success</th>
              <th className="px-4 py-3">Rate Limited</th>
              <th className="px-4 py-3">Quota Blocked</th>
              <th className="px-4 py-3">p95 (ms)</th>
            </tr>
          </thead>
          <tbody>
            {usage.tenants.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-500" colSpan={6}>
                  No tenant traffic yet.
                </td>
              </tr>
            ) : (
              usage.tenants.map((tenant) => (
                <tr key={tenant.tenantId} className="border-b border-zinc-900/70 text-zinc-200">
                  <td className="px-4 py-3 font-medium">{tenant.tenantId}</td>
                  <td className="px-4 py-3">{tenant.total}</td>
                  <td className="px-4 py-3">{tenant.success}</td>
                  <td className="px-4 py-3">{tenant.rateLimited}</td>
                  <td className="px-4 py-3">{tenant.quotaBlocked}</td>
                  <td className="px-4 py-3">{tenant.latencyMs.p95}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-5 rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Dataset Evaluation
        </h3>
        {evaluationError ? (
          <p className="mt-2 text-sm text-rose-300">{evaluationError}</p>
        ) : evaluation ? (
          <div className="mt-3 grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
            <p>
              <span className="text-zinc-400">Samples:</span> {evaluation.total}
            </p>
            <p>
              <span className="text-zinc-400">Malicious Ratio:</span>{' '}
              {evaluation.classBalance.maliciousRatioPct}%
            </p>
            <p>
              <span className="text-zinc-400">Precision (Block):</span>{' '}
              {evaluation.policyMetrics.blockOnly.precision}%
            </p>
            <p>
              <span className="text-zinc-400">Recall (Block):</span>{' '}
              {evaluation.policyMetrics.blockOnly.recall}%
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
