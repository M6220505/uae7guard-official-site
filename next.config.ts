import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
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

type WebpackConfigLike = {
  resolve?: {
    alias?: Record<string, string> | unknown;
  };
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingRoot: workspaceRoot,
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
  },
  webpack: (config: WebpackConfigLike) => {
    config.resolve = config.resolve ?? {};
    const aliases = (config.resolve.alias ?? {}) as Record<string, string>;
    aliases['@react-native-async-storage/async-storage'] = path.join(
      workspaceRoot,
      'lib/stubs/async-storage.ts'
    );
    aliases['pino-pretty'] = path.join(
      workspaceRoot,
      'lib/stubs/pino-pretty.ts'
    );
    config.resolve.alias = aliases;
    return config;
  }
};

export default withNextIntl(nextConfig);
