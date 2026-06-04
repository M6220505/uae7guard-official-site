'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === 'en' ? 'ar' : 'en';

  function onToggleLanguage() {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    const nextPath = segments.join('/') || `/${nextLocale}`;
    router.push(nextPath);
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 hover:border-cyan-400/70"
      onClick={onToggleLanguage}
      aria-label={t('switchLanguage')}
    >
      {locale === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
