import {cookies} from 'next/headers';
import Navigation from '@/components/Navigation';
import NotificationSettings from '@/components/NotificationSettings';
import TransactionSimulator from '@/components/TransactionSimulator';
import UsageDashboardSection from '@/components/UsageDashboardSection';
import Web3WalletAnalyzer from '@/components/Web3WalletAnalyzer';
import {ADMIN_SESSION_COOKIE_NAME, hasUsageAdminAccessFromCandidate} from '@/lib/tenant-auth';
import {getTranslations} from 'next-intl/server';

type DashboardPageProps = {
  params: Promise<{locale: string}>;
};

const liveThreats = [
  {id: 'th-9081', chain: 'Ethereum', severity: 'high', signal: 'Address poisoning cluster'},
  {id: 'th-9074', chain: 'Arbitrum', severity: 'medium', signal: 'Suspicious router approvals'},
  {id: 'th-9059', chain: 'Base', severity: 'low', signal: 'Dormant wallet activation spike'}
];

export const dynamic = 'force-dynamic';

export default async function DashboardPage({params}: DashboardPageProps) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'dashboard'});
  const cookieStore = await cookies();
  const canAccessUsage = hasUsageAdminAccessFromCandidate(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null
  );

  return (
    <main className="relative min-h-screen pb-16">
      <Navigation />
      <div className="container-shell space-y-8 pt-8">
        <section className="glass-panel p-6">
          <h1 className="section-title">{t('title')}</h1>
          <p className="text-zinc-300">{t('subtitle')}</p>
        </section>

        <Web3WalletAnalyzer />
        <TransactionSimulator />
        <NotificationSettings />
        {canAccessUsage ? <UsageDashboardSection /> : null}

        <section className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">{t('liveThreatsTitle')}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {liveThreats.map((threat) => (
              <article key={threat.id} className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">{threat.id}</p>
                <p className="mt-1 font-semibold text-white">{threat.signal}</p>
                <p className="mt-2 text-sm text-zinc-300">{threat.chain}</p>
                <p className="mt-1 text-sm text-emerald-300">{threat.severity.toUpperCase()}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
