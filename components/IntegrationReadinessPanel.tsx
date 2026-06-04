import {getIntegrationStatus} from '@/lib/integration-status';

const statusStyles = {
  ready: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  missing: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  optional: 'border-amber-500/40 bg-amber-500/10 text-amber-100'
};

export default function IntegrationReadinessPanel() {
  const readiness = getIntegrationStatus();

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Production Readiness</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Integration Control Plane</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Required Web3 keys and optional intelligence providers are checked at runtime without
            exposing secret values.
          </p>
        </div>

        <div className="min-w-32 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-center">
          <p className="text-xs uppercase text-cyan-100">Readiness</p>
          <p className="mt-1 text-3xl font-semibold text-white">{readiness.readinessScore}%</p>
          <p className="mt-1 text-xs text-cyan-100">
            {readiness.requiredReady}/{readiness.requiredTotal} required
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {readiness.checks.map((check) => (
          <article key={check.id} className="rounded-lg border border-zinc-700/70 bg-zinc-950/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{check.label}</p>
                <p className="mt-1 text-xs uppercase text-zinc-500">{check.category}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[check.status]}`}>
                {check.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{check.impact}</p>
            <p className="mt-3 text-xs text-zinc-500">{check.env.join(', ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
