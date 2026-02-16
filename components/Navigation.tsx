'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Remove the current locale and add the new one
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300">
              U7
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              UAE7Guard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}#scanner`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {t('scanner')}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {t('dashboard')}
            </Link>
            <Link
              href={`/${locale}/developers`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {t('developers')}
            </Link>
            <Link
              href={`/${locale}/developers#docs`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {t('docs')}
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              aria-label="Toggle language"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-semibold text-sm">{locale === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* Connect Wallet Button */}
            <ConnectButton />

            <Link
              href={`/${locale}/developers`}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300"
            >
              {t('getApiKey')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 pb-4 space-y-4"
          >
            <Link
              href={`/${locale}#scanner`}
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('scanner')}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              href={`/${locale}/developers`}
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('developers')}
            </Link>
            <Link
              href={`/${locale}/developers#docs`}
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('docs')}
            </Link>

            {/* Mobile Language Toggle */}
            <button
              onClick={() => {
                toggleLocale();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-semibold">{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Mobile Connect Wallet */}
            <div className="py-2">
              <ConnectButton />
            </div>

            <Link
              href={`/${locale}/developers`}
              className="block px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('getApiKey')}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
