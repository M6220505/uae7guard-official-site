import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const isProduction = process.env.NODE_ENV === 'production';
const scriptSrc = isProduction
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server (.next/standalone/server.js)
  // for Docker / VPS / any non-Vercel host. Run with `node server.js`.
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  // Turbopack is the default bundler in Next.js 16. These aliases stub out
  // optional native/logging deps that the Web3 stack may probe for.
  turbopack: {
    resolveAlias: {
      '@react-native-async-storage/async-storage': './lib/stubs/async-storage.ts',
      'pino-pretty': './lib/stubs/pino-pretty.ts'
    }
  },
  async headers() {
    const securityHeaders = [
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'X-Frame-Options', value: 'DENY'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
      {key: 'Cross-Origin-Resource-Policy', value: 'same-site'},
      {key: 'Content-Security-Policy', value: csp}
    ];

    if (isProduction) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

export default withNextIntl(nextConfig);
