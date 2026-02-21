'use client';

import {motion} from 'framer-motion';
import Link from 'next/link';
import {useTranslations} from 'next-intl';

type HeroSectionProps = {
  locale: string;
};

export default function HeroSection({locale}: HeroSectionProps) {
  const t = useTranslations('hero');

  const metrics = [
    {label: t('statDetection'), value: '100%'},
    {label: t('statLatency'), value: '<100ms'},
    {label: t('statCoverage'), value: '24/7'}
  ];

  return (
    <section className="glass-panel overflow-hidden p-7 md:p-10">
      <motion.div
        initial={{opacity: 0, y: 24}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.45}}
        className="space-y-6"
      >
        <span className="metric-pill">{t('badge')}</span>

        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
          {t('title')}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
          {t('subtitle')}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a href="#scanner" className="cta-btn">
            {t('primaryCta')}
          </a>
          <Link href={`/${locale}/dashboard`} className="cta-btn-secondary">
            {t('secondaryCta')}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <motion.article
              key={metric.label}
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.12 + index * 0.09}}
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/70 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-zinc-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{metric.value}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
