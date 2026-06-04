'use client';

import {motion} from 'motion/react';
import {useTranslations} from 'next-intl';

export default function ServicesSection() {
  const t = useTranslations('services');

  const services = [
    {
      title: t('addressPoisoningTitle'),
      body: t('addressPoisoningBody')
    },
    {
      title: t('contractAuditTitle'),
      body: t('contractAuditBody')
    },
    {
      title: t('riskScoringTitle'),
      body: t('riskScoringBody')
    }
  ];

  return (
    <section className="glass-panel p-6 md:p-7">
      <h2 className="section-title">{t('title')}</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {services.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.3}}
            transition={{delay: index * 0.08}}
            className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-4"
          >
            <h3 className="text-lg font-semibold text-white">{service.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{service.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
