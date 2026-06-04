import {cookies} from 'next/headers';
import Navigation from '@/components/Navigation';
import AdminKeyGate from '@/components/AdminKeyGate';
import UsageConsole from '@/components/UsageConsole';
import {evaluateDefaultDataset} from '@/lib/label-evaluator.mjs';
import {
  ADMIN_SESSION_COOKIE_NAME,
  getUsageAdminPolicy,
  hasUsageAdminAccessFromCandidate
} from '@/lib/tenant-auth';
import {getUsageSnapshot} from '@/lib/usage-metrics';
import {getTranslations} from 'next-intl/server';

export const dynamic = 'force-dynamic';

type UsagePageProps = {
  params: Promise<{locale: string}>;
};

export default async function UsagePage({params}: UsagePageProps) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'usage'});
  const cookieStore = await cookies();
  const policy = getUsageAdminPolicy();
  const adminCandidate = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;
  const canAccess = hasUsageAdminAccessFromCandidate(adminCandidate);

  const unavailableMessage =
    !policy.keyConfigured && policy.enforced
      ? 'Admin key is required in production but ANALYZE_ADMIN_KEY is not configured.'
      : null;

  if (!canAccess) {
    return (
      <main className="relative min-h-screen pb-16">
        <Navigation />
        <div className="container-shell space-y-8 pt-8">
          <section className="glass-panel p-6">
            <h1 className="section-title">{t('title')}</h1>
            <p className="text-zinc-300">{t('subtitle')}</p>
          </section>

          <AdminKeyGate
            title="Admin Access Required"
            description="Usage metrics are protected. Provide the admin key to continue."
            unavailableMessage={unavailableMessage}
          />
        </div>
      </main>
    );
  }

  const usage = getUsageSnapshot();

  let evaluation: ReturnType<typeof evaluateDefaultDataset> | null = null;
  let evaluationError: string | null = null;

  try {
    evaluation = evaluateDefaultDataset();
  } catch (error) {
    evaluationError = error instanceof Error ? error.message : 'Evaluation unavailable';
  }

  return (
    <main className="relative min-h-screen pb-16">
      <Navigation />
      <div className="container-shell space-y-8 pt-8">
        <section className="glass-panel p-6">
          <h1 className="section-title">{t('title')}</h1>
          <p className="text-zinc-300">{t('subtitle')}</p>
        </section>

        <UsageConsole usage={usage} evaluation={evaluation} evaluationError={evaluationError} />
      </div>
    </main>
  );
}
