'use client';

export default function RiskReportPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-24 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Shareable report</p>
            <h1 className="text-4xl font-bold md:text-6xl">Professional wallet risk report</h1>
            <p className="mt-4 max-w-2xl text-zinc-400">Export-ready layout for compliance reviews, user support, and business/API customers.</p>
          </div>
          <button type="button" onClick={() => globalThis.print()} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-black">Export / Print PDF</button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {['Risk score', 'Threat intelligence', 'Data quality'].map((title) => (
            <article key={title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 text-zinc-400">Connect this page to stored scan output or pass report data through query/session state in the next product sprint.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
