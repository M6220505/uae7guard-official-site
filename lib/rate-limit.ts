import {getDistributedKvRuntimeInfo, redisIncrWithExpiry} from '@/lib/distributed-kv';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitInput = {
  key: string;
  windowMs?: number;
  maxRequests?: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.ANALYZE_RATE_LIMIT_MAX_REQUESTS ?? 60);
const SWEEP_INTERVAL_MS = 5 * 60_000;
const RATE_LIMIT_PREFIX = process.env.ANALYZE_RATE_LIMIT_PREFIX?.trim() || 'analyze:rl';

let lastSweep = 0;

function sweepExpired(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function extractClientIp(request: Request): string {
  const cloudflareIp = request.headers.get('cf-connecting-ip');
  if (cloudflareIp?.trim()) return cloudflareIp.trim();

  const flyClientIp = request.headers.get('fly-client-ip');
  if (flyClientIp?.trim()) return flyClientIp.trim();

  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp?.trim()) return trueClientIp.trim();

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp?.trim()) return xRealIp.trim();

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  return 'unknown';
}

function consumeAnalyzeRateLimitInMemory(input: string | RateLimitInput): RateLimitResult {
  const key = typeof input === 'string' ? input : input.key;
  const windowMs = typeof input === 'string' ? WINDOW_MS : input.windowMs ?? WINDOW_MS;
  const maxRequests =
    typeof input === 'string' ? MAX_REQUESTS : input.maxRequests ?? MAX_REQUESTS;

  const now = Date.now();
  sweepExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {count: 1, resetAt: now + windowMs});
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000)
    };
  }

  existing.count += 1;

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  };
}

function buildRedisWindowKey(rawKey: string, windowMs: number, now: number) {
  const bucketStart = Math.floor(now / windowMs) * windowMs;
  return {
    key: `${RATE_LIMIT_PREFIX}:${bucketStart}:${rawKey}`,
    resetAt: bucketStart + windowMs
  };
}

export async function consumeAnalyzeRateLimit(input: string | RateLimitInput): Promise<RateLimitResult> {
  const key = typeof input === 'string' ? input : input.key;
  const windowMs = typeof input === 'string' ? WINDOW_MS : input.windowMs ?? WINDOW_MS;
  const maxRequests =
    typeof input === 'string' ? MAX_REQUESTS : input.maxRequests ?? MAX_REQUESTS;

  const now = Date.now();
  const kv = getDistributedKvRuntimeInfo();

  if (kv.enabled) {
    const redisWindow = buildRedisWindowKey(key, windowMs, now);
    const ttlSeconds = Math.max(1, Math.ceil((redisWindow.resetAt - now) / 1000) + 5);
    const count = await redisIncrWithExpiry(redisWindow.key, ttlSeconds);

    if (typeof count === 'number') {
      if (count > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((redisWindow.resetAt - now) / 1000))
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - count),
        retryAfterSeconds: Math.max(1, Math.ceil((redisWindow.resetAt - now) / 1000))
      };
    }
  }

  return consumeAnalyzeRateLimitInMemory(input);
}

export function getAnalyzeRateLimitConfig() {
  const kv = getDistributedKvRuntimeInfo();
  return {
    windowMs: WINDOW_MS,
    maxRequests: MAX_REQUESTS,
    backend: kv.backend
  };
}
