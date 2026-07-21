const scoringBands = [
  { label: '0-25 Low', description: 'Normal wallet/contract behavior with no strong threat signals.' },
  { label: '26-50 Moderate', description: 'Some caution signals such as low age, low history, or incomplete data.' },
  { label: '51-75 High', description: 'Multiple suspicious signals, risky approvals, or contract concerns.' },
  { label: '76-100 Critical', description: 'Known threat intelligence, blacklist hits, or dangerous pre-sign effects.' },
];

const owaspMappings = [
  'Access control problems → owner/admin pattern review and unverified privilege risk.',
  'Oracle manipulation → DeFi/price-source interaction flagging roadmap.',
  'Reentrancy → external call and value-transfer pattern detection.',
  'Flash loan abuse → flash-loan method and high-velocity transaction heuristics.',
  'Bad randomness → randomness-source keyword review in verified source.',
  'Dangerous external calls → DELEGATECALL, CALLCODE, SELFDESTRUCT opcode checks.',
  'Logic errors → transparent limitations and manual review escalation.',
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-24 text-white">
      <section className="mx-auto max-w-5xl space-y-12">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Trust center</p>
          <h1 className="text-4xl font-bold md:text-6xl">Security methodology and scoring explanation</h1>
          <p className="mt-6 max-w-3xl text-lg text-zinc-400">
            UAE7Guard combines live RPC reads, explorer context, approval history, contract analysis, and configured threat feeds. Scores are decision-support signals, not a guarantee and not financial advice.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {scoringBands.map((band) => (
            <article key={band.label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold text-emerald-300">{band.label}</h2>
              <p className="mt-3 text-zinc-400">{band.description}</p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">OWASP smart-contract mapping</h2>
          <ul className="mt-4 space-y-3 text-zinc-300">
            {owaspMappings.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <h2 className="text-2xl font-bold text-yellow-300">Important disclaimer</h2>
          <p className="mt-3 text-yellow-100">
            UAE7Guard does not promise perfect detection. Attackers change tactics quickly, and missing API keys or rate limits can reduce context. Treat reports as security guidance and verify high-value actions manually.
          </p>
        </section>
      </section>
    </main>
  );
}
