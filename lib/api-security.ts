import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = Number(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS ?? process.env.API_RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.ANALYZE_RATE_LIMIT_MAX_REQUESTS ?? process.env.API_RATE_LIMIT_MAX ?? 30);
const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientId(request: NextRequest): string {
  const forwardedChain = request.headers.get('x-forwarded-for')?.split(',').map((ip) => ip.trim()).filter(Boolean);
  const forwardedFor = forwardedChain?.[forwardedChain.length - 1];
  const realIp = request.headers.get('x-real-ip')?.trim();
  const apiKey = request.headers.get('x-api-key')?.trim();

  return apiKey ? `key:${apiKey}` : `ip:${forwardedFor || realIp || 'unknown'}`;
}

export function enforceRateLimit(request: NextRequest) {
  const clientId = getClientId(request);
  const now = Date.now();
  const current = buckets.get(clientId);

  if (!current || current.resetAt <= now) {
    buckets.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (current.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(current.resetAt / 1000)),
        },
      }
    );
  }

  current.count += 1;
  buckets.set(clientId, current);
  return null;
}

export function enforceApiAuthentication(request: NextRequest) {
  const requiredKey = process.env.ANALYZE_API_KEY || process.env.UAE7GUARD_API_KEY;

  if (!requiredKey) {
    return null;
  }

  const providedKey = request.headers.get('x-api-key')?.trim();

  if (providedKey === requiredKey) {
    return null;
  }

  return NextResponse.json(
    {
      error: 'Unauthorized',
      message: 'Provide a valid x-api-key header.',
    },
    { status: 401 }
  );
}

export function isEvmAddress(address: unknown): address is `0x${string}` {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}
