import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './i18n';

// Next.js 16 renamed the `middleware` file convention to `proxy`.
// next-intl's request handler signature is unchanged, so this is a 1:1 move.
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
