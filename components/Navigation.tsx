'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();

  const links = [
    {href: `/${locale}`, label: t('home')},
    {href: `/${locale}/dashboard`, label: t('dashboard')},
    {href: `/${locale}/developers`, label: t('developers')},
    {href: `/${locale}/usage`, label: t('usage')}
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-zinc-950/80 backdrop-blur-lg">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-base font-semibold tracking-wide text-white">
          UAE7Guard
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-200 transition-colors hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
