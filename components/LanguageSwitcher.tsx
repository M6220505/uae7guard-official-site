'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    setMounted(true);
    // Detect current locale from pathname
    const currentLocale = pathname.startsWith('/ar') ? 'ar' : 'en';
    setLocale(currentLocale);
  }, [pathname]);

  const toggleLanguage = () => {
    const newLang = locale === 'en' ? 'ar' : 'en';
    const newPathname = pathname.replace(`/${locale}`, `/${newLang}`);
    router.push(newPathname);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  if (!mounted) return null;

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated border border-zinc-800 hover:border-emerald-500 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-sm font-medium text-zinc-300">
        {locale === 'en' ? 'العربية' : 'English'}
      </span>
      <svg
        className="w-4 h-4 text-emerald-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    </motion.button>
  );
}
