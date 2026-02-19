import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for
  // - API routes (/api/*)
  // - Next.js internals (/_next/*, /_vercel/*)
  // - Static files (files with extensions like favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
