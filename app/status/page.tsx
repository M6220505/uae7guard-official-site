const checks = [
  { name: 'Wallet risk API', status: 'Operational', detail: 'Rate-limited API with optional x-api-key authentication.' },
  { name: 'Live RPC reads', status: 'Configuration dependent', detail: 'Uses configured Alchemy/custom RPC or default public transports.' },
  { name: 'Explorer enrichment', status: 'Configuration dependent', detail: 'Requires Etherscan-family API keys for history, approvals, and verification.' },
  { name: 'Commercial AML feeds', status: 'Optional', detail: 'Requires Chainalysis/TRM/Forta credentials in production.' },
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-24 text-white">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold md:text-6xl">API status</h1>
        <div className="mt-10 space-y-4">
          {checks.map((check) => (
            <div key={check.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <h2 className="text-xl font-bold">{check.name}</h2>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">{check.status}</span>
              </div>
              <p className="mt-3 text-zinc-400">{check.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
