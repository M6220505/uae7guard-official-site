export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-24 text-white">
      <section className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold md:text-6xl">Privacy and data retention</h1>
        <p className="text-lg text-zinc-400">UAE7Guard is designed to minimize retained user data. Wallet addresses and transaction payloads are processed to produce risk decisions and should not be treated as private blockchain data.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold">Retention</h2><p className="mt-3 text-zinc-400">Production deployments should retain API logs only as long as needed for abuse prevention, debugging, and compliance.</p></div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-bold">Not financial advice</h2><p className="mt-3 text-zinc-400">Risk reports are technical security signals and are not investment, legal, tax, or financial advice.</p></div>
        </div>
        <p className="text-zinc-400">Incident response contact: security@uae7guard.com</p>
      </section>
    </main>
  );
}
