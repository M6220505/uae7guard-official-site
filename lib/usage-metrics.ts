import {getDistributedKvRuntimeInfo, redisIncrWithExpiry} from '@/lib/distributed-kv';

export type UsageOutcome =
  | 'success'
  | 'validation_error'
  | 'auth_error'
  | 'rate_limited'
  | 'quota_blocked'
  | 'server_error';

type TenantRecord = {
  tenantId: string;
  total: number;
  success: number;
  validationErrors: number;
  authErrors: number;
  rateLimited: number;
  quotaBlocked: number;
  serverErrors: number;
  lastRequestAt?: string;
  decisions: Record<string, number>;
  riskLevels: Record<string, number>;
  latencySamples: number[];
};

type DailyQuotaBucket = {
  count: number;
  blocked: number;
  resetAt: number;
};

const MAX_SAMPLES = 200;
const tenants = new Map<string, TenantRecord>();
const quotaBuckets = new Map<string, DailyQuotaBucket>();
const QUOTA_PREFIX = process.env.ANALYZE_QUOTA_PREFIX?.trim() || 'analyze:quota';

function ensureTenant(tenantId: string): TenantRecord {
  const existing = tenants.get(tenantId);
  if (existing) return existing;

  const created: TenantRecord = {
    tenantId,
    total: 0,
    success: 0,
    validationErrors: 0,
    authErrors: 0,
    rateLimited: 0,
    quotaBlocked: 0,
    serverErrors: 0,
    decisions: {},
    riskLevels: {},
    latencySamples: []
  };

  tenants.set(tenantId, created);
  return created;
}

function midnightUtcTimestamp(now = Date.now()) {
  const date = new Date(now);
  const resetAt = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return resetAt;
}

function quotaKey(tenantId: string, now = Date.now()) {
  const date = new Date(now).toISOString().slice(0, 10);
  return `${tenantId}:${date}`;
}

function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx] ?? 0;
}

export async function consumeDailyQuota(tenantId: string, dailyQuota: number | null) {
  if (!dailyQuota || dailyQuota <= 0) {
    return {
      allowed: true,
      remaining: null as number | null,
      resetAt: midnightUtcTimestamp()
    };
  }

  const now = Date.now();
  const key = quotaKey(tenantId, now);
  const resetAt = midnightUtcTimestamp(now);
  const kv = getDistributedKvRuntimeInfo();

  if (kv.enabled) {
    const redisKey = `${QUOTA_PREFIX}:${key}`;
    const ttlSeconds = Math.max(60, Math.ceil((resetAt - now) / 1000) + 3_600);
    const count = await redisIncrWithExpiry(redisKey, ttlSeconds);

    if (typeof count === 'number') {
      if (count > dailyQuota) {
        return {
          allowed: false,
          remaining: 0,
          resetAt
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, dailyQuota - count),
        resetAt
      };
    }
  }

  const existing = quotaBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    quotaBuckets.set(key, {
      count: 1,
      blocked: 0,
      resetAt
    });

    return {
      allowed: true,
      remaining: Math.max(0, dailyQuota - 1),
      resetAt
    };
  }

  if (existing.count >= dailyQuota) {
    existing.blocked += 1;
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, dailyQuota - existing.count),
    resetAt: existing.resetAt
  };
}

export function recordAnalyzeUsage(input: {
  tenantId: string;
  outcome: UsageOutcome;
  latencyMs: number;
  decision?: string;
  riskLevel?: string;
}) {
  const tenant = ensureTenant(input.tenantId);
  tenant.total += 1;
  tenant.lastRequestAt = new Date().toISOString();

  tenant.latencySamples.push(Math.max(0, Math.round(input.latencyMs)));
  if (tenant.latencySamples.length > MAX_SAMPLES) {
    tenant.latencySamples.shift();
  }

  if (input.outcome === 'success') tenant.success += 1;
  if (input.outcome === 'validation_error') tenant.validationErrors += 1;
  if (input.outcome === 'auth_error') tenant.authErrors += 1;
  if (input.outcome === 'rate_limited') tenant.rateLimited += 1;
  if (input.outcome === 'quota_blocked') tenant.quotaBlocked += 1;
  if (input.outcome === 'server_error') tenant.serverErrors += 1;

  if (input.decision) {
    tenant.decisions[input.decision] = (tenant.decisions[input.decision] ?? 0) + 1;
  }

  if (input.riskLevel) {
    tenant.riskLevels[input.riskLevel] = (tenant.riskLevels[input.riskLevel] ?? 0) + 1;
  }
}

export function getUsageSnapshot() {
  const entries = [...tenants.values()].map((tenant) => ({
    tenantId: tenant.tenantId,
    total: tenant.total,
    success: tenant.success,
    validationErrors: tenant.validationErrors,
    authErrors: tenant.authErrors,
    rateLimited: tenant.rateLimited,
    quotaBlocked: tenant.quotaBlocked,
    serverErrors: tenant.serverErrors,
    decisions: tenant.decisions,
    riskLevels: tenant.riskLevels,
    latencyMs: {
      p50: percentile(tenant.latencySamples, 50),
      p95: percentile(tenant.latencySamples, 95)
    },
    lastRequestAt: tenant.lastRequestAt
  }));

  entries.sort((a, b) => b.total - a.total);

  return {
    generatedAt: new Date().toISOString(),
    tenants: entries,
    tenantCount: entries.length
  };
}
