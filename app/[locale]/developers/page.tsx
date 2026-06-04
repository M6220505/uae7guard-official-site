import Navigation from '@/components/Navigation';
import {getTranslations} from 'next-intl/server';

type DevelopersPageProps = {
  params: Promise<{locale: string}>;
};

const requestExample = `POST /api/analyze
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "from": "0x1111111111111111111111111111111111111111",
  "chainId": 1,
  "data": "0x095ea7b3000000000000000000000000...",
  "transactionValue": 1.5,
  "historicalAddresses": [
    "0x1111111111111111111111111111111111111111"
  ]
}`;

const responseExample = `{
  "riskScore": 25,
  "riskLevel": "low",
  "decision": "ALLOW",
  "confidence": 87,
  "threatType": "STANDARD",
  "latencyMs": 32,
  "simulation": {
    "status": "ok",
    "source": "server"
  }
}`;

export default async function DevelopersPage({params}: DevelopersPageProps) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'developers'});

  return (
    <main className="relative min-h-screen pb-16">
      <Navigation />
      <div className="container-shell space-y-8 pt-8">
        <section className="glass-panel p-6">
          <h1 className="section-title">{t('title')}</h1>
          <p className="text-zinc-300">{t('subtitle')}</p>
        </section>

        <section className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">{t('apiTitle')}</h2>
          <p className="mt-2 text-zinc-300">{t('apiBody')}</p>
          <pre className="mt-4 overflow-auto rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-4 text-sm text-emerald-200">
            <code>{requestExample}</code>
          </pre>
          <pre className="mt-4 overflow-auto rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-4 text-sm text-cyan-200">
            <code>{responseExample}</code>
          </pre>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white">{t('sdkTitle')}</h3>
            <p className="mt-2 text-zinc-300">{t('sdkBody')}</p>
          </article>
          <article className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white">{t('docsTitle')}</h3>
            <p className="mt-2 text-zinc-300">{t('docsBody')}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
