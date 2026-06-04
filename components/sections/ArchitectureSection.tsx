'use client';

import {useTranslations} from 'next-intl';

export default function ArchitectureSection() {
  const t = useTranslations('architecture');

  const pipeline = [t('p1'), t('p2'), t('p3'), t('p4')];

  return (
    <section className="glass-panel p-6 md:p-7">
      <h2 className="section-title">{t('title')}</h2>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4">
          <h3 className="text-lg font-semibold text-white">{t('pipelineTitle')}</h3>
          <ol className="mt-3 space-y-2 text-sm text-zinc-300">
            {pipeline.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-700/70 text-xs text-cyan-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-4">
          <h3 className="text-lg font-semibold text-white">{t('stackTitle')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{t('stackBody')}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {['Next.js 15', 'TypeScript', 'Tailwind v4', 'Wagmi', 'Web3 API', 'next-intl'].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-700/70 bg-emerald-900/20 px-3 py-1 text-emerald-200"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
