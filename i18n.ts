import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async ({locale}) => {
  const requestedLocale = locale ?? defaultLocale;
  const finalLocale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default
  };
});
